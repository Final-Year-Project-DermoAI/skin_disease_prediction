import os
import torch
from unsloth import FastVisionModel, is_bfloat16_supported
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset
from unsloth.chat_templates import get_chat_template
from PIL import Image

def train_medgemma():
    # 1. Load Model (MedGemma 1.5 4B)
    # MedGemma 1.5 is a multimodal model (MedSigLIP + Gemma)
    model, processor = FastVisionModel.from_pretrained(
        model_name = "google/medgemma-1.5-4b-it",
        load_in_4bit = True,
        use_gradient_checkpointing = "unsloth", 
    )

    # 2. Configure LoRA (Corrected for Multimodal)
    model = FastVisionModel.get_peft_model(
        model,
        finetune_vision_layers     = True, # MUST be True to adapt medical image encoder
        finetune_language_layers   = True,
        finetune_attention_adapters = True,
        finetune_mlp_adapters       = True,
        r = 16,
        lora_alpha = 32,
        lora_dropout = 0,
        bias = "none",
        random_state = 3407,
        target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                         "gate_proj", "up_proj", "down_proj",],
    )

    # 3. Data Processing Pipeline
    dataset = load_dataset("json", data_files={"train": "data/processed/train.jsonl"}, split="train")

    # Corrected chat template for Gemma
    processor = get_chat_template(
        processor,
        chat_template = "gemma", 
    )

    def formatting_prompts_func(examples):
        convos = examples["messages"]
        images = examples["image"]
        texts = [processor.apply_chat_template(convo, tokenize = False, add_generation_prompt = False) for convo in convos]
        return { "text" : texts, "image" : images }

    dataset = dataset.map(formatting_prompts_func, batched = True)

    # 4. Data Collator (Corrected for Vision)
    def collate_fn(examples):
        texts = [example["text"] for example in examples]
        images = [Image.open(example["image"]) for example in examples]
        
        # Tokenize text and process images together
        batch = processor(
            text = texts,
            images = images,
            return_tensors = "pt",
            padding = True,
        )
        
        batch["labels"] = batch["input_ids"].clone()
        return batch

    # 5. Initialize Optimized Trainer
    trainer = SFTTrainer(
        model = model,
        tokenizer = processor.tokenizer,
        data_collator = collate_fn,
        train_dataset = dataset,
        dataset_text_field = "text",
        max_seq_length = 2048,
        args = TrainingArguments(
            per_device_train_batch_size = 2,
            gradient_accumulation_steps = 4,
            warmup_steps = 5,
            max_steps = 100, 
            learning_rate = 2e-4,
            fp16 = not is_bfloat16_supported(),
            bf16 = is_bfloat16_supported(),
            logging_steps = 1,
            optim = "adamw_8bit",
            weight_decay = 0.01,
            lr_scheduler_type = "linear",
            seed = 3407,
            output_dir = "checkpoints/medgemma_output",
            report_to = "tensorboard",
            save_strategy = "steps",
            save_steps = 50,
        ),
    )

    # 6. Execution
    print("--- Starting Corrected Unsloth Fine-tuning for MedGemma ---")
    trainer.train()

    # Save the specialized adapters
    model.save_pretrained("checkpoints/medgemma_final_lora")
    processor.save_pretrained("checkpoints/medgemma_final_lora")
    print("Fine-tuning complete. Model saved to checkpoints/medgemma_final_lora")

if __name__ == "__main__":
    train_medgemma()
