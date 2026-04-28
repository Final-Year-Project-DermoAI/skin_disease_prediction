import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../api/config';
import { User, Shield, Bell, Key, LogOut, ExternalLink, ChevronRight, Camera, Save, Loader2, Hospital, Briefcase, Image as ImageIcon, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_image: string | null;
  banner_image: string | null;
  details: any;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [editData, setEditData] = useState<any>({ firstName: '', lastName: '', details: {} });
  const [isDragging, setIsDragging] = useState<{ type: 'profile' | 'banner' | null }>({ type: null });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const data = response.data;
      setProfile({
        id: data.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role.toLowerCase(),
        profile_image: data.profileImage || null,
        banner_image: data.bannerImage || null,
        details: data.details || {}
      });
      setEditData({
        firstName: data.firstName,
        lastName: data.lastName,
        details: data.details || {}
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/me', editData);
      alert('Security Protocols Updated Successfully');
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'banner') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image_type', type);

    try {
      await api.post('/auth/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchProfile();
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Upload failed.');
    }
  };

  const onDrop = (e: React.DragEvent, type: 'profile' | 'banner') => {
    e.preventDefault();
    setIsDragging({ type: null });
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file, type);
    }
  };

  const getRoleAccent = () => {
    switch (profile?.role) {
      case 'doctor': return 'bg-blue-600';
      case 'patient': return 'bg-[#DAF185]';
      case 'admin': return 'bg-brand-black';
      default: return 'bg-gray-400';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-brand-lime" size={48} />
    </div>
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20 px-4">
      {/* Header Section (Banner + Overlapping Avatar) */}
      <div className="relative mb-32 group/header">
        {/* Banner Section */}
        <div 
          className={`h-64 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 relative ${getRoleAccent()}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging({ type: 'banner' }); }}
          onDragLeave={() => setIsDragging({ type: null })}
          onDrop={(e) => onDrop(e, 'banner')}
        >
          {profile?.banner_image ? (
            <img src={`${API_BASE_URL}${profile.banner_image}`} className="w-full h-full object-cover" alt="Banner" />
          ) : (
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          )}
          
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity z-10 ${isDragging.type === 'banner' ? 'opacity-100' : 'opacity-0 group-hover/header:opacity-100'}`}>
            <label className="cursor-pointer flex flex-col items-center gap-2 text-white">
              <ImageIcon size={32} />
              <span className="text-xs font-black uppercase tracking-widest">Update Banner Protocol</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'banner')} />
            </label>
          </div>
        </div>

        {/* Floating Identity Section (Overlapping) */}
        <div className="absolute -bottom-16 left-12 flex items-end gap-10 z-20">
            <div 
              className="relative group/avatar"
              onDragOver={(e) => { e.preventDefault(); setIsDragging({ type: 'profile' }); }}
              onDragLeave={() => setIsDragging({ type: null })}
              onDrop={(e) => onDrop(e, 'profile')}
            >
                <div className="w-44 h-44 rounded-full bg-white flex items-center justify-center text-7xl font-black border-[10px] border-white shadow-2xl overflow-hidden transition-transform group-hover/avatar:scale-[1.03]">
                    {profile?.profile_image ? (
                      <img src={`${API_BASE_URL}${profile.profile_image}`} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <span className="text-brand-black">{profile?.name.charAt(0)}</span>
                    )}
                </div>
                
                {/* Profile Upload Overlay */}
                <label className="absolute bottom-3 right-3 bg-brand-black text-white p-3.5 rounded-2xl border-4 border-white shadow-xl cursor-pointer hover:scale-110 transition-transform z-30">
                    <Camera size={22} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'profile')} />
                </label>

                {isDragging.type === 'profile' && (
                  <div className="absolute inset-0 bg-brand-lime/90 rounded-full flex items-center justify-center z-40">
                    <Upload size={40} className="text-black animate-bounce" />
                  </div>
                )}
            </div>

            <div className="pb-6">
                <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl mb-3">
                  {profile?.name}
                </h1>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-white/30 ${getRoleAccent()}`}>
                    {profile?.role} AUTHORIZED
                  </span>
                  <span className="text-white/90 font-bold text-xs uppercase tracking-widest bg-black/30 px-4 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                    ID: #RX-{profile?.id.toString().padStart(5, '0')}
                  </span>
                </div>
            </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mt-32">
        <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-5 space-y-2">
                {[
                    { id: 'account', icon: User, label: 'Identity' },
                    { id: 'details', icon: Shield, label: 'Bio-Protocol' },
                ].map((item) => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <div className="flex items-center gap-4">
                            <item.icon size={20} />
                            <span className="text-sm font-bold">{item.label}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-10 bg-white"
            >
              {activeTab === 'account' ? (
                <div className="space-y-8">
                  <h3 className="text-2xl font-black">Identity Parameters</h3>
                  <div className="grid grid-cols-2 gap-8">
                      <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Legal Name</label>
                          <input 
                            type="text" 
                            value={editData.name} 
                            onChange={e => setEditData({...editData, name: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-black outline-none transition-all" 
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                          <input type="email" value={profile?.email} className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-400 opacity-60" disabled />
                      </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <h3 className="text-2xl font-black">Bio-Protocol Data</h3>
                  <div className="grid grid-cols-2 gap-8">
                    {profile?.role === 'patient' ? (
                      <>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Age</label>
                            <input 
                              type="number" 
                              value={editData.details.age || ''} 
                              onChange={e => setEditData({...editData, details: {...editData.details, age: e.target.value}})}
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-black outline-none transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gender</label>
                            <select 
                              value={editData.details.gender || ''} 
                              onChange={e => setEditData({...editData, details: {...editData.details, gender: e.target.value}})}
                              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-black outline-none transition-all"
                            >
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2 text-center py-10 text-gray-400">
                        Professional protocol data managed via admin terminal.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
                <button onClick={handleUpdate} disabled={saving} className="bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Sync Protocols
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
