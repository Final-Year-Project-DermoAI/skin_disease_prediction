import React, { useState } from 'react';
import api from '../../api/config';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  Award, 
  Stethoscope, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  CheckCircle,
  Loader2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationPicker from '../../components/LocationPicker';

const DoctorVerificationPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    specialization: '',
    experience_years: '',
    license_number: '',
    degree: '',
    clinic_name: '',
    address: '',
    latitude: '0',
    longitude: '0'
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    license_doc: null,
    degree_cert: null
  });

  const [isDragging, setIsDragging] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setIsDragging(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles({ ...files, [type]: e.dataTransfer.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real scenario, we should split full_name into firstName and lastName
    const nameParts = formData.full_name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const data = new FormData();
    
    // Mapping to Backend Field Names in src/controllers/doctorController.ts
    data.append('firstName', firstName);
    data.append('lastName', lastName);
    data.append('email', formData.email);
    data.append('phone', formData.phone_number);
    data.append('password', 'TemporaryPassword123!'); // Should be from a password field in a real app
    data.append('specialization', formData.specialization);
    data.append('yearOfExperience', formData.experience_years || "0");
    data.append('registrationNumber', formData.license_number);
    data.append('qualification', formData.degree);
    data.append('clinicName', formData.clinic_name);
    data.append('clinicAddress', formData.address);
    data.append('latitude', formData.latitude || "0");
    data.append('longitude', formData.longitude || "0");
    
    // Mapping Files to matches multer fields in src/routes/doctorRoutes.ts
    if (files.license_doc) data.append('medicalLicenseDoc', files.license_doc);
    if (files.degree_cert) data.append('degreeCertificate', files.degree_cert);

    try {
      await api.post('/doctor/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || 'Failed to submit verification request. Please check all fields.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card p-12 text-center space-y-8"
      >
        <div className="w-24 h-24 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="text-brand-lime" size={48} />
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-brand-black">Request Submitted</h2>
        <p className="text-gray-500 font-medium leading-relaxed">
          Your clinical verification node has been initialized. Our administrative board will review your credentials and issue your access protocols via email.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="btn btn-primary w-full py-4 rounded-2xl"
        >
          Return to Terminal
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-app-bg py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-black text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={14} className="text-brand-lime" />
            Medical Practitioner Verification
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-brand-black">Join the Expert Network</h1>
          <p className="text-gray-500 max-w-xl mx-auto font-medium">Complete your professional profile to begin providing clinical-grade AI-assisted diagnostics.</p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${step >= s ? 'bg-brand-black text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-brand-black' : 'bg-gray-100'} rounded-full`}></div>}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-12 space-y-10 bg-white/80">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-6 md:col-span-2">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                    <User className="text-brand-lime" size={20} /> Personal Identity
                  </h3>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Legal Name</label>
                  <input name="full_name" value={formData.full_name} onChange={handleInputChange} required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-black transition-all font-bold text-sm" placeholder="Dr. John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Professional Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-black transition-all font-bold text-sm" placeholder="john.doe@hospital.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Number</label>
                  <input name="phone_number" value={formData.phone_number} onChange={handleInputChange} required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-black transition-all font-bold text-sm" placeholder="+1 (555) 000-0000" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-6 md:col-span-2">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                    <Award className="text-brand-lime" size={20} /> Professional Credentials
                  </h3>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Specialization</label>
                  <input name="specialization" value={formData.specialization} onChange={handleInputChange} required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-black transition-all font-bold text-sm" placeholder="Dermatology, Oncology, etc." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Years of Experience</label>
                  <input name="experience_years" type="number" value={formData.experience_years} onChange={handleInputChange} required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-black transition-all font-bold text-sm" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Medical License Number</label>
                  <input name="license_number" value={formData.license_number} onChange={handleInputChange} required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-black transition-all font-bold text-sm" placeholder="LIC-99002233" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Highest Degree</label>
                  <input name="degree" value={formData.degree} onChange={handleInputChange} required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-black transition-all font-bold text-sm" placeholder="MD, MBBS, PhD" />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                  {/* License Drop */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">License Document</label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging('license'); }}
                      onDragLeave={() => setIsDragging(null)}
                      onDrop={(e) => handleFileDrop(e, 'license_doc')}
                      className={`relative h-40 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer overflow-hidden ${isDragging === 'license' ? 'border-brand-lime bg-brand-lime/5 scale-[1.02]' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                    >
                      {files.license_doc ? (
                        <div className="flex flex-col items-center gap-2 text-brand-lime">
                          <CheckCircle size={32} />
                          <span className="text-[10px] font-bold truncate max-w-[150px]">{files.license_doc.name}</span>
                        </div>
                      ) : (
                        <>
                          <FileText className="text-gray-300" size={32} />
                          <span className="text-[10px] font-bold text-gray-400">DRAG & DROP LICENSE</span>
                        </>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && setFiles({ ...files, license_doc: e.target.files[0] })} />
                    </div>
                  </div>

                  {/* Degree Drop */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Degree Certificate</label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging('degree'); }}
                      onDragLeave={() => setIsDragging(null)}
                      onDrop={(e) => handleFileDrop(e, 'degree_cert')}
                      className={`relative h-40 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer overflow-hidden ${isDragging === 'degree' ? 'border-brand-lime bg-brand-lime/5 scale-[1.02]' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                    >
                      {files.degree_cert ? (
                        <div className="flex flex-col items-center gap-2 text-brand-lime">
                          <CheckCircle size={32} />
                          <span className="text-[10px] font-bold truncate max-w-[150px]">{files.degree_cert.name}</span>
                        </div>
                      ) : (
                        <>
                          <Award className="text-gray-300" size={32} />
                          <span className="text-[10px] font-bold text-gray-400">DRAG & DROP DEGREE</span>
                        </>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && setFiles({ ...files, degree_cert: e.target.files[0] })} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-6 md:col-span-2">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                    <Stethoscope className="text-brand-lime" size={20} /> Clinical Information
                  </h3>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Primary Clinic / Hospital Name</label>
                  <input name="clinic_name" value={formData.clinic_name} onChange={handleInputChange} required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-black transition-all font-bold text-sm" placeholder="Central Dermatology Institute" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Clinical Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} required rows={3} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-black transition-all font-bold text-sm resize-none" placeholder="123 Medical Plaza, Health Square, CA 90210"></textarea>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Physical Clinic Location</label>
                  <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                    <LocationPicker 
                      onLocationSelect={(pos) => setFormData({ ...formData, latitude: pos.lat.toString(), longitude: pos.lng.toString() })} 
                    />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-[10px] font-mono text-gray-400">
                      LAT: {formData.latitude}
                    </div>
                    <div className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-[10px] font-mono text-gray-400">
                      LNG: {formData.longitude}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-10 border-t border-gray-50">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all"
              >
                <ChevronLeft size={18} /> Protocol Back
              </button>
            ) : <div />}
            
            {step < 3 ? (
              <button 
                type="button" 
                onClick={() => setStep(step + 1)}
                className="btn btn-primary px-10 py-5 flex items-center gap-3"
              >
                Next Sequence <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary px-12 py-5 flex items-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                Initialize Verification
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorVerificationPage;
