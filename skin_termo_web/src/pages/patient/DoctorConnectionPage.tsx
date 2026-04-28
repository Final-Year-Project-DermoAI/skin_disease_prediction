import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../../api/config';
import { 
  Users, 
  Search, 
  User, 
  Stethoscope, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  X,
  Loader2,
  ExternalLink,
  MapPin,
  Briefcase,
  Hospital
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Doctor {
  id: string; // Changed to string to match UUID/ID from backend
  name: string;
  specialization: string;
  experience: number;
  clinic_name: string;
  address: string;
  profile_image: string | null;
}

interface Connection {
  id: string;
  doctor_name: string;
  specialization: string;
  status: string;
  created_at: string;
}

const DoctorConnectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'connections'>('browse');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, connRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/consultation/sessions')
      ]);
      setDoctors(docsRes.data);
      setConnections(connRes.data);
    } catch (err) {
      console.error('Error fetching connection data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (doctorId: string) => {
    try {
      await api.post('/consultation/sessions', {
        doctorId
      });
      alert('Consultation request sent successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to send request');
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-brand-lime" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Initialising Connection Network...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-brand-black mb-3">Doctors Connection</h1>
          <p className="text-sm font-medium text-gray-500 max-w-lg leading-relaxed">Discover and connect with top-tier dermatological experts. Request secure consultations and manage your clinical network.</p>
        </div>
        
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <button 
            onClick={() => setActiveTab('browse')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'browse' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-black'}`}
          >
            Explore Experts
          </button>
          <button 
            onClick={() => setActiveTab('connections')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'connections' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-black'}`}
          >
            My Terminal
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'browse' ? (
          <motion.div 
            key="browse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Search Bar */}
            <div className="relative group max-w-2xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-brand-lime" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, expertise or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white border border-gray-200 rounded-[2rem] text-sm font-bold shadow-sm focus:shadow-xl focus:border-brand-black outline-none transition-all"
              />
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDoctors.map((doc) => (
                <motion.div 
                  key={doc.id}
                  whileHover={{ y: -5 }}
                  className="glass-card overflow-hidden group border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full bg-white/80"
                >
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {doc.profile_image ? (
                      <img src={`${API_BASE_URL}${doc.profile_image}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={doc.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-blue/5 text-brand-blue">
                        <User size={64} className="opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg border border-white shadow-sm">
                        <span className="text-[10px] font-black text-brand-black uppercase tracking-widest">Verified Expert</span>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6">
                      <p className="text-[10px] font-black text-brand-lime uppercase tracking-[0.2em] mb-2">{doc.specialization}</p>
                      <h3 className="text-2xl font-black text-brand-black tracking-tight leading-tight">{doc.name}</h3>
                    </div>

                    <div className="space-y-3 mb-8 flex-1">
                        <div className="flex items-center gap-3 text-gray-500">
                            <Briefcase size={14} className="text-gray-400" />
                            <span className="text-xs font-bold">{doc.experience} Years Protocol Experience</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-xs font-bold truncate">{doc.clinic_name}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-auto pt-6 border-t border-gray-50">
                        <button 
                            onClick={() => setSelectedDoctor(doc)}
                            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
                        >
                            View Profile
                        </button>
                        <button 
                            onClick={() => handleConnect(doc.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-black text-white text-xs font-black uppercase tracking-widest hover:bg-brand-lime hover:text-black transition-all duration-300"
                        >
                            Consult
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="connections"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-6">
              {connections.length === 0 ? (
                <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <Users className="mx-auto mb-6 text-gray-300" size={64} />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Active Connections</p>
                    <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto">Explore available experts to establish clinical protocols and start consultations.</p>
                </div>
              ) : (
                connections.map((conn) => (
                  <div key={conn.id} className="glass-card p-8 flex items-center justify-between border-gray-100 hover:shadow-2xl transition-all duration-500 bg-white">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-brand-black/5 flex items-center justify-center text-brand-black">
                        <Stethoscope size={28} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-brand-black tracking-tight">{conn.doctor_name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">{conn.specialization}</span>
                          <span className="text-[10px] font-bold text-gray-400">• Requested {new Date(conn.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        conn.status === 'pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        (conn.status === 'accepted' || conn.status === 'active') ? 'bg-green-50 text-green-600 border border-green-100' :
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {conn.status === 'pending' ? <Clock size={12} /> : <CheckCircle size={12} />}
                        {conn.status}
                      </div>
                      
                      {(conn.status === 'accepted' || conn.status === 'active') && (
                        <button 
                          onClick={() => navigate(`/patient/chat/${conn.id}`)}
                          className="p-4 bg-brand-black text-white rounded-2xl hover:bg-brand-lime hover:text-black transition-all shadow-lg"
                        >
                          <MessageSquare size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doctor Detail Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-8 right-8 p-3 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-full min-h-[400px] bg-gray-100">
                    {selectedDoctor.profile_image ? (
                      <img src={`${API_BASE_URL}${selectedDoctor.profile_image}`} className="w-full h-full object-cover" alt={selectedDoctor.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-blue bg-brand-blue/5">
                        <User size={128} className="opacity-10" />
                      </div>
                    )}
                </div>
                <div className="p-12 space-y-10">
                  <div>
                    <span className="px-4 py-1.5 bg-brand-lime/10 text-brand-lime text-[10px] font-black uppercase tracking-widest rounded-xl border border-brand-lime/20">Authorized Practitioner</span>
                    <h2 className="text-4xl font-black text-brand-black tracking-tighter mt-4">{selectedDoctor.name}</h2>
                    <p className="text-lg font-bold text-gray-500 mt-2">{selectedDoctor.specialization}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <Hospital size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Clinic Center</p>
                        <p className="text-sm font-bold text-brand-black">{selectedDoctor.clinic_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Protocol Address</p>
                        <p className="text-sm font-bold text-brand-black leading-relaxed">{selectedDoctor.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <button 
                      onClick={() => { handleConnect(selectedDoctor.id); setSelectedDoctor(null); }}
                      className="w-full py-5 bg-brand-black text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-brand-lime hover:text-black transition-all shadow-xl flex items-center justify-center gap-3"
                    >
                      Initialize Consultation Connection
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorConnectionPage;
