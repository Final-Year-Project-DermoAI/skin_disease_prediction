import React from 'react';
import { Scan, MessageSquare, History, Calendar, ArrowRight, Sparkles } from 'lucide-react';

const PatientDashboard: React.FC = () => {
  const quickActions = [
    { label: 'Intelligence Scan', icon: Scan, color: 'bg-black', accent: 'text-[#DAF185]', path: '/patient/scanning', desc: 'Real-time AI analysis of skin conditions' },
    { label: 'Consult AI', icon: MessageSquare, color: 'bg-white', accent: 'text-black', path: '/patient/chatbot', desc: 'Secure communication with AI assistant' },
    { label: 'Expert Council', icon: Calendar, color: 'bg-[#DAF185]', accent: 'text-black', path: '/patient/doctors', desc: 'Consultation with verified dermatologists' },
  ];

  const history: any[] = [];

  return (
    <div className="animate-fade-in space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-text-secondary mt-1">Ready for your daily diagnostic check-in?</p>
        </div>
        <button className="btn btn-secondary flex items-center gap-2">
            <Sparkles size={16} className="text-[#DAF185]" /> Ultra-Scan Mode
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {quickActions.map((action, i) => (
          <div key={i} className={`glass-card hover:scale-105 transition-all duration-300 cursor-pointer group ${action.color === 'bg-black' ? 'bg-[#1A1A1A] text-white' : ''}`}>
            <div className={`w-12 h-12 ${action.color} border border-gray-100/10 rounded-2xl flex items-center justify-center mb-8 shadow-xl`}>
              <action.icon className={action.accent} size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-tight">{action.label}</h3>
            <p className={`text-xs mb-8 leading-relaxed ${action.color === 'bg-black' ? 'text-gray-400' : 'text-text-secondary'}`}>
                {action.desc}
            </p>
            <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${action.color === 'bg-black' ? 'text-[#DAF185]' : 'text-black'}`}>
              Access Lab <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 glass-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold tracking-tight">Session History</h3>
            <button className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">All Sessions</button>
          </div>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:border-black transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <History size={18} className="text-gray-400 group-hover:text-black transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{item.type}</p>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                      <p className="text-sm font-bold tracking-tight">{item.result}</p>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{item.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 italic">
                No recent sessions available.
              </div>
            )}
          </div>
        </div>


        <div className="glass-card bg-[#DAF185] border-[#DAF185] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mb-6">
                <Sparkles size={20} className="text-[#DAF185]" />
            </div>
            <h3 className="text-2xl font-bold mb-3 tracking-tighter text-black">Active Health Insights</h3>
            <p className="text-black/70 text-sm leading-relaxed font-medium">
                Our AI suggests maintaining a consistent hydration protocol. Hydrated skin forms a 40% stronger barrier against external irritants.
            </p>
          </div>
          <button className="btn btn-primary w-full mt-10 rounded-full bg-black text-white hover:scale-105 transition-all">
            Unlock Full Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
