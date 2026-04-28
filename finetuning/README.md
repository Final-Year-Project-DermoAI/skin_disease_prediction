# MedGemma 1.5 Multimodal Fine-Tuning (Unsloth Optimized)

This repository contains an optimized pipeline for fine-tuning **MedGemma 1.5 4B**, Google's premier medical vision-language model. By leveraging **Unsloth**, this implementation achieves significantly faster training speeds and up to 70% reduction in VRAM usage, making it possible to fine-tune on consumer-grade GPUs.

## 🚀 Key Features
- **Multimodal LoRA**: Adapts both the `MedSigLIP` vision encoder and the `Gemma` language head.
- **Unsloth FastVision**: Uses specialized kernels for 2x faster training.
- **4-Bit Quantization**: Ready for GPUs with 16GB VRAM (e.g., T4, L4, RTX 3090/4090).
- **Clinical Dataset Integration**: Pre-configured for the `clinical-skin-disease-images` dataset.

## 📁 Project Structure
- `data/raw/`: Raw clinical images and datasets.
- `data/processed/`: Formatted `train.jsonl` and `eval.jsonl` files.
- `scripts/prepare_data.py`: Converts medical images into the multimodal chat format.
- `scripts/train.py`: The core Unsloth-optimized training engine.
- `finetune.py`: Master CLI to manage the entire lifecycle.

## 🛠️ Step-by-Step Implementation

### 1. Environment Setup
Install the optimized dependencies. Ensure you have NVIDIA drivers and CUDA installed.
```powershell
python finetune.py --mode setup
```

### 2. Data Preparation
The system is configured to scan `data/raw/clinical-skin-disease-images`. It automatically labels images based on their folder names (Eczema, Melanoma, etc.) and generates a train/eval split.
```powershell
python finetune.py --mode prepare
```

### 3. Fine-Tuning
Start the LoRA adaptation. This script uses 4-bit quantization and gradient checkpointing.
```powershell
python finetune.py --mode train
```

### 4. Clinical Inference
Once training is complete, test the model on a new clinical image:
```powershell
python finetune.py --mode infer --image "path/to/test_image.jpg" --prompt "Identify the skin condition."
```

## ⚠️ Requirements
- **GPU**: NVIDIA GPU (16GB+ VRAM recommended).
- **Hugging Face**: You must request access to [google/medgemma-1.5-4b-it](https://huggingface.co/google/medgemma-1.5-4b-it) and run `huggingface-cli login`.

## 🩺 Model Details
MedGemma 1.5 is a decoder-only Transformer optimized for medical reasoning. Unlike general models, it is pre-trained on high-dimensional medical data, making it highly sensitive to clinical features in radiology and dermatology.
