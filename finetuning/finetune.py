import argparse
import subprocess
import sys
import os
from PIL import Image
import torch

def setup():
    """Install dependencies and prepare folder structure."""
    print("Setting up folders...")
    os.makedirs("data/raw", exist_ok=True)
    os.makedirs("data/processed", exist_ok=True)
    os.makedirs("checkpoints", exist_ok=True)
    
    print("Installing requirements (this may take a while)...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)

def prepare():
    """Run the data preparation script."""
    print("Running data preparation...")
    subprocess.run([sys.executable, "scripts/prepare_data.py"], check=True)

def train():
    """Run the fine-tuning script."""
    print("Starting training process...")
    subprocess.run([sys.executable, "scripts/train.py"], check=True)

def infer(image_path, prompt):
    """Run inference using the fine-tuned adapters."""
    from unsloth import FastVisionModel
    
    print(f"Loading model from checkpoints/medgemma_final_lora...")
    model, processor = FastVisionModel.from_pretrained(
        "checkpoints/medgemma_final_lora",
        load_in_4bit = True,
    )
    FastVisionModel.for_inference(model) # Enable inference optimizations

    image = Image.open(image_path)
    messages = [
        {"role": "user", "content": [
            {"type": "image"},
            {"type": "text", "text": prompt}
        ]}
    ]
    
    input_text = processor.apply_chat_template(messages, add_generation_prompt=True)
    inputs = processor(image, input_text, return_tensors="pt").to("cuda")

    outputs = model.generate(**inputs, max_new_tokens=256)
    result = processor.decode(outputs[0], skip_special_tokens=True)
    
    print("-" * 30)
    print(f"PROMPT: {prompt}")
    print(f"RESPONSE: {result}")
    print("-" * 30)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MedGemma 1.5 Unsloth Master CLI")
    parser.add_argument("--mode", choices=["setup", "prepare", "train", "infer", "full"], default="full")
    parser.add_argument("--image", type=str, help="Path to image for inference")
    parser.add_argument("--prompt", type=str, default="Identify the medical condition in this image.", help="Inference prompt")

    args = parser.parse_args()

    if args.mode == "setup":
        setup()
    elif args.mode == "prepare":
        prepare()
    elif args.mode == "train":
        train()
    elif args.mode == "infer":
        if not args.image:
            print("Error: --image path is required for inference mode.")
        else:
            infer(args.image, args.prompt)
    elif args.mode == "full":
        setup()
        prepare()
        train()
        print("Workflow complete.")
