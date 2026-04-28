import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  LabelList
} from 'recharts';
import { 
  TrendingUp, 
  Cpu, 
  Layers, 
  Zap, 
  Shield, 
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';

const data = [
  { name: 'ResNet50', accuracy: 88.2, latency: 45, memory: 102, complexity: 75, reliability: 85 },
  { name: 'MobileNetV2', accuracy: 86.5, latency: 12, memory: 14, complexity: 30, reliability: 82 },
  { name: 'InceptionV3', accuracy: 89.1, latency: 55, memory: 92, complexity: 80, reliability: 88 },
  { name: 'EfficientNet-B0', accuracy: 90.4, latency: 25, memory: 20, complexity: 45, reliability: 90 },
  { name: 'DaViT (Proposed)', accuracy: 93.6, latency: 18, memory: 35, complexity: 60, reliability: 98 },
];

const COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DAF185'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-black text-white p-4 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md">
        <p className="text-xs font-black uppercase tracking-widest text-brand-lime mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-8 py-1">
            <span className="text-[10px] font-bold text-gray-400">{entry.name}:</span>
            <span className="text-sm font-black">{entry.value}{entry.name === 'accuracy' ? '%' : ''}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ModelComparisonSection() {
  return (
    <section id="comparison" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-brand-lime/10 text-brand-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Shield size={14} className="text-brand-black" />
              Technical Benchmark v4.2
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-brand-black leading-none">
              How We <span className="text-gray-400">Outperform</span> Industry Standards
            </h2>
            <p className="text-lg font-medium text-gray-500 max-w-2xl leading-relaxed">
              Our proposed DaViT architecture achieves higher diagnostic precision with significantly lower computational overhead compared to traditional neural networks.
            </p>
          </div>
        </div>

        {/* Main Metric: Accuracy Bar Chart */}
        <div className="grid grid-cols-1 gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 lg:p-12"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-brand-lime/10 text-brand-black rounded-3xl">
                  <TrendingUp size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Classification Accuracy</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Cross-validation score on public dermatology datasets</p>
                </div>
              </div>
            </div>

            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }}
                    dy={15}
                  />
                  <YAxis 
                    domain={[80, 95]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="accuracy" 
                    radius={[16, 16, 0, 0]} 
                    barSize={80}
                  >
                    <LabelList dataKey="name" position="top" offset={15} fill="#1A1A1A" fontSize={10} fontWeight="900" />
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name.includes('Proposed') ? '#DAF185' : '#F3F4F6'}
                        className="transition-all duration-500 hover:brightness-95 cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Secondary Charts: Multi-Metric Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Latency Plot */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 bg-gray-50 border-none"
          >
            <div className="flex items-center gap-5 mb-10">
              <div className="p-4 bg-white rounded-2xl shadow-sm text-brand-blue">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Performance Efficiency</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accuracy vs Inference Time</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 30, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    type="number" dataKey="latency" name="Latency" unit="ms" 
                    axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 9 }}
                  />
                  <YAxis 
                    type="number" dataKey="accuracy" name="Accuracy" unit="%" 
                    axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 9 }}
                  />
                  <ZAxis type="number" dataKey="memory" range={[100, 500]} name="Memory" unit="MB" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter name="Models" data={data}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name.includes('Proposed') ? '#DAF185' : COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList 
                      dataKey="name" 
                      position="top" 
                      offset={12} 
                      fill="#1A1A1A" 
                      fontSize={10} 
                      fontWeight="700" 
                    />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Radar Metrics */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 bg-brand-black text-white border-none"
          >
            <div className="flex items-center gap-5 mb-10">
              <div className="p-4 bg-white/10 rounded-2xl text-brand-lime">
                <Cpu size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Architectural Integrity</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">DaViT Multi-dimensional Evaluation</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { subject: 'Accuracy', value: 93 },
                  { subject: 'Speed', value: 85 },
                  { subject: 'Memory', value: 78 },
                  { subject: 'Reliability', value: 98 },
                  { subject: 'Sovereignty', value: 100 },
                ]}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 9, fontWeight: 700 }} />
                  <PolarRadiusAxis hide />
                  <Radar name="DaViT (Proposed)" dataKey="value" stroke="#DAF185" fill="#DAF185" fillOpacity={0.4} />
                  <Legend verticalAlign="bottom" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Global Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 p-10 bg-brand-lime rounded-[3rem] text-brand-black">
            <h3 className="text-2xl font-black tracking-tighter mb-4 text-brand-black">Scientific Summary</h3>
            <p className="text-sm font-bold opacity-80 leading-relaxed mb-8 text-brand-black">
              The integration of Vision Transformers with Dynamic Attention (DaViT) allows for a significant leap in diagnostical sensitivity without the heavy footprint of legacy frameworks.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <span className="text-[10px] uppercase font-black tracking-widest">Rank</span>
                <span className="text-sm font-black">#01 Global Node</span>
              </div>
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <span className="text-[10px] uppercase font-black tracking-widest">Validation</span>
                <span className="text-sm font-black">Clinical Grade</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 glass-card p-10 border-gray-100 flex flex-col">
            <h3 className="text-xl font-black tracking-tight mb-8">Ecosystem Reliability</h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DAF185" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#DAF185" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="reliability" stroke="#DAF185" fillOpacity={1} fill="url(#colorAcc)" dot={{ fill: '#1A1A1A', r: 4 }}>
                    <LabelList dataKey="name" position="top" offset={10} fill="#1A1A1A" fontSize={8} fontWeight="700" />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
