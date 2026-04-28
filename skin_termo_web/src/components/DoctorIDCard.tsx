import React from 'react';
import { API_BASE_URL } from '../api/config';

interface DoctorProps {
    name: string;
    profile: {
        profilePictureUrl?: string;
        specialization?: string;
        licenceNumber?: string;
        verificationStatus?: 'verified' | 'pending' | 'rejected';
    }
}

const DoctorIDCard: React.FC<{ doctor: DoctorProps }> = ({ doctor }) => {
  return (
    <div className="flex glass hover:scale-[1.02] transition-all rounded-2xl border border-white/10 overflow-hidden max-w-sm m-4 relative shadow-2xl">
      <div className="w-1/3 bg-primary/20 relative flex flex-col justify-center items-center p-6 border-r border-white/10">
        {doctor.profile.profilePictureUrl ? (
          <img 
            src={`${API_BASE_URL}${doctor.profile.profilePictureUrl}`} 
            alt="Doctor Profile" 
            className="w-20 h-20 rounded-2xl border-2 border-primary/50 object-cover shadow-lg" 
          />
        ) : (
           <div className="w-20 h-20 rounded-2xl border-2 border-white/20 bg-white/5 flex items-center justify-center text-text-secondary text-xs">IMG</div>
        )}
      </div>
      <div className="w-2/3 p-6 flex flex-col justify-center">
        <h3 className="text-xl font-bold text-white uppercase leading-none mb-2">{doctor.name}</h3>
        <p className="text-sm font-semibold text-primary mb-4">{doctor.profile?.specialization || 'Medical Specialist'}</p>
        
        <div className="text-xs text-text-secondary space-y-2">
          <p className="flex justify-between">
            <span className="font-bold">Licence No:</span> 
            <span className="text-white">{doctor.profile?.licenceNumber || 'Pending'}</span>
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold">Status:</span> 
            <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold text-white ${
                doctor.profile?.verificationStatus === 'verified' ? 'bg-success' : 
                doctor.profile?.verificationStatus === 'rejected' ? 'bg-error' : 'bg-warning'
            }`}>
               {doctor.profile?.verificationStatus || 'PENDING'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorIDCard;
