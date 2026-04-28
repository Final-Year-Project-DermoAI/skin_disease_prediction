import React, { useState, useRef } from 'react';
import { Scan, CheckCircle, AlertCircle, RefreshCw, Camera, Activity, ShieldAlert, Sparkles, Clipboard, Download, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../../api/config';

interface DiagnosticResult {
  disease_name: string;
  confidence: string;
  description: string;
  severity: string;
  symptoms: string[];
  recommendations: string[];
  seek_medical_attention: boolean;
  image_url?: string;
}

const ScanningPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const reportRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Clear previous result
    }
  };

  const startScan = async () => {
    if (!selectedFile) {
      alert('Please select an image first.');
      return;
    }

    setIsScanning(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        try {
          const response = await api.post('/analysis/scan', {
            image_base64: base64
          });
          setResult(response.data);
        } catch (err: any) {
          console.error(err);
          alert(err.response?.data?.detail || 'skintermo.ai Engine failed to process sequence.');
        } finally {
          setIsScanning(false);
        }
      };
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const downloadPDF = () => {
    if (!result) return;
    
    // Smoothly trigger the browser's native, high-fidelity PDF engine
    // This supports modern CSS (oklch) perfectly and produces searchable text
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* Header Section */}
      <div className="no-print flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="px-3 py-1 bg-brand-lime text-black text-[9px] font-black uppercase tracking-widest rounded-lg">Pulse Active</div>
            <div className="flex items-center gap-2 text-gray-400">
                <Sparkles size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Powered by skintermo.ai Clinical Engine</span>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-brand-black">Dermal Intelligence Scan</h1>
          <p className="text-sm font-medium text-gray-500 mt-4 max-w-xl leading-relaxed">
            Utilizing neural-synapse image recognition to sequence skin biomarkers. Our skintermo.ai engine provides clinical-grade preliminary analysis.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Load</p>
                <p className="text-sm font-black text-brand-black">Optimal 14ms</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-black flex items-center justify-center text-white">
                <Activity size={24} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Upload & Preview Side */}
        <div className="no-print lg:col-span-5 space-y-8">
          <div className={`relative rounded-[3rem] overflow-hidden border-2 border-dashed transition-all duration-500 min-h-[450px] shadow-sm flex flex-col items-center justify-center bg-white ${isScanning ? 'border-brand-lime' : 'border-gray-100 hover:border-brand-black hover:shadow-2xl'}`}>
            {!isScanning && (
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                accept="image/*"
              />
            )}
            
            {previewUrl ? (
              <img src={previewUrl} className={`w-full h-full object-cover transition-all duration-700 ${isScanning ? 'brightness-50 scale-105' : ''}`} alt="Skin Sample" />
            ) : (
                <div className="flex flex-col items-center text-center p-10">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8">
                        <Camera size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-brand-black mb-2 uppercase tracking-tight">Initialize Probe</h3>
                    <p className="text-xs font-bold text-gray-400 max-w-xs leading-relaxed uppercase tracking-widest">Drop Clinical Snapshot or Browse Files to begin sequencing</p>
                </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <div className="w-16 h-16 border-4 border-brand-lime/20 border-t-brand-lime rounded-full animate-spin mb-6"></div>
                <p className="text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse">Scanning Bio-Markers...</p>
                <div className="absolute left-0 right-0 h-1 bg-brand-lime shadow-[0_0_30px_#DAF185] animate-scan-line top-0"></div>
              </div>
            )}
          </div>

          <button 
            onClick={startScan}
            disabled={isScanning || !selectedFile}
            className="w-full py-6 rounded-[2rem] bg-brand-black text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-blue hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-4"
          >
            {isScanning ? <RefreshCw className="animate-spin" size={24} /> : <Scan size={24} />}
            {isScanning ? 'Sequencing...' : 'Execute Diagnostic Scan'}
          </button>
        </div>

        {/* Report & Recommendations Side */}
        <div className="lg:col-span-7">
          <div ref={reportRef} id="clinical-report-container" className="glass-card h-full min-h-[450px] bg-white border-gray-100 p-10 flex flex-col shadow-xl rounded-[3rem]">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        <Clipboard size={20} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-black text-brand-black uppercase tracking-tight">Clinical Report Stream</h3>
                </div>
                {result && (
                    <div className="flex items-center gap-2">
                        <Download 
                          size={18} 
                          className={`text-gray-300 hover:text-black cursor-pointer transition-colors ${isGeneratingPDF ? 'animate-bounce' : ''}`} 
                          onClick={downloadPDF}
                        />
                    </div>
                )}
            </div>

            {/* Clinical Evidence Image (Included in PDF) */}
            {previewUrl && (
              <div className="mb-10 rounded-[2.5rem] overflow-hidden border-4 border-gray-50 shadow-sm max-h-[300px]">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Evidence Snapshot</p>
                </div>
                <img src={previewUrl} className="w-full h-full object-cover" alt="Clinical Evidence" />
              </div>
            )}
            
            <AnimatePresence mode="wait">
                {result ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10 flex-1"
                >
                    {/* Primary Findings */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 p-8 bg-black rounded-[2.5rem] text-white">
                            <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShieldAlert size={12} /> skintermo.ai Primary Suspect
                            </p>
                            <h4 className="text-3xl font-black tracking-tighter">{result.disease_name}</h4>
                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-lime" style={{ width: result.confidence }}></div>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{result.confidence} Match</span>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 text-center min-w-[180px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Risk Severity</p>
                            <div className={`text-4xl font-black tracking-tighter ${result.severity === 'Severe' ? 'text-red-500' : 'text-orange-500'}`}>
                                {result.severity}
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase tracking-widest">Protocol Response Required</p>
                        </div>
                    </div>

                    {/* Symptoms & Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Clinical Symptoms</p>
                            <div className="flex flex-wrap gap-2">
                                {result.symptoms.map((s, i) => (
                                    <span key={i} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-brand-black uppercase tracking-tight shadow-sm">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Analysis Synthesis</p>
                            <p className="text-xs text-gray-500 leading-relaxed font-bold italic">
                                "{result.description}"
                            </p>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="p-8 bg-brand-blue/5 border border-brand-blue/10 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                                <CheckCircle size={16} className="text-brand-blue" />
                            </div>
                            <p className="text-xs font-black text-brand-blue uppercase tracking-widest">Initial Clinical Protocol</p>
                        </div>
                        <ul className="space-y-4">
                            {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-4 text-xs font-bold text-gray-700 leading-relaxed">
                                    <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-brand-blue shadow-sm shrink-0">{i+1}</span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 flex gap-4 no-print">
                        <button 
                          onClick={downloadPDF}
                          disabled={isGeneratingPDF}
                          className="flex-1 py-5 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isGeneratingPDF ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            {isGeneratingPDF ? 'Generating...' : 'Export clinical data (PDF)'}
                        </button>
                        <button className="flex-1 py-5 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl">
                            <MessageSquare size={16} /> Consult Specialist
                        </button>
                    </div>
                </motion.div>
                ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6 animate-pulse">
                        <AlertCircle size={32} className="text-gray-200" />
                    </div>
                    <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No Probe Data Received</p>
                    <p className="text-[10px] font-bold text-gray-300 mt-2 uppercase tracking-wide">Upload an image to trigger skintermo.ai diagnostics</p>
                </div>
                )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
        }
        .animate-scan-line {
            animation: scanLine 3s infinite ease-in-out;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
        }
        @media print {
            body * {
                visibility: hidden;
            }
            #clinical-report-container, #clinical-report-container * {
                visibility: visible;
            }
            #clinical-report-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
            }
            .no-print {
                display: none !important;
            }
        }
      `}</style>
    </div>
  );
};

export default ScanningPage;
