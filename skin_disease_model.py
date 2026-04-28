import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

"""
Skin Disease Prediction Model: CNN-RNN Architecture
- CNN (ResNet50): Feature Extractor for skin images.
- RNN (LSTM): Sequence Decoder for generating diagnostic captions or disease classification.
"""

class SkinEncoderCNN(nn.Module):
    def __init__(self, embed_size=256):
        super(SkinEncoderCNN, self).__init__()
        # Using ResNet50 as the base for feature extraction
        resnet = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        # Remove the final fully connected layer
        modules = list(resnet.children())[:-1]
        self.resnet = nn.Sequential(*modules)
        # Linear layer to map features to embedding size
        self.linear = nn.Linear(resnet.fc.in_features, embed_size)
        self.bn = nn.BatchNorm1d(embed_size, momentum=0.01)

    def forward(self, images):
        with torch.no_grad():
            features = self.resnet(images)
        features = features.view(features.size(0), -1)
        features = self.bn(self.linear(features))
        return features

class SkinDecoderRNN(nn.Module):
    def __init__(self, embed_size, hidden_size, vocab_size, num_layers=1):
        super(SkinDecoderRNN, self).__init__()
        self.embed = nn.Embedding(vocab_size, embed_size)
        self.lstm = nn.LSTM(embed_size, hidden_size, num_layers, batch_first=True)
        self.linear = nn.Linear(hidden_size, vocab_size)

    def forward(self, features, captions):
        # features: [batch_size, embed_size]
        # captions: [batch_size, sequence_length]
        embeddings = self.embed(captions)
        # Combine image features and captions for LSTM input
        inputs = torch.cat((features.unsqueeze(1), embeddings), 1)
        hiddens, _ = self.lstm(inputs)
        outputs = self.linear(hiddens)
        return outputs

    def predict(self, features, vocab, max_len=20):
        """Greedy search for sequence generation."""
        sampled_ids = []
        inputs = features.unsqueeze(1)
        states = None
        
        for i in range(max_len):
            hiddens, states = self.lstm(inputs, states)
            outputs = self.linear(hiddens.squeeze(1))
            predicted = outputs.argmax(1)
            sampled_ids.append(predicted.item())
            
            inputs = self.embed(predicted).unsqueeze(1)
        return sampled_ids

def get_prediction(image_path, encoder, decoder, vocab):
    """Utility function to predict disease from image."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225))
    ])
    
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)
    
    encoder.eval()
    decoder.eval()
    
    with torch.no_grad():
        features = encoder(image)
        output_ids = decoder.predict(features, vocab)
        
    return output_ids

if __name__ == "__main__":
    print("CNN-RNN Architecture for Skin Disease Prediction initialized successfully.")
    # Example Initialization
    embed_size = 256
    hidden_size = 512
    vocab_size = 1000 # Example vocab size
    
    encoder = SkinEncoderCNN(embed_size)
    decoder = SkinDecoderRNN(embed_size, hidden_size, vocab_size)
    
    print(f"Encoder params: {sum(p.numel() for p in encoder.parameters())}")
    print(f"Decoder params: {sum(p.numel() for p in decoder.parameters())}")
