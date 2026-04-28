import os
import torch
from unsloth import FastVisionModel, is_bfloat16_supported
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset
from unsloth.chat_templates import get_chat_template
from PIL import Image

# --- EXTREME MEMORY CONFIG FOR 8GB VRAM ---
MODEL_NAME = "google/medgemma-1.5-4b-it"
OUTPUT_DIR = "checkpoints/medgemma_8gb_optimized"

def train_8gb():
    # 1. Load Model with Extreme Quantization
    # We use 4-bit with Unsloth's optimized loader
    model, processor = FastVisionModel.from_pretrained(
        model_name = MODEL_NAME,
        load_in_4bit = True,
        use_gradient_checkpointing = "unsloth", # Saves massive VRAM
    )

    # 2. Add Aggressive LoRA Adapters
    model = FastVisionModel.get_peft_model(
        model,
        finetune_vision_layers     = True, 
        finetune_language_layers   = True,
        finetune_attention_adapters = True,
        finetune_mlp_adapters       = True,
        r = 8,             # Reduced rank to 8 to save VRAM
        lora_alpha = 16,   # Alpha 16 (2x Rank)
        lora_dropout = 0,
        bias = "none",
        random_state = 3407,
        target_modules = ["q_proj", "k_proj", "v_proj", "o_proj"], # Limited targets for 8GB
    )

    # 3. Load & Process Dataset
    dataset = load_dataset("json", data_files={"train": "data/processed/train.jsonl"}, split="train")
    processor = get_chat_template(processor, chat_template = "gemma")

    def formatting_prompts_func(examples):
        convos = examples["messages"]
        images = examples["image"]
        texts = [processor.apply_chat_template(convo, tokenize=False, add_generation_prompt=False) for convo in convos]
        return { "text" : texts, "image" : images }

    dataset = dataset.map(formatting_prompts_func, batched = True)

    # 4. Memory-Efficient Data Collator
    def collate_fn(examples):
        texts = [example["text"] for example in examples]
        images = [Image.open(example["image"]).convert("RGB").resize((224, 224)) for example in examples] # Force resize
        batch = processor(text=texts, images=images, return_tensors="pt", padding=True)
        batch["labels"] = batch["input_ids"].clone()
        return batch

    # 5. Extreme Training Arguments for 8GB
    training_args = TrainingArguments(
        output_dir = OUTPUT_DIR,
        per_device_train_batch_size = 1,      # MINIMUM batch size
        gradient_accumulation_steps = 8,      # Compensate for batch size 1
        warmup_steps = 5,
        max_steps = 50,                       # Short run for 8GB stability
        learning_rate = 2e-4,
        fp16 = not is_bfloat16_supported(),
        bf16 = is_bfloat16_supported(),
        logging_steps = 1,
        optim = "paged_adamw_8bit",           # Paged optimizer offloads to RAM if needed
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        save_strategy = "no",                 # Skip checkpoints during run to save disk/RAM
    )

    # 6. Initialize Trainer
    trainer = SFTTrainer(
        model = model,
        tokenizer = processor.tokenizer,
        data_collator = collate_fn,
        train_dataset = dataset,
        dataset_text_field = "text",
        max_seq_length = 1024,                # Limited context window for 8GB
        args = training_args,
    )

    # 7. Start Training
    print("--- Starting EXTREME 8GB VRAM Training ---")
    trainer.train()

    # 8. Final Save
    model.save_pretrained(f"{OUTPUT_DIR}/final")
    print(f"Success! Model saved to {OUTPUT_DIR}/final")

if __name__ == "__main__":
    train_8gb()
