import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Folder, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Activity, 
  Scan, 
  Grid,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import type { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const doctorLinks = [
    { icon: Home, label: 'Dashboard', path: '/doctor/dashboard' },
    { icon: Folder, label: 'Patient Report', path: '/doctor/reports' },
    { icon: Users, label: 'Patient Connection', path: '/doctor/requests' },
    { icon: MessageSquare, label: 'Chat', path: '/doctor/chatbot' },
    { icon: Settings, label: 'Settings', path: '/doctor/profile' },
  ];

  const patientLinks = [
    { icon: Home, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: Scan, label: 'Patient Report', path: '/patient/scanning' },
    { icon: Grid, label: 'Doctors Connection', path: '/patient/doctors' },
    { icon: MessageSquare, label: 'Chat', path: '/patient/chatbot' },
    { icon: Settings, label: 'Settings', path: '/patient/profile' },
  ];

  const adminLinks = [
    { icon: ShieldCheck, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Patient Registry', path: '/admin/patients' },
    { icon: Activity, label: 'Node Monitor', path: '/admin/doctors' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const links = role === 'DOCTOR' ? doctorLinks : role === 'PATIENT' ? patientLinks : adminLinks;

  return (
    <aside 
      className={`relative h-screen bg-white border-r border-gray-100 transition-all duration-300 ease-in-out z-50 flex flex-col ${
        isExpanded ? 'w-72' : 'w-24'
      }`}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-10 bg-black text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Logo Section */}
      <div className={`p-6 mb-6 ${!isExpanded ? 'flex justify-center' : ''}`}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SkinTermo Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg flex-shrink-0 bg-white" />
          {isExpanded && (
            <h2 className="text-lg font-black uppercase tracking-tighter whitespace-nowrap overflow-hidden">
              SKINTERMO AI
            </h2>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            title={!isExpanded ? link.label : ''}
            className={({ isActive }) => `
              flex items-center gap-4 px-5 py-3.5 transition-all duration-300 rounded-2xl group
              ${isActive 
                ? 'bg-brand-lime/10 text-brand-black font-bold border border-brand-lime/20' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-black'}
              ${!isExpanded ? 'justify-center' : ''}
            `}
          >
            <link.icon size={20} className={!isExpanded ? 'flex-shrink-0' : ''} />
            {isExpanded && (
              <span className="text-sm tracking-tight whitespace-nowrap overflow-hidden">
                {link.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className={`p-6 border-t border-gray-50 ${!isExpanded ? 'flex flex-col items-center gap-6' : ''}`}>
        {isExpanded && (
          <div className="p-4 bg-gray-50 rounded-2xl mb-6 border border-gray-100 overflow-hidden">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">R&D Tier</p>
            <p className="text-xs font-bold text-brand-blue truncate">Enterprise Member</p>
          </div>
        )}
        
        <button 
          onClick={handleLogout}
          title={!isExpanded ? 'Logout' : ''}
          className={`flex items-center gap-4 px-5 py-3 text-status-error hover:bg-red-50 transition-all rounded-2xl w-full
            ${!isExpanded ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {isExpanded && <span className="text-sm font-bold">Terminal Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
