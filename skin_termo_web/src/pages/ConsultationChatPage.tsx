import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, ShieldCheck } from 'lucide-react';
import ConsultationChat from '../components/ConsultationChat';

interface ConsultationChatPageProps {
  role: 'patient' | 'doctor';
}

const ConsultationChatPage: React.FC<ConsultationChatPageProps> = ({ role }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  if (!sessionId) {
    return <div>Invalid Session</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
            <ChevronLeft size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest italic">Return to Stream</span>
        </button>

        <div className="flex items-center gap-3 bg-green-50 px-5 py-2.5 rounded-2xl border border-green-100">
          <ShieldCheck size={18} className="text-green-600" />
          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">End-to-End Encrypted</span>
        </div>
      </div>

      {/* Chat Area */}
      <ConsultationChat sessionId={sessionId} role={role} />

      {/* Footer Info */}
      <div className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
        <Info className="text-blue-500 shrink-0" size={20} />
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-900 mb-1">Clinical Protocol Notice</h4>
          <p className="text-xs text-blue-800/70 leading-relaxed font-medium">
            All communications are logged for medical auditing. Please ensure all uploaded images are clear and captured under adequate lighting for accurate diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsultationChatPage;
