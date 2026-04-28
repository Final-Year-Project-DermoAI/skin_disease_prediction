import React from 'react';
import { Users, FileText, Clock, AlertCircle, TrendingUp, Calendar, ChevronRight } from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Patients', value: '0', icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Pending Reports', value: '0', icon: FileText, color: 'text-secondary', bg: 'bg-secondary/5' },
    { label: 'Today Appointments', value: '0', icon: Calendar, color: 'text-accent', bg: 'bg-accent/5' },
    { label: 'Emergency Alerts', value: '0', icon: AlertCircle, color: 'text-error', bg: 'bg-error/5' },
  ];

  const recentPatients: any[] = [];


  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Doctor Dashboard</h1>
          <p className="text-text-secondary mt-1">Intelligent R&D monitoring for skin conditions</p>
        </div>
        <div className="flex gap-4">
            <button className="btn btn-secondary">
                <FileText size={18} /> Export Data
            </button>
            <button className="btn btn-primary">
                <Calendar size={18} /> View Schedule
            </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card hover:shadow-md cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} border border-white/10 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={stat.color} size={24} />
                </div>
                <TrendingUp size={16} className="text-success opacity-50" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-bold mt-1 tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold tracking-tight">Recent Diagnostic Sequences</h3>
            <button className="text-sm font-bold text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
                View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-text-secondary text-[10px] uppercase tracking-[0.2em] border-b border-gray-100">
                  <th className="pb-4 font-bold">Subject</th>
                  <th className="pb-4 font-bold">Prediction</th>
                  <th className="pb-4 font-bold">Timestamp</th>
                  <th className="pb-4 font-bold">Criticality</th>
                  <th className="pb-4 font-bold text-right pr-4">Profile</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentPatients.length > 0 ? (
                  recentPatients.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center font-bold text-xs text-white shadow-lg">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                              <p className="font-bold">{p.name}</p>
                              <p className="text-[10px] text-text-secondary">Age: {p.age}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 font-medium">{p.diagnosis}</td>
                      <td className="py-5 text-text-secondary text-xs">{p.date}</td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'Emergency' ? 'bg-red-50 text-error border border-red-100' :
                          p.status === 'Consulted' ? 'bg-green-50 text-success border border-green-100' :
                          'bg-amber-50 text-warning border border-amber-100'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-5 text-right pr-4">
                        <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all">
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 italic">
                      No recent diagnostic sequences available.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>

        <div className="space-y-6">
            <div className="glass-card bg-black text-white border-black">
                <h3 className="text-xl font-bold mb-4 tracking-tight">Active AI Lab</h3>
                <p className="text-gray-400 text-sm mb-6">Scanning engine v1.0.4 is currently processing sequences.</p>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                    <div className="bg-[#DAF185] h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#DAF185]">
                    <span>Resource Usage</span>
                    <span>75%</span>
                </div>
            </div>

            <div className="glass-card">
              <h3 className="text-lg font-bold mb-6 tracking-tight">Protocol Logs</h3>
              <div className="space-y-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1 bg-black/10 rounded-full"></div>
                    <div>
                      <p className="text-sm font-bold">Sequence validated</p>
                      <p className="text-xs text-text-secondary">ID: #SCAN-923{i}</p>
                      <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                        <Clock size={12} /> {i + 1}h ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary w-full mt-10 border-dashed py-3 text-xs">
                Browse Full Logs
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
