import React, { useState, useEffect } from 'react';
import api from '../../api/config';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  User, 
  Loader2,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ConnectionRequest {
  id: string; // Changed to string to match UUID
  patient_name: string;
  status: 'pending' | 'accepted' | 'rejected' | 'active'; // Added 'active'
  created_at: string;
}

const PatientConnectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'active'>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/consultation/sessions');
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      // Note: Backend might need a specific update endpoint. 
      // For now, let's assume we use a session update route if it existed.
      // But based on current backend, we only have get/create.
      // I will add a status update route in the backend next.
      await api.patch(`/consultation/sessions/${id}`, { status });
      alert(`Request ${status} successfully`);
      fetchRequests();
    } catch (err) {
      console.error('Error responding to request:', err);
      alert('Failed to update request');
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'accepted' && req.status === 'active') return true; // Treat 'active' as accepted
    return req.status === filter;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-brand-blue" size={48} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      <div className="flex justify-between items-end border-b border-gray-100 pb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-brand-black">Patient Connections</h1>
          <p className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-widest italic opacity-60 italic">Inbound Consultation Stream</p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
          {(['all', 'pending', 'accepted'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-black'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <Users className="mx-auto mb-6 text-gray-300" size={64} />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Connection Requests</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <motion.div 
              key={req.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8 bg-white border-gray-100 flex items-center justify-between group hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-brand-black relative overflow-hidden">
                    <User size={32} className="opacity-20" />
                    <div className={`absolute bottom-0 inset-x-0 h-1.5 ${req.status === 'pending' ? 'bg-orange-400' : req.status === 'accepted' ? 'bg-brand-lime' : 'bg-red-400'}`}></div>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-brand-black tracking-tight">{req.patient_name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Calendar size={12} /> Received {new Date(req.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        req.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                        (req.status === 'accepted' || req.status === 'active') ? 'bg-green-50 text-green-600' :
                        'bg-red-50 text-red-600'
                    }`}>
                        {req.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {req.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleResponse(req.id, 'rejected')}
                      className="p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <XCircle size={22} />
                    </button>
                    <button 
                      onClick={() => handleResponse(req.id, 'accepted')}
                      className="px-8 py-4 rounded-2xl bg-brand-black text-white text-xs font-black uppercase tracking-widest hover:bg-brand-lime hover:text-black transition-all shadow-xl"
                    >
                      Accept Node
                    </button>
                  </>
                )}
                {(req.status === 'accepted' || req.status === 'active') && (
                  <button 
                    onClick={() => navigate(`/doctor/chat/${req.id}`)}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-brand-black text-white text-xs font-black uppercase tracking-widest hover:bg-brand-blue transition-all shadow-xl"
                  >
                    <MessageSquare size={18} /> Open Comms
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientConnectionPage;
