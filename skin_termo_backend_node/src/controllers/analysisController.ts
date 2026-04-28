import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AnalysisHistory, User } from '../models';

const Z_AI_URL = 'https://api.z.ai/api/paas/v4/chat/completions';
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

// Get all available API keys from pool
const API_KEYS = [
  process.env.ZHIPU_API_KEY_1,
  process.env.ZHIPU_API_KEY_2,
  process.env.ZHIPU_API_KEY_3,
  process.env.ZHIPU_API_KEY_4,
  process.env.ZHIPU_API_KEY_5,
  process.env.ZHIPU_API_KEY // Default fallback
].filter(key => !!key) as string[];

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const analyzeSkin = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { image_base64, provider } = req.body;
    
    if (!image_base64) {
      return res.status(400).json({ detail: 'image_base64 is required' });
    }

    const prompt = `You are a highly experienced Dermatologist. Analyze this clinical skin image with precision.
    Focus on: lesion type (macule, papule, etc.), color, distribution, and border characteristics.
    
    Provide a professional assessment in the following JSON format ONLY:
    {
      "disease_name": "Primary suspected condition",
      "confidence": "High/Medium/Low",
      "severity": "Mild/Moderate/Severe",
      "description": "Professional clinical description including differential diagnoses if relevant. End with: 'DISCLAIMER: This is an AI-assisted analysis for informational purposes only. Consult a human specialist.'",
      "symptoms": ["list", "clinical", "signs"],
      "recommendations": ["immediate", "steps", "or", "prevention"],
      "seek_medical_attention": true/false
    }`;

    // Save image to disk once per request
    const filename = `${uuidv4()}.jpg`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(image_base64, 'base64');
    fs.writeFileSync(filepath, buffer);
    const imageUrl = `/uploads/${filename}`;

    let rawContent = "";

    if (provider === 'ollama' || provider === 'jayasimma/skintermo-ai' || provider === 'skintermo-ai') {
      try {
        const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
        const ollamaModel = process.env.OLLAMA_MODEL || "Jayasimma/skintermo-ai";
        console.log(`Routing analysis to local Ollama with model: ${ollamaModel}`);
        
        const ollamaResponse = await axios.post(`${ollamaUrl}/api/generate`, {
          model: ollamaModel,
          prompt: prompt,
          images: [image_base64],
          stream: false,
          format: 'json'
        });
        rawContent = ollamaResponse.data.response;
      } catch (err: any) {
        console.error('Ollama Analysis Error:', err.message);
        return res.status(503).json({ detail: 'Ollama analysis failed: ' + err.message });
      }
    } else {
      const payload = {
        model: "glm-4.6v-flash",
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${image_base64}` }
              }
            ]
          }
        ]
      };

      let response = null;
      let lastError = null;

      // Loop through API Keys if one fails
      for (const key of API_KEYS) {
        try {
          console.log(`Attempting analysis with key ending in ...${key.slice(-4)}`);
          const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
          };
          
          response = await axios.post(Z_AI_URL, payload, { headers, timeout: 60000 });
          if (response.status === 200) break; // Success!
        } catch (error: any) {
          lastError = error;
          console.warn(`Key failed. Rotating...`);
          continue;
        }
      }

      if (!response) {
        throw lastError || new Error('All API Keys failed');
      }
      rawContent = response.data.choices[0].message.content;
    }
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0]);
      
      const history = await AnalysisHistory.create({
        userId: user.id,
        imageUrl,
        diseaseName: parsedJson.disease_name,
        confidence: parsedJson.confidence,
        severity: parsedJson.severity,
        description: parsedJson.description,
        symptoms: parsedJson.symptoms,
        recommendations: parsedJson.recommendations,
        seekMedicalAttention: parsedJson.seek_medical_attention,
      });
      
      parsedJson.image_url = imageUrl;
      return res.json(parsedJson);
    }
    
    return res.json({
      disease_name: "Analysis Failed",
      description: "Could not parse AI response",
      confidence: "N/A",
      severity: "N/A",
      symptoms: [],
      recommendations: ["Try again later"],
      seek_medical_attention: false,
      image_url: imageUrl
    });
    
  } catch (error: any) {
    console.error('Final Analysis Error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const detail = error.response?.data ? `Z.ai Error Pool Exhausted: ${JSON.stringify(error.response.data)}` : error.message;
    return res.status(status).json({ detail });
  }
};

export const getAnalysisHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const history = await AnalysisHistory.findAll({
      where: { userId: user.id },
      order: [['timestamp', 'DESC']],
    });
    return res.json(history);
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};
