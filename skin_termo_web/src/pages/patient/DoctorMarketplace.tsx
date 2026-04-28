import React from 'react';
import { Search, MapPin, Star, ShieldCheck, Activity, Calendar, ArrowRight, Filter } from 'lucide-react';

const DoctorMarketplace: React.FC = () => {
    const doctors = [
        {
            id: '1',
            name: 'Dr. Sarah Mitchell',
            specialty: 'Clinical Dermatologist',
            location: 'Bangalore, Campus A',
            rating: 4.9,
            reviews: 124,
            image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200',
            availability: 'Available Today',
            experience: '12 Years'
        },
        {
            id: '2',
            name: 'Dr. James Chen',
            specialty: 'Surgical Dermatology',
            location: 'Remote Consultation',
            rating: 4.8,
            reviews: 89,
            image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
            availability: 'Next: Monday',
            experience: '8 Years'
        },
        {
            id: '3',
            name: 'Dr. Elena Rodriguez',
            specialty: 'Pediatric Dermatology',
            location: 'Bangalore, Digital Lab',
            rating: 5.0,
            reviews: 210,
            image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
            availability: 'Available Now',
            experience: '15 Years'
        }
    ];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight">Expert Council Marketplace</h1>
          <p className="text-text-secondary mt-2">Connect with verified dermatologists within the SkinTermo AI network for clinical validation.</p>
        </div>
        <div className="flex gap-3">
            <button className="px-6 py-3 rounded-full border border-gray-200 font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
                <Filter size={16} /> Filters
            </button>
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by name, specialty..." 
                    className="pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-full w-64 focus:border-black transition-all"
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div key={doc.id} className="glass-card group flex flex-col hover:border-black transition-all">
            <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                    <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute -bottom-1 -right-1 bg-brand-lime p-1 rounded-lg shadow-sm border border-white">
                        <ShieldCheck size={12} className="text-black" />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg leading-tight">{doc.name}</h3>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-brand-blue mt-1">{doc.specialty}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold">
                        <Star size={12} className="fill-brand-lime text-brand-lime" />
                        <span>{doc.rating}</span>
                        <span className="text-gray-400 font-medium">({doc.reviews} reviews)</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <MapPin size={14} /> {doc.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Activity size={14} /> {doc.experience} Experience
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-status-success">
                    <Calendar size={14} /> {doc.availability}
                </div>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 py-3 px-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs hover:bg-black hover:text-white transition-all">
                    View Profile
                </button>
                <button className="flex-[1.5] py-3 px-4 bg-black text-white rounded-xl font-bold text-xs hover:bg-black/90 flex items-center justify-center gap-2 group-hover:bg-brand-blue transition-all">
                    Consult <ArrowRight size={14} />
                </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card bg-brand-blue text-white p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-brand-blue shadow-2xl overflow-hidden relative">
          <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tighter mb-2">Can't Find Your Specialist?</h2>
              <p className="text-gray-300 max-w-md">Our AI marketplace is constantly expanding. Request a specific laboratory node for validation.</p>
          </div>
          <button className="btn bg-brand-lime text-black border-none px-10 relative z-10 hover:scale-110">
              Request Lab Node
          </button>
          
          {/* Subtle Decorative Circle */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-brand-lime/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default DoctorMarketplace;
