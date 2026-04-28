import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Scan, 
  ChevronLeft, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import api from '../api/config';

export default function PatientSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'PATIENT'
      });

      // Navigate to login after successful signup
      navigate('/login', { state: { message: 'Account created! Please authorize access.' } });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-4 relative overflow-hidden py-20">
      {/* Background Decor */}
      <div className="fixed top-0 -left-4 w-96 h-96 bg-[#C5C6FC] rounded-full mix-blend-multiply filter opacity-50 animate-blob"></div>
      <div className="fixed top-0 -right-4 w-96 h-96 bg-[#FDA7D8] rounded-full mix-blend-multiply filter opacity-50 animate-blob animation-delay-2000"></div>
      <div className="fixed -bottom-8 left-20 w-96 h-96 bg-[#DAF185] rounded-full mix-blend-multiply filter opacity-50 animate-blob animation-delay-4000"></div>

      {/* Back Button */}
      <button 
        onClick={() => navigate('/login')}
        className="fixed top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors z-50 group"
      >
        <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
          <ChevronLeft size={20} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest bg-white/50 backdrop-blur-sm px-3 py-1 rounded-lg">Authorize Access</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white/90 backdrop-blur-xl rounded-[3rem] p-12 w-full max-w-2xl shadow-2xl border border-white"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform rotate-6">
            <Scan className="text-brand-lime" size={36} />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-brand-black mb-2">Create Account</h1>
          <p className="text-sm font-medium text-gray-400">Join the Med-Pro Network as a Patient</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
              <div className="relative">
                <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  name="firstName"
                  required
                  placeholder="John"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-bold"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                required
                placeholder="Doe"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-bold"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="john@example.com"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-bold"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="tel" 
                  name="phone"
                  required
                  placeholder="+91..."
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-bold"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-bold"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                required
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-bold"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-brand-black text-white rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50 group"
            >
              {loading ? "Initializing..." : (
                <>
                  Register Clinical Access
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">
              Joined before? <Link to="/login" className="text-brand-blue hover:underline">Authorize Access</Link>
            </p>
            <div className="flex items-center justify-center gap-2 text-green-500">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption Protocol</span>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
