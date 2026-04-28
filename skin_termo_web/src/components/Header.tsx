import React from 'react';
import { Bell, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const userName = localStorage.getItem('userName') || 'Guest User';
  const userRole = localStorage.getItem('userRole') || 'User';
  
  // Calculate initials
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="header">
      <button 
        onClick={() => navigate(-1)}
        className="mr-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-all"
        title="Go Back"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl w-96">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search items, users, reports..." 
          className="bg-transparent border-none p-0 focus:shadow-none text-sm w-full"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full border border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right">
            <p className="text-sm font-bold">{userName}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{userRole} Role</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold border border-white shadow-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
