import json
import os
from PIL import Image
import random

def format_data(image_path, question, answer):
    """Formats data for Unsloth FastVisionModel."""
    return {
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "image"},
                    {"type": "text", "text": question}
                ]
            },
            {
                "role": "assistant",
                "content": [
                    {"type": "text", "text": answer}
                ]
            }
        ],
        "image": image_path 
    }

def main():
    base_path = "data/raw/clinical-skin-disease-images"
    processed_data = []
    
    # Check if the dataset directory exists
    if not os.path.exists(base_path):
        print(f"Error: Dataset not found at {base_path}")
        return

    # Categories are subfolders in this dataset
    categories = [d for d in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, d)) and not d.startswith('.')]
    
    print(f"Found categories: {categories}")

    for category in categories:
        cat_path = os.path.join(base_path, category)
        # Get all image files (jpg, jpeg, png)
        images = [f for f in os.listdir(cat_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        # We'll take a balanced sample or all of them depending on scale
        # For initial testing, let's limit to 100 per category to keep it fast
        sample_size = min(len(images), 100)
        sampled_images = random.sample(images, sample_size)
        
        for img_name in sampled_images:
            img_path = os.path.join(cat_path, img_name)
            
            # Diverse medical questions for skin disease
            questions = [
                f"What skin condition is presented in this clinical image?",
                f"Analyze this dermatology case and provide a potential diagnosis.",
                f"Looking at this image, what are the primary clinical features of this lesion?",
                f"Identify the skin disease shown here."
            ]
            
            question = random.choice(questions)
            # The answer is derived from the category name
            answer = f"The clinical presentation is consistent with {category.replace('_', ' ')}."
            
            processed_data.append(format_data(img_path, question, answer))

    # Shuffle the entire dataset
    random.shuffle(processed_data)
    
    # Split into train/eval (90/10)
    split_idx = int(len(processed_data) * 0.9)
    train_data = processed_data[:split_idx]
    eval_data = processed_data[split_idx:]

    os.makedirs("data/processed", exist_ok=True)
    
    with open("data/processed/train.jsonl", "w") as f:
        for entry in train_data:
            f.write(json.dumps(entry) + "\n")
            
    with open("data/processed/eval.jsonl", "w") as f:
        for entry in eval_data:
            f.write(json.dumps(entry) + "\n")
            
    print(f"Successfully processed {len(processed_data)} samples.")
    print(f"Train: {len(train_data)} | Eval: {len(eval_data)}")

if __name__ == "__main__":
    main()
