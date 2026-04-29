import { Request, Response } from 'express';
import axios from 'axios';
import { callZhipuAI } from '../utils/aiClient';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession, ChatMessage } from '../models';

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ZHIPU_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export const createChatSession = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title } = req.body;
    
    const session = await ChatSession.create({
      userId: user.id,
      title,
    });
    
    return res.json(session);
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const getChatSessions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const sessions = await ChatSession.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
    });
    
    return res.json(sessions);
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const getChatSessionDetail = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { sessionId } = req.params;
    
    const session = await ChatSession.findOne({
      where: { id: sessionId, userId: user.id },
      include: [{ model: ChatMessage, as: 'messages' }]
    });
    
    if (!session) {
      return res.status(404).json({ detail: 'Session not found' });
    }
    
    return res.json(session);
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const addChatMessage = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { sessionId } = req.params;
    const { role, content, timestamp, image_base64 } = req.body;
    
    const session = await ChatSession.findOne({
      where: { id: sessionId, userId: user.id }
    });
    
    if (!session) {
      return res.status(404).json({ detail: 'Session not found' });
    }
    
    let imageUrl = null;
    
    if (image_base64) {
      // Save image to disk
      const filename = `chat_${uuidv4()}.jpg`;
      const filepath = path.join(UPLOAD_DIR, filename);
      // Remove data:image/jpeg;base64, prefix if present
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filepath, buffer);
      
      imageUrl = `/uploads/${filename}`;
    }
    
    const message = await ChatMessage.create({
      sessionId: session.id,
      role,
      content,
      imageUrl,
      timestamp,
    });
    
    return res.json(message);
  } catch (error: any) {
    return res.status(500).json({ detail: error.message });
  }
};

export const chatWithAi = async (req: Request, res: Response) => {
  try {
    const { messages, provider, sessionId } = req.body;
    const userRole = (req as any).user;
    
    console.log(`Processing clinical chat request for user ${userRole.id}`);
    
    let activeSessionId = sessionId;
    
    // 1. Manage Chat Session persistence
    if (!activeSessionId) {
      const newSession = await ChatSession.create({
        userId: userRole.id,
        title: messages[messages.length - 1]?.content?.substring(0, 30) || "AI Consultation",
      });
      activeSessionId = newSession.id;
    }

    // 2. Save User Message if it's new
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      await ChatMessage.create({
        sessionId: activeSessionId,
        role: 'user',
        content: lastMessage.content,
        imageUrl: lastMessage.image_base64 ? `BASE64_ASSET` : null, // Simplification for now, usually we'd save to disk
        timestamp: new Date().toISOString(),
      });
    }
    
    const systemPrompt = "You are 'SkinTermo AI', a specialized Cardiology, Dermatology and Skincare AI Assistant. " +
      "Your goal is to analyze skin conditions described by the user and provide detailed, clinical, yet empathetic advice. " +
      "Structure your response logically: " +
      "1. Analysis of the condition based on symptoms. " +
      "2. Recommended medical treatments (OTC or Prescription-grade suggestions). " +
      "3. Home remedies and preventive skincare routines. " +
      "IMPORTANT: Always include a medical disclaimer advising to consult a physical doctor for formal diagnosis.";
      
    let aiContent = "";

    // Handle Ollama Integration
    if (provider === 'ollama' || provider === 'jayasimma/skintermo-ai' || provider === 'skintermo-ai') {
      const ollamaMessages = messages.map((m: any) => {
        return {
          role: m.role === 'ai' || m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
          images: m.image_base64 ? [m.image_base64.replace(/^data:image\/\w+;base64,/, "")] : undefined
        };
      });

      try {
        console.log(`Routing to local Ollama with model: ${process.env.OLLAMA_MODEL || "Jayasimma/skintermo-ai"}`);
        const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
        const ollamaResponse = await axios.post(`${ollamaUrl}/api/chat`, {
          model: process.env.OLLAMA_MODEL || "Jayasimma/skintermo-ai",
          messages: [{ role: "system", content: systemPrompt }, ...ollamaMessages],
          stream: false
        });
        aiContent = ollamaResponse.data.message.content;
      } catch (err: any) {
        console.error('Ollama Error:', err.message);
        if (err.code === 'ECONNREFUSED') {
          return res.status(503).json({ detail: 'Ollama server is not running or unreachable at ' + (process.env.OLLAMA_URL || 'http://127.0.0.1:11434') });
        }
        return res.status(500).json({ detail: `Ollama Failed: ${err.message}` });
      }
    } else {
      // Default to ZhipuAI
      const filteredMessages = messages.map((m: any) => {
        const msgObj: any = { role: m.role === 'ai' ? 'assistant' : m.role };
        if (m.imageUrl || m.image_base64) {
          msgObj.content = [{ type: "text", text: m.content }];
          if (m.image_base64) {
            const base64Data = m.image_base64.replace(/^data:image\/\w+;base64,/, "");
            msgObj.content.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Data}` } });
          }
        } else {
          msgObj.content = m.content;
        }
        return msgObj;
      });
      
      const hasImage = messages.some((m: any) => m.imageUrl || m.image_base64);
      const modelUsed = hasImage ? "glm-4.5v-flash" : "glm-4.7-flash";
      
      const response = await callZhipuAI({
        model: modelUsed,
        messages: [{ role: "system", content: systemPrompt }, ...filteredMessages],
        temperature: 0.3
      });
      aiContent = response.data.choices[0].message.content;
    }

    // 3. Save AI Message
    await ChatMessage.create({
      sessionId: activeSessionId,
      role: 'ai',
      content: aiContent,
      timestamp: new Date().toISOString(),
    });

    return res.json({ content: aiContent, sessionId: activeSessionId });
    
  } catch (error: any) {
    console.error('Chat Error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const detail = error.response?.data ? `AI Error: ${JSON.stringify(error.response.data)}` : error.message;
    return res.status(status).json({ detail });
  }
};
