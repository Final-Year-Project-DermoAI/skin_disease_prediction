import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight, 
  Search,
  LayoutGrid,
  Bell,
  Clock
} from 'lucide-react';
import api from '../../api/config';

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  trend?: string;
  color: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon: Icon, trend, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500 relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 ${color}`} />
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-4 rounded-2xl ${color.replace('bg-', 'bg-opacity-10 ')} ${color.replace('bg-', 'text-')}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-50 px-2 py-1 rounded-lg">
          <ArrowUpRight size={12} />
          {trend}
        </div>
      )}
    </div>
    
    <div className="relative z-10">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h3 className="text-4xl font-black text-brand-black tracking-tighter">{count}</h3>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    verifiedDoctors: 0,
    pendingDoctors: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/users');
        const users = response.data;
        
        const patients = users.filter((u: any) => u.role === 'PATIENT').length;
        const verifiedDoctors = users.filter((u: any) => u.role === 'DOCTOR' && u.status === 'APPROVED').length;
        const pendingDoctors = users.filter((u: any) => u.role === 'DOCTOR' && u.status === 'PENDING').length;
        
        setStats({ patients, verifiedDoctors, pendingDoctors });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-brand-black">System Overview</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">Real-time metrics for the Med-Pro network nodes.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search nodes..." 
              className="pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all w-64"
            />
          </div>
          <button className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-500 hover:text-black hover:bg-white transition-all shadow-sm">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="Total Patients" 
          count={stats.patients} 
          icon={Users} 
          trend="+12%" 
          color="bg-brand-blue" 
          delay={0.1}
        />
        <StatCard 
          title="Verified Doctors" 
          count={stats.verifiedDoctors} 
          icon={ShieldCheck} 
          trend="+4%" 
          color="bg-brand-lime" 
          delay={0.2}
        />
        <StatCard 
          title="Pending Requests" 
          count={stats.pendingDoctors} 
          icon={Activity} 
          trend="Critical" 
          color="bg-orange-500" 
          delay={0.3}
        />
      </div>

      {/* Secondary Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Recent Activity */}
        <div className="glass-card p-10 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
              <Clock className="text-brand-lime" size={20} />
              Protocol Activity
            </h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-black transition-colors">View Log</button>
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-brand-lime/10 group-hover:text-brand-lime transition-colors mt-1">
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-black">New Doctor Registration</p>
                  <p className="text-xs text-gray-400 mt-1">Provider ID: NODE-X{i}09304 has requested network access.</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-lime mt-2">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder for Network Health */}
        <div className="glass-card p-10 bg-brand-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/10 to-transparent pointer-events-none" />
          <h3 className="text-xl font-black tracking-tight flex items-center gap-3 relative z-10">
            <ShieldCheck className="text-brand-lime" size={20} />
            Network Integrity
          </h3>
          <p className="text-xs text-gray-400 mt-2 font-medium relative z-10">All systems operational within standard medical protocols.</p>
          
          <div className="mt-12 space-y-6 relative z-10">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Database Sync</span>
                <span className="text-brand-lime">99.9%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '99.9%' }}
                  className="h-full bg-brand-lime"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>API Response Time</span>
                <span className="text-brand-lime">24ms</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  className="h-full bg-brand-lime"
                />
              </div>
            </div>
          </div>
          
          <button className="mt-10 w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            Run Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
