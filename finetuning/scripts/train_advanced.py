import os
import torch
from unsloth import FastVisionModel, is_bfloat16_supported
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset
from unsloth.chat_templates import get_chat_template
from PIL import Image

# --- CONFIGURATION ---
MODEL_NAME = "google/medgemma-1.5-4b-it"
USE_QLORA = True # Set to False for standard LoRA (requires more VRAM)
OUTPUT_DIR = "checkpoints/medgemma_advanced"

def train():
    # 1. Load Model & Processor
    # QLoRA (4-bit) is enabled via load_in_4bit=True
    # LoRA (16-bit) is enabled via load_in_4bit=False
    model, processor = FastVisionModel.from_pretrained(
        model_name = MODEL_NAME,
        load_in_4bit = USE_QLORA, 
        use_gradient_checkpointing = "unsloth", 
    )

    # 2. Add PEFT (LoRA/QLoRA) Adapters
    # This is the "Corrected" configuration for MedGemma
    model = FastVisionModel.get_peft_model(
        model,
        finetune_vision_layers     = True, # CRITICAL: Finetunes the MedSigLIP encoder
        finetune_language_layers   = True, # Finetunes the Gemma language head
        finetune_attention_adapters = True,
        finetune_mlp_adapters       = True,
        r = 16,            # Rank: 8, 16, 32, 64 are common
        lora_alpha = 32,   # Alpha: Usually 2x Rank
        lora_dropout = 0,  # 0 is optimized for Unsloth
        bias = "none",
        random_state = 3407,
        # Target all major projection layers for maximum adaptation
        target_modules = [
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj",
        ],
    )

    # 3. Load Dataset
    # Ensure you have run 'python finetune.py --mode prepare' first
    dataset = load_dataset("json", data_files={"train": "data/processed/train.jsonl"}, split="train")

    # 4. Standardize Chat Template
    processor = get_chat_template(processor, chat_template = "gemma")

    def formatting_prompts_func(examples):
        convos = examples["messages"]
        images = examples["image"]
        texts = [processor.apply_chat_template(convo, tokenize=False, add_generation_prompt=False) for convo in convos]
        return { "text" : texts, "image" : images }

    dataset = dataset.map(formatting_prompts_func, batched = True)

    # 5. Data Collator
    def collate_fn(examples):
        texts = [example["text"] for example in examples]
        images = [Image.open(example["image"]) for example in examples]
        batch = processor(text=texts, images=images, return_tensors="pt", padding=True)
        batch["labels"] = batch["input_ids"].clone()
        return batch

    # 6. Optimized Training Arguments
    training_args = TrainingArguments(
        output_dir = OUTPUT_DIR,
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 10,
        max_steps = 100, 
        learning_rate = 2e-4,
        # Automatically use bfloat16 if the hardware supports it (A100/H100/L4)
        fp16 = not is_bfloat16_supported(),
        bf16 = is_bfloat16_supported(),
        logging_steps = 1,
        optim = "paged_adamw_8bit" if USE_QLORA else "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "cosine",
        seed = 3407,
        save_strategy = "steps",
        save_steps = 50,
        report_to = "tensorboard",
    )

    # 7. Initialize Trainer
    trainer = SFTTrainer(
        model = model,
        tokenizer = processor.tokenizer,
        data_collator = collate_fn,
        train_dataset = dataset,
        dataset_text_field = "text",
        max_seq_length = 2048,
        args = training_args,
    )

    # 8. Execution
    print(f"--- Starting {'QLoRA' if USE_QLORA else 'LoRA'} Training ---")
    trainer.train()

    # 9. Save final adapters
    model.save_pretrained(f"{OUTPUT_DIR}/final")
    processor.save_pretrained(f"{OUTPUT_DIR}/final")
    print(f"Model saved to {OUTPUT_DIR}/final")

if __name__ == "__main__":
    train()
