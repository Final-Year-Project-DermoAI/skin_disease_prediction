import React, { useState, useRef, useEffect } from 'react';
import api from '../api/config';
import { Send, Bot, User, Sparkles, Loader2, Image as ImageIcon, X, Camera, History, Calendar, ChevronRight, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'ai';
  content: string;
  image_base64?: string;
}

export default function AIChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! I am your SkinTermo AI Assistant powered by Ollama. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/chat/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  };

  const loadSession = async (sid: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/chat/sessions/${sid}`);
      setMessages(res.data.messages);
      setSessionId(sid);
      setHistoryOpen(false);
    } catch (err) {
      console.error("Failed to load session detail", err);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([
      { role: 'ai', content: "Hello! I am your SkinTermo AI Assistant. You can now start a new clinical session. How can I help you today?" }
    ]);
    setSessionId(null);
    setHistoryOpen(false);
  };
   

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !pendingImage) || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input || (pendingImage ? "Analyze this skin condition image." : ""),
      image_base64: pendingImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setPendingImage(null);
    setLoading(true);

    try {
      const response = await api.post('/chat/message', {
        messages: [...messages, userMessage],
        provider: 'ollama',
        sessionId: sessionId
      });

      const aiMessage: Message = { role: 'ai', content: response.data.content };
      setMessages(prev => [...prev, aiMessage]);
      
      if (!sessionId && response.data.sessionId) {
        setSessionId(response.data.sessionId);
        loadHistory(); // Refresh session list
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = { 
        role: 'ai', 
        content: err.response?.data?.detail || "Sorry, I'm having trouble connecting to the diagnostic engine. Please ensure Ollama is running." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };



  const MessageFormatter = ({ content }: { content: string }) => {
    // Strip out <unusedXX> tags and content between them if they appear in pairs
    // or just the tags themselves if they are stray.
    const cleanContent = content
      .replace(/<unused\d+>[\s\S]*?<unused\d+>/g, '') // Remove paired tags and content inside
      .replace(/<unused\d+>/g, ''); // Remove any stray single tags
    
    // Split by single stars and filter out excessive empty strings
    const rawLines = cleanContent.split('*');
    const filteredLines = rawLines.filter((line, i) => {
      // Keep only one empty line if there are multiple consecutive ones
      if (line.trim() === '' && i > 0 && rawLines[i-1].trim() === '') return false;
      return true;
    });
    
    return (
      <div className="flex flex-col">
        {filteredLines.map((line, i) => {
          const trimmedLine = line.trim();
          if (!trimmedLine && i > 0) return <div key={i} className="h-2" />;
          
          // Handle bold text (double stars)
          const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
          
          return (
            <div key={i} className="leading-relaxed min-h-[1.25rem]">
              {parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-lime rounded-2xl flex items-center justify-center shadow-lg shadow-brand-lime/20">
            <Bot className="text-brand-black" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Diagnostic Assistant</h1>
            <p className="text-xs text-gray-500 font-medium">Powered by Jayasimma/skintermo-ai</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <History size={14} className="text-gray-500" />
            History
          </button>
          <div className="bg-brand-lime/10 text-brand-black px-4 py-2 rounded-xl border border-brand-lime/20 text-xs font-bold flex items-center gap-2">
             <Sparkles size={14} className="text-brand-lime" />
             Multimodal Enabled
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-4 mb-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-brand-black text-white' : 'bg-brand-lime text-brand-black'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.image_base64 && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-1 max-w-[300px]">
                      <img src={msg.image_base64} alt="Clinical Snapshot" className="w-full h-auto object-cover" />
                    </motion.div>
                  )}
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-brand-black text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 rounded-tl-none'
                  }`}>
                    <MessageFormatter content={msg.content} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-lime text-brand-black flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin" />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl rounded-tl-none italic text-gray-400 text-sm">
                  Analyzing sequence...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="space-y-4">
        <AnimatePresence>
          {pendingImage && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="relative inline-block ml-6"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-brand-lime shadow-xl">
                <img src={pendingImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => setPendingImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSend} className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
               type="button"
               onClick={() => fileInputRef.current?.click()}
               className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-black hover:bg-gray-50 rounded-full transition-all"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={pendingImage ? "Describe the symptoms..." : "Ask about skin conditions or upload a photo..."}
            className="w-full bg-white border border-gray-200 rounded-[2rem] pl-14 pr-16 py-5 text-sm focus:border-brand-black outline-none shadow-xl transition-all group-hover:border-gray-300"
          />
          
          <button
            type="submit"
            disabled={loading || (!input.trim() && !pendingImage)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-black text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <p className="text-[10px] text-center text-gray-400 mt-4 uppercase font-bold tracking-widest flex items-center justify-center gap-2">
        <Camera size={10} /> Clinical Vision Node Active • SkinTermo AI
      </p>

      {/* History Slide-over */}
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl z-50 flex flex-col p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-lime rounded-xl flex items-center justify-center">
                    <History size={20} className="text-brand-black" />
                  </div>
                  <h2 className="text-xl font-bold">Consultation History</h2>
                </div>
                <button onClick={() => setHistoryOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <button 
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 bg-brand-black text-white py-4 rounded-2xl mb-8 font-bold hover:bg-brand-black/90 transition-all shadow-lg"
              >
                <PlusCircle size={18} />
                Start New Consultation
              </button>

              <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                {Object.entries(sessions.reduce((acc: any, s: any) => {
                  const date = new Date(s.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(s);
                  return acc;
                }, {})).map(([date, dateSessions]: [string, any]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      <Calendar size={12} />
                      {date}
                    </div>
                    <div className="space-y-3">
                      {dateSessions.map((s: any) => (
                        <button
                          key={s.id}
                          onClick={() => loadSession(s.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                            sessionId === s.id 
                            ? 'bg-brand-lime/10 border-brand-lime ring-1 ring-brand-lime' 
                            : 'bg-white border-gray-100 hover:border-brand-lime hover:shadow-md'
                          }`}
                        >
                          <div className="truncate pr-4">
                            <p className="font-bold text-sm text-brand-black mb-1 truncate">{s.title || "Clinical Chat"}</p>
                            <p className="text-[10px] text-gray-400">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Diagnostic Archive</p>
                          </div>
                          <ChevronRight size={16} className={`transition-transform group-hover:translate-x-1 ${sessionId === s.id ? 'text-brand-black' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
