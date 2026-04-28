import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, FileText, X, ChevronLeft, ChevronRight, Eye, Download, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import api, { API_BASE_URL } from '../api/config';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Message {
  id?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'pdf' | null;
  senderRole: 'patient' | 'doctor';
  createdAt: string;
}

interface ConsultationChatProps {
  sessionId: string;
  role: 'patient' | 'doctor';
}

// ─── PDF Viewer Modal ───────────────────────────────────────────────────────

interface PdfViewerModalProps {
  url: string;
  onClose: () => void;
}

function PdfViewerModal({ url, onClose }: PdfViewerModalProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
            <FileText size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">PDF Report</h3>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Clinical Document</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={url}
            download
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
          >
            <Download size={14} />
            Download
          </a>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-950">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl">
              <FileText size={32} className="text-white" />
            </div>
            <p className="text-white font-bold text-lg">Loading Document...</p>
            <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Please wait</p>
          </div>
        )}
        <iframe
          src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-full border-0"
          title="PDF Viewer"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}

// ─── Image Lightbox ─────────────────────────────────────────────────────────

interface ImageLightboxProps {
  url: string;
  onClose: () => void;
}

function ImageLightbox({ url, onClose }: ImageLightboxProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      <div className="flex justify-between items-center px-6 py-4 bg-black/60 backdrop-blur-md">
        <p className="text-white/70 text-sm font-bold uppercase tracking-widest">Image Preview</p>
        <button
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
        <img
          src={url}
          alt="Attachment"
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
        />
      </div>
      <div className="flex justify-center gap-4 pb-6">
        <a
          href={url}
          download
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
        >
          <Download size={14} /> Download
        </a>
      </div>
    </div>
  );
}

// ─── Main Chat Component ────────────────────────────────────────────────────

export default function ConsultationChat({ sessionId, role }: ConsultationChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // PDF viewer state
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  // Image lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/consultation/sessions/${sessionId}/messages`);
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !mediaFile) return;

    setSending(true);
    const formData = new FormData();
    formData.append('content', text);
    if (mediaFile) {
      formData.append('media', mediaFile); // field name must match multer
    }

    try {
      await api.post(`/consultation/sessions/${sessionId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setText('');
      setMediaFile(null);
      setShowAttachMenu(false);
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getMediaUrl = (path: string) => `${API_BASE_URL}${path}`;

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[600px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading conversation...</p>
      </div>
    </div>
  );

  return (
    <>
      {/* PDF Viewer Modal */}
      {pdfViewerUrl && (
        <PdfViewerModal url={pdfViewerUrl} onClose={() => setPdfViewerUrl(null)} />
      )}

      {/* Image Lightbox */}
      {lightboxUrl && (
        <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}

      <div className="rounded-[2.5rem] h-[650px] flex flex-col overflow-hidden border border-gray-100 bg-white shadow-2xl">
        {/* ── Header ── */}
        <div className="px-6 py-5 bg-black text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-lg">
              {role === 'doctor' ? 'P' : 'D'}
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">
                {role === 'doctor' ? 'Patient' : 'Doctor'} Consultation
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-[10px] opacity-50 font-bold uppercase tracking-tight">Live Session</p>
              </div>
            </div>
          </div>
          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            End-to-End Encrypted
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30">
              <FileText size={48} />
              <p className="text-xs font-black uppercase tracking-widest">No messages yet</p>
              <p className="text-[10px] font-medium text-gray-400">Send a message, image, or PDF report</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderRole === role;
              return (
                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-3xl overflow-hidden shadow-md ${
                      isMe
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-tr-sm'
                        : 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm'
                    }`}
                  >
                    {/* Image attachment */}
                    {msg.mediaUrl && msg.mediaType === 'image' && (
                      <button
                        onClick={() => setLightboxUrl(getMediaUrl(msg.mediaUrl!))}
                        className="block w-full hover:opacity-90 transition-opacity group relative"
                      >
                        <img
                          src={getMediaUrl(msg.mediaUrl)}
                          alt="Attachment"
                          className="w-full object-cover max-h-56"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-t-3xl">
                          <Eye size={24} className="text-white" />
                        </div>
                      </button>
                    )}

                    {/* PDF attachment */}
                    {msg.mediaUrl && msg.mediaType === 'pdf' && (
                      <button
                        onClick={() => setPdfViewerUrl(getMediaUrl(msg.mediaUrl!))}
                        className={`w-full flex items-center gap-4 p-4 hover:opacity-80 transition-all ${
                          isMe ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                          <FileText size={22} className="text-red-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold">PDF Report</p>
                          <p className={`text-[10px] font-medium ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                            Tap to view in app
                          </p>
                        </div>
                        <Eye size={16} className={isMe ? 'text-indigo-200' : 'text-gray-400'} />
                      </button>
                    )}

                    {/* Text content */}
                    {msg.content && (
                      <p className={`px-5 py-3 text-sm font-medium leading-relaxed ${
                        msg.mediaUrl ? 'pt-0 border-t border-white/10' : ''
                      }`}>
                        {msg.content}
                      </p>
                    )}
                  </div>
                  <span className={`text-[9px] font-black text-gray-400 mt-1.5 uppercase tracking-widest px-2`}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Attachment preview bar ── */}
        {mediaFile && (
          <div className="mx-4 mb-2 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              {mediaFile.type === 'application/pdf'
                ? <FileText size={18} className="text-red-500" />
                : <ImageIcon size={18} className="text-indigo-500" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-gray-800 truncate">{mediaFile.name}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                {mediaFile.type === 'application/pdf' ? 'PDF Document' : 'Image'}
                {' · '}{(mediaFile.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button onClick={() => setMediaFile(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Attach menu ── */}
        {showAttachMenu && (
          <div className="mx-4 mb-2 p-4 bg-white border border-gray-100 rounded-2xl shadow-lg flex items-center gap-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mr-2">Attach:</p>
            {/* Image */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <ImageIcon size={22} className="text-white" />
              </div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Image</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) { setMediaFile(e.target.files[0]); setShowAttachMenu(false); }
              }}
            />
            {/* PDF */}
            <button
              onClick={() => pdfInputRef.current?.click()}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <FileText size={22} className="text-white" />
              </div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">PDF Report</span>
            </button>
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) { setMediaFile(e.target.files[0]); setShowAttachMenu(false); }
              }}
            />
          </div>
        )}

        {/* ── Input bar ── */}
        <form
          onSubmit={handleSendMessage}
          className="px-5 py-4 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0"
        >
          {/* Attach toggle */}
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              showAttachMenu
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
            }`}
          >
            <Paperclip size={20} className={showAttachMenu ? 'rotate-45 transition-transform' : 'transition-transform'} />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mediaFile ? `📎 ${mediaFile.name}` : 'Type a clinical observation...'}
              className="w-full bg-gray-100 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={sending || (!text && !mediaFile)}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </>
  );
}
