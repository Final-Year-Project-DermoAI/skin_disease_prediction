import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { Download, Share2, ShieldCheck, User, MapPin, Mail, Phone, ExternalLink, Users, Activity, UserPlus, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { API_BASE_URL } from '../../api/config';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVerified: boolean;
  profile?: {
    specialization: string;
    yearOfExperience: number;
    clinicName: string;
    clinicAddress: string;
    profilePhoto?: string;
    medicalLicenseNumber?: string;
    medicalLicenseDoc?: string;
    degreeCertificate?: string;
  };
}

const DoctorPasscodeCard: React.FC<{ doctor: Doctor }> = ({ doctor }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = () => {
    if (cardRef.current === null) return;
    toPng(cardRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `Doctor_Passcode_${doctor.firstName}_${doctor.lastName}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to generate card', err);
      });
  };

  const shareCard = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'passcode.png', { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Doctor Verified Passcode',
          text: `Verified Doctor: ${doctor.firstName} ${doctor.lastName}`,
        });
      } else {
        alert("Sharing not supported on this browser. Downloading instead.");
        downloadCard();
      }
    } catch (err) {
      console.error('Error sharing', err);
    }
  };

  const doctorName = `${doctor.firstName} ${doctor.lastName}`;
  const specialization = doctor.profile?.specialization || 'General Practitioner';
  const clinicName = doctor.profile?.clinicName || 'Clinical Node';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* The Actual Passcode Card */}
      <div 
        ref={cardRef}
        className="w-[350px] h-[550px] bg-brand-black text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl border-4 border-brand-lime/20"
      >
        {/* Background Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-lime/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-lime/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-lime rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-brand-black w-5 h-5" />
              </div>
              <span className="text-xs font-bold tracking-widest text-brand-lime uppercase">Verified Provider</span>
            </div>
            <div className="text-[10px] font-mono opacity-40">SKINSCAN-ID-{doctor.id.substring(0, 8)}</div>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-3xl border-4 border-brand-lime/30 overflow-hidden mb-4 bg-gray-800">
              {doctor.profile?.profilePhoto ? (
                <img 
                  src={`${API_BASE_URL}${doctor.profile.profilePhoto}`} 
                  alt={doctorName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={48} className="text-gray-600" />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-center leading-tight mb-1">{doctorName}</h2>
            <p className="text-brand-lime text-sm font-medium tracking-wide">{specialization}</p>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-8 flex-1">
            <div className="flex items-center gap-3 text-xs opacity-70">
              <MapPin size={14} className="text-brand-lime" />
              <span>{clinicName}</span>
            </div>
            <div className="flex items-center gap-3 text-xs opacity-70">
              <Phone size={14} className="text-brand-lime" />
              <span>{doctor.phone || '+1 (800) VERIFIED'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs opacity-70">
              <Mail size={14} className="text-brand-lime" />
              <span>{doctor.email}</span>
            </div>
          </div>

          {/* QR Code Footer */}
          <div className="bg-white p-4 rounded-3xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-black text-[10px] font-bold uppercase tracking-tighter">Scan to Verify</span>
              <span className="text-gray-400 text-[8px] font-mono">ID: {doctor.email}</span>
            </div>
            <QRCodeSVG 
              value={`https://skinscan.ai/verify/${doctor.id}`} 
              size={50}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 w-full">
        <button 
          onClick={downloadCard}
          className="flex-1 btn btn-primary py-4 flex items-center justify-center gap-2"
        >
          <Download size={18} /> Download Card
        </button>
        <button 
          onClick={shareCard}
          className="btn btn-secondary py-4 px-6 flex items-center justify-center"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default function DoctorManagement() {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [activeTab, setActiveTab] = useState<'verified' | 'requests'>('requests');
  const [approvalResult, setApprovalResult] = useState<{ email: string; pass?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{ url: string; title: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: 'Password@Admin',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/doctors');
      setAllDoctors(response.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post('/admin/user', {
        ...formData,
        role: 'DOCTOR'
      });
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', password: 'Password@Admin' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create doctor account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (doctorId: string) => {
    if (!window.confirm("Authorize this medical professional for network access?")) return;
    try {
      await api.patch(`/admin/doctor/${doctorId}/verify`, { status: 'APPROVED' });
      setApprovalResult({ email: allDoctors.find(d => d.id === doctorId)?.email || '...' });
      fetchData();
    } catch (err) {
      alert("Failed to approve doctor");
    }
  };

  const verifiedDoctors = allDoctors.filter(d => d.status === 'APPROVED');
  const pendingRequests = allDoctors.filter(d => d.status === 'PENDING');

  const currentList = activeTab === 'verified' ? verifiedDoctors : pendingRequests;

  return (
    <div className="p-8 animate-fade-in space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-brand-black">Medical Provider Control</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">Manage expert nodes and authorize new clinical practitioners.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary px-8 py-4 flex items-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus size={18} />
          Register New Doctor
        </button>
      </div>
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <button 
            onClick={() => setActiveTab('verified')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'verified' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-black'}`}
          >
            Verified Providers ({verifiedDoctors.length})
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-black'}`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {activeTab === 'verified' ? (
          <>
            <div className="xl:col-span-2 space-y-4">
              {loading ? (
                <div className="glass-card animate-pulse h-32 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing Expert Nodes...</div>
              ) : verifiedDoctors.length === 0 ? (
                <div className="glass-card py-20 text-center text-gray-400 border-dashed">No verified doctors in current registry</div>
              ) : (
                verifiedDoctors.map((doc) => (
                  <motion.div 
                    key={doc.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`glass-card cursor-pointer transition-all border-2 ${selectedDoctor?.id === doc.id ? 'border-brand-lime bg-brand-lime/5 shadow-xl' : 'border-transparent hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-brand-black/5 rounded-2xl overflow-hidden flex items-center justify-center">
                        {doc.profile?.profilePhoto ? (
                          <img src={`${API_BASE_URL}${doc.profile.profilePhoto}`} className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-brand-black tracking-tight">{doc.firstName} {doc.lastName}</h3>
                        <p className="text-xs font-bold text-brand-lime uppercase tracking-widest mt-1">
                          {doc.profile?.specialization || 'Specialist'} • {doc.profile?.yearOfExperience || 0}y Exp.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 rounded-xl border mb-3 bg-brand-lime/10 text-brand-lime border-brand-lime/20">
                          <ShieldCheck size={12} /> Verified
                        </span>
                        <p className="text-[10px] text-gray-400 flex items-center gap-2 justify-end font-bold uppercase tracking-widest">
                          <ExternalLink size={12} /> Provider Node
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <div className="flex flex-col items-center">
              {selectedDoctor ? (
                <DoctorPasscodeCard doctor={selectedDoctor} />
              ) : (
                <div className="w-full aspect-[3/5] border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center text-gray-300">
                  <User size={64} className="mb-6 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">Node Preview Standby</p>
                  <p className="text-[10px] mt-2 leading-relaxed">Select a verified expert from the registry to generate their digital clinical credentials.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="xl:col-span-3 space-y-6">
            {loading ? (
              <div className="glass-card animate-pulse h-64 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">Fetching Unverified Credentials...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="glass-card py-32 text-center border-dashed border-gray-200 flex flex-col items-center gap-4">
                <Users className="text-gray-200" size={64} />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Clinical Request Queue Empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingRequests.map((req) => (
                  <motion.div 
                    key={req.id}
                    onClick={() => {
                      setSelectedDoctor(req);
                      setIsDetailsModalOpen(true);
                    }}
                    className="glass-card cursor-pointer p-8 bg-white border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-all duration-500 relative overflow-hidden group border-2 border-transparent hover:border-brand-lime"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 bg-brand-black text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl">
                          {req.firstName.charAt(0)}
                        </div>
                        <span className="px-4 py-1.5 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-orange-100">Pending Review</span>
                      </div>
                      
                      <div>
                        <h4 className="text-2xl font-black text-brand-black tracking-tighter">{req.firstName} {req.lastName}</h4>
                        <p className="text-xs font-bold text-brand-lime uppercase tracking-widest mt-1">{req.profile?.specialization || 'Clinical Specialist'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience</p>
                          <p className="text-xs font-bold">{req.profile?.yearOfExperience || 0} Years</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">License</p>
                          <p className="text-xs font-bold font-mono">{req.profile?.medicalLicenseNumber || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-50 flex items-center gap-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(req.id);
                          }}
                          className="flex-1 py-4 bg-brand-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-lime hover:text-black transition-all shadow-xl"
                        >
                          Authorize Expert Node
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Doctor Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedDoctor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl relative flex"
            >
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="absolute top-8 right-8 p-3 text-gray-400 hover:text-black bg-gray-50 rounded-full z-10 transition-colors"
              >
                <X size={24} />
              </button>

              {/* Sidebar Info */}
              <div className="w-96 bg-gray-50 border-r border-gray-100 p-12 overflow-y-auto shrink-0">
                <div className="text-center mb-10">
                  <div className="w-24 h-24 bg-brand-black/5 rounded-3xl overflow-hidden mx-auto mb-6 flex items-center justify-center border-2 border-brand-lime/20">
                    {selectedDoctor.profile?.profilePhoto ? (
                      <img src={`${API_BASE_URL}${selectedDoctor.profile.profilePhoto}`} className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-300" />
                    )}
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-brand-black">Dr. {selectedDoctor.firstName}</h2>
                  <p className="text-xs font-bold text-brand-lime uppercase tracking-widest mt-2">{selectedDoctor.profile?.specialization}</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Clinical Background</h5>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400 shrink-0">
                          <Activity size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience</p>
                          <p className="text-sm font-bold text-brand-black">{selectedDoctor.profile?.yearOfExperience || 0} Professional Years</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400 shrink-0">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Node</p>
                          <p className="text-sm font-bold text-brand-black truncate">{selectedDoctor.profile?.clinicName || 'Not Assigned'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Node</h5>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="text-gray-400" size={16} />
                        <span className="text-sm font-bold text-gray-600 truncate">{selectedDoctor.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="text-gray-400" size={16} />
                        <span className="text-sm font-bold text-gray-600">{selectedDoctor.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-200">
                    <button 
                      onClick={() => handleApprove(selectedDoctor.id)}
                      className="w-full py-5 bg-brand-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-lime hover:text-black transition-all shadow-xl"
                    >
                      Issue Network Access
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Repository */}
              <div className="flex-1 p-12 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-brand-black tracking-tight">Certification Repository</h3>
                    <p className="text-sm text-gray-500 mt-1">Audit clinical documentation and medical licenses.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10 overflow-y-auto">
                  {/* License Document Card */}
                  <div className="border border-gray-100 rounded-[2rem] p-8 space-y-6 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center">
                        <ShieldCheck size={24} />
                      </div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Medical License</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-brand-black mb-1">Authorization Document</h4>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">Verified medical license issued by regional regulatory bodies.</p>
                    </div>
                    <button 
                      onClick={() => setViewingDoc({ 
                        url: `${API_BASE_URL}${selectedDoctor.profile?.medicalLicenseDoc}`, 
                        title: 'Medical License Document' 
                      })}
                      className="w-full py-4 bg-gray-50 group-hover:bg-brand-blue group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Audit Document
                    </button>
                  </div>

                  {/* Degree Certificate Card */}
                  <div className="border border-gray-100 rounded-[2rem] p-8 space-y-6 hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-brand-lime/10 text-brand-lime rounded-xl flex items-center justify-center">
                        <Activity size={24} />
                      </div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Academic Proof</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-brand-black mb-1">Clinical Specialization</h4>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">Advanced medical degree and specialization certification.</p>
                    </div>
                    <button 
                      onClick={() => setViewingDoc({ 
                        url: `${API_BASE_URL}${selectedDoctor.profile?.degreeCertificate}`, 
                        title: 'Medical Degree / Certificate' 
                      })}
                      className="w-full py-4 bg-gray-50 group-hover:bg-brand-lime group-hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Audit Document
                    </button>
                  </div>
                </div>

                {/* Built-in PDF Viewer Overlay */}
                <AnimatePresence>
                  {viewingDoc && (
                    <motion.div 
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 40 }}
                      className="absolute inset-0 bg-white z-50 flex flex-col"
                    >
                      <div className="flex items-center justify-between p-8 border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-brand-black text-white rounded-xl">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <h4 className="text-xl font-black tracking-tight">{viewingDoc.title}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-lime">Secure Auditor View</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setViewingDoc(null)}
                          className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
                        >
                          <X size={24} />
                        </button>
                      </div>
                      <div className="flex-1 bg-gray-50 p-8 flex flex-col gap-6">
                        <div className="flex justify-end">
                            <a 
                              href={viewingDoc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-6 py-3 bg-brand-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-lime hover:text-brand-black transition-all"
                            >
                              <ExternalLink size={14} />
                              Open in New Tab
                            </a>
                        </div>
                        <div className="flex-1 rounded-2xl border border-gray-100 bg-white shadow-inner overflow-hidden flex items-center justify-center">
                          {viewingDoc.url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                            <img 
                              src={viewingDoc.url} 
                              alt={viewingDoc.title}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <embed 
                              src={`${viewingDoc.url}#toolbar=0&navpanes=0&scrollbar=0`} 
                              type="application/pdf"
                              className="w-full h-full"
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Doctor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-brand-lime"></div>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-2 text-gray-400 hover:text-brand-black transition-colors"
              >
                <X size={24} />
              </button>

              <div className="p-12">
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-brand-black tracking-tighter">New Doctor Node</h2>
                  <p className="text-sm font-medium text-gray-500 mt-2">Initialize provider profile and network access.</p>
                </div>

                <form onSubmit={handleAddDoctor} className="space-y-8">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all font-bold"
                        placeholder="Dr. John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all font-bold"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Email</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all font-bold"
                      placeholder="doctor@skintermo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                    <input 
                      type="tel" 
                      required
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all font-bold"
                      placeholder="+91..."
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-brand-black text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-brand-lime transition-all shadow-xl disabled:opacity-50"
                    >
                      {isSubmitting ? 'Synchronizing Node...' : 'Authorize Clinical Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Approval Success Modal */}
      <AnimatePresence>
        {approvalResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-md rounded-[3rem] p-12 text-center space-y-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-brand-lime"></div>
              <div className="w-20 h-20 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="text-brand-lime" size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tighter text-brand-black">Authorization Issued</h3>
                <p className="text-sm font-medium text-gray-500">Security protocols have been established for the provider node.</p>
              </div>

              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 text-left space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Access Email</p>
                  <p className="text-sm font-bold font-mono text-brand-black">{approvalResult.email}</p>
                </div>
                {approvalResult.pass && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Temporary Protocol Key</p>
                    <p className="text-xl font-black font-mono text-brand-blue tracking-wider">{approvalResult.pass}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setApprovalResult(null)}
                className="w-full py-5 bg-brand-black text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-brand-lime hover:text-black transition-all"
              >
                Close Secure Terminal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


