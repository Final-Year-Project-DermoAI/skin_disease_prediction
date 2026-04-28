import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Camera, 
  Stethoscope, 
  Briefcase, 
  Award, 
  FileText, 
  MapPin, 
  Building2, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  Upload,
  ArrowLeft,
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';
import api from '../api/config';
import { useNavigate, Link } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';

const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: <User className="w-5 h-5" /> },
  { id: 'professional', title: 'Expertise', icon: <Stethoscope className="w-5 h-5" /> },
  { id: 'address', title: 'Practice Location', icon: <Building2 className="w-5 h-5" /> },
  { id: 'documents', title: 'Verification', icon: <ShieldCheck className="w-5 h-5" /> }
];

const DoctorSignup: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dignity: 'Dr.',
    homeLocation: '',
    specialization: '',
    experience: '',
    licenseNo: '',
    clinicName: '',
    physicalAddress: '',
  });

  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Files State
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    profileImage: null,
    licenseDoc: null,
    degreeCert: null
  });

  // Previews
  const [previews, setPreviews] = useState<{ [key: string]: string }>({
    profileImage: '',
    licenseDoc: '',
    degreeCert: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews(prev => ({ ...prev, [field]: 'PDF' }));
      }
    }
  };

  const nextStep = () => {
    // Basic validation before moving forward
    if (currentStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone) {
        setError("Please fill all personal details before continuing.");
        return;
      }
    }
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!files.licenseDoc || !files.degreeCert) {
      setError("Please upload all required verification documents.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const submitData = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'experience') submitData.append('yearOfExperience', value);
      else if (key === 'licenseNo') submitData.append('medicalLicenseNumber', value);
      else if (key === 'physicalAddress') submitData.append('clinicAddress', value);
      else submitData.append(key, value);
    });

    if (location) {
      submitData.append('latitude', location.lat.toString());
      submitData.append('longitude', location.lng.toString());
    }

    if (files.profileImage) submitData.append('profilePhoto', files.profileImage);
    if (files.licenseDoc) submitData.append('medicalLicenseDoc', files.licenseDoc);
    if (files.degreeCert) submitData.append('degreeCertificate', files.degreeCert);

    try {
      await api.post('/doctor/register', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 bg-gray-50 flex items-center justify-center relative shadow-inner">
                  {previews.profileImage ? (
                    <img src={previews.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-300" />
                  )}
                  <label className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]">
                    <Camera className="text-white w-6 h-6 outline-none" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profileImage')} />
                  </label>
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">Profile Photo</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Dignity</label>
                <select 
                  name="dignity"
                  value={formData.dignity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                >
                  <option>Dr.</option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Ms.</option>
                </select>
              </div>
              <div className="col-span-8 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="doctor@skintermo.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mobile</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Specialization</label>
              <div className="relative">
                <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g. Clinical Dermatology"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Experience (Years)</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="number" 
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g. 8"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Medical License No</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  name="licenseNo"
                  value={formData.licenseNo}
                  onChange={handleInputChange}
                  placeholder="REG-XXXXXX"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Clinic / Hospital Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleInputChange}
                  placeholder="City Skin Center"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Clinic Physical Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                <textarea 
                  name="physicalAddress"
                  value={formData.physicalAddress}
                  onChange={handleInputChange}
                  placeholder="Street, City, State..."
                  rows={2}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Pin Location on Map</label>
              <div className="rounded-xl border border-gray-100 overflow-hidden shadow-inner">
                <LocationPicker onLocationSelect={setLocation} />
              </div>
              {location && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-[0.2em] bg-green-50 w-fit px-3 py-1 rounded-full border border-green-100">
                  <Check size={12} strokeWidth={3} /> Verified: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Home Area/City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  name="homeLocation"
                  value={formData.homeLocation}
                  onChange={handleInputChange}
                  placeholder="Area Name, City"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[11px] text-primary/80 leading-relaxed font-medium">
                Upload scanned copies of your medical license and degree. We accept <span className="text-primary font-bold">PDF, JPG, or PNG</span>. Maximum file size 10MB each.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* License Upload */}
              <div className="space-y-2">
                <div 
                  className={`relative group border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${files.licenseDoc ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 bg-gray-50/30'}`}
                >
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf,image/*" onChange={(e) => handleFileChange(e, 'licenseDoc')} />
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors ${files.licenseDoc ? 'bg-primary text-white' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'}`}>
                    {files.licenseDoc ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                  </div>
                  <p className="text-xs font-bold text-gray-700">{files.licenseDoc ? files.licenseDoc.name : 'Medical License Document'}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Tap to upload</p>
                </div>
              </div>

              {/* Degree Upload */}
              <div className="space-y-2">
                <div 
                  className={`relative group border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${files.degreeCert ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 bg-gray-50/30'}`}
                >
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf,image/*" onChange={(e) => handleFileChange(e, 'degreeCert')} />
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors ${files.degreeCert ? 'bg-primary text-white' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'}`}>
                    {files.degreeCert ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                  </div>
                  <p className="text-xs font-bold text-gray-700">{files.degreeCert ? files.degreeCert.name : 'Degree Certificate'}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Tap to upload</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full glass-card p-12 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Application Received!</h2>
          <p className="text-text-secondary mb-8 leading-relaxed">Thank you for joining SkinTermo. Your profile is now under clinical review. We will notify you via email shortly.</p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: '100%' }} 
              transition={{ duration: 4 }}
              className="h-full bg-green-500" 
            />
          </div>
          <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Redirecting to login portal...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 md:p-12 relative overflow-hidden font-inter">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[100px] rounded-full animate-pulse duration-700" />

      <div className="max-w-5xl w-full flex flex-col md:flex-row glass-card overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative z-10 border border-white/40">
        
        {/* Left Side: Progress & Info */}
        <div className="w-full md:w-[380px] bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8 md:p-12 text-white flex flex-col">
          <Link to="/" className="inline-flex items-center gap-2 mb-10 text-white/60 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Home Portal</span>
          </Link>
          
          <div className="mb-12">
            <h1 className="text-4xl font-black mb-3 leading-tight tracking-tighter">MED-PRO<br/><span className="text-primary">ONBOARDING</span></h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Verify your credentials to start providing AI-assisted dermatological care.
            </p>
          </div>

          <div className="flex-1 space-y-10 relative">
            {/* Progress Line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-800" />
            
            {STEPS.map((step, idx) => {
              const isActive = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step.id} className="flex items-center gap-6 relative group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 z-10 transition-all duration-500 ease-out ${
                    isActive 
                      ? 'bg-primary border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] text-white' 
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}>
                    {idx < currentStep ? <Check className="w-5 h-5" strokeWidth={3} /> : step.icon}
                  </div>
                  <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-1' : 'opacity-30'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${isCurrent ? 'text-primary' : 'text-slate-400'}`}>Step {idx + 1}</p>
                    <p className="text-sm font-bold text-white tracking-tight">{step.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Active</p>
            </div>
            <p className="text-xs font-medium text-slate-300">verified@skintermo ai</p>
          </div>
        </div>

        {/* Right Side: Step Contents */}
        <div className="flex-1 bg-white flex flex-col">
          <div className="p-8 md:p-12 flex-1 overflow-y-auto max-h-[700px]">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-start gap-4 text-xs font-bold leading-relaxed"
              >
                <Info className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="mb-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                {STEPS[currentStep].title}
              </h2>
              <div className="w-12 h-1.5 bg-primary rounded-full" />
            </div>

            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="p-6 md:px-12 md:py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex-1">
              <button
                type="button"
                onClick={prevStep}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  currentStep === 0 
                    ? 'hidden' 
                    : 'text-slate-400 hover:text-slate-900 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Go Back
              </button>
            </div>

            <div className="flex items-center gap-4">
              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-3 px-8 py-4 bg-[#2563EB] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Save & Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  form="doctor-signup-form"
                  disabled={isLoading}
                  className="flex items-center gap-3 px-10 py-4 bg-[#0F172A] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    'Processing...'
                  ) : (
                    <>
                      Verify & Submit
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Form for Submission */}
        <form id="doctor-signup-form" onSubmit={handleSubmit} className="hidden" />
      </div>
    </div>
  );
};

export default DoctorSignup;
