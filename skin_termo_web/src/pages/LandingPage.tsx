import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  Activity,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ModelComparisonSection from '../components/ModelComparisonSection';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navLinks = [
    { name: 'Home', href: '#home', type: 'hash' },
    { name: 'About', href: '#about', type: 'hash' },
    { name: 'Experts', href: '#doctors', type: 'hash' },
    { name: 'Comparison', href: '#comparison', type: 'hash' },
    { name: 'Contact', href: '#contact', type: 'hash' },
  ];

  const doctorSteps = [
    {
      title: 'Credential Verification',
      desc: 'Submit your medical license and certifications for administrative review.',
      icon: <ShieldCheck className="w-6 h-6 text-brand-lime" />
    },
    {
      title: 'AI Report Analysis',
      desc: 'Review high-resolution scans and AI-generated diagnostic probability reports.',
      icon: <Activity className="w-6 h-6 text-brand-lime" />
    },
    {
      title: 'Clinical Consultation',
      desc: 'Connect with patients, validate findings, and issue secure digital prescriptions.',
      icon: <MessageSquare className="w-6 h-6 text-brand-lime" />
    }
  ];

  const features = [
    {
      icon: <Search className="w-8 h-8 text-brand-lime" />,
      title: 'AI-Powered Scan',
      description: 'Advanced machine learning algorithms to analyze skin conditions with high precision.'
    },
    {
      icon: <Activity className="w-8 h-8 text-brand-lime" />,
      title: 'Detailed Reports',
      description: 'Receive comprehensive analysis and understanding of detected skin conditions.'
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-brand-lime" />,
      title: 'Doctor Consultation',
      description: 'Directly connect with dermatologists for professional medical advice and prescriptions.'
    }
  ];

  const comparisonData = [
    { feature: 'Accuracy', traditional: 'Varies', platform: '98.5% (AI-Verified)' },
    { feature: 'Wait Time', traditional: '2-4 Weeks', platform: 'Instant / < 24h for MD' },
    { feature: 'Cost', traditional: '$$$', platform: '$' },
    { feature: 'Accessibility', traditional: 'Hospital Only', platform: 'Anywhere, Anytime' },
  ];

  return (
    <div className="min-h-screen bg-app-bg text-brand-black">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <img src="/logo.png" alt="SkinTermo AI Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg transition-transform group-hover:scale-110 bg-white" />
            <span className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">SkinTermo AI</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.type === 'hash' ? (
                <a 
                  key={link.name} 
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-brand-black transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link 
                  key={link.name} 
                  to={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-brand-black transition-colors"
                >
                  {link.name}
                </Link>
              )
            ))}
            <Link to="/login" className="btn btn-primary py-2 px-6 text-sm">
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-gray-100 p-6 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              link.type === 'hash' ? (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium"
                >
                  {link.name}
                </a>
              ) : (
                <Link 
                  key={link.name} 
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium"
                >
                  {link.name}
                </Link>
              )
            ))}
            <Link to="/login" className="btn btn-primary w-full">
              Get Started
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-brand-lime/20 text-brand-black px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <ShieldCheck className="w-4 h-4" />
              FDA Cleared Technology
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Next Gen <span className="text-gray-400">Skin Care</span> Diagnostic Tool
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-lg">
              Empower your health with our AI-driven skin disease detection platform. Fast, accurate, and accessible dermatology from the palm of your hand.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="btn btn-primary">
                Start Free Scan <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="#about" className="btn btn-secondary">
                Learn More
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-brand-lime/30 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <img 
              src="/skin_disease_hero_1776579881263.png" 
              alt="SkinTermo Hero" 
              className="relative rounded-[3rem] shadow-2xl border-4 border-white"
            />
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pioneering Digital Dermatology</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine computer vision and deep learning to provide instant clinical-grade insights into skin health.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="glass-card p-0 overflow-hidden">
               <div className="bg-brand-black p-12 text-white">
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="text-gray-400 leading-relaxed">
                    To bridge the gap between initial concern and professional diagnosis. By providing accessible scanning tools, we help millions detect potential skin issues earlier than ever.
                  </p>
                  <ul className="mt-8 space-y-4">
                    {['99.2% Sensitivity', 'ISO Certified Data', 'HIPAA Compliant'].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle2 className="text-brand-lime w-5 h-5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-brand-lime/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="text-brand-black w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Privacy First</h4>
                  <p className="text-gray-600">Your data is encrypted end-to-end. We never share your personal health information with third parties.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-brand-lime/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Activity className="text-brand-black w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Clinical Accuracy</h4>
                  <p className="text-gray-600">Our models are trained on over 500,000+ dermatological images verified by leading experts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contents / Features Section */}
      <section id="contents" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold mb-4">Smart Features for Healthy Skin</h2>
              <p className="text-gray-600">Explore the powerful tools built into our platform to help you monitor and maintain your skin health.</p>
            </div>
            <button className="btn btn-primary">Explore All Features</button>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="glass-card flex flex-col items-start"
              >
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <button className="group text-brand-black font-bold flex items-center gap-2 hover:gap-3 transition-all">
                  Read More <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Onboarding Section */}
      <section id="doctors" className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 bg-brand-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-brand-lime" />
                Medical Expert Network
              </div>
              <h2 className="text-5xl font-black tracking-tighter leading-none">
                Empowering <span className="text-brand-lime">Dermatologists</span> with AI
              </h2>
              <p className="text-gray-500 text-lg font-medium leading-relaxed">
                Join our global network of clinical experts. Use our advanced computer vision tools to augment your diagnostic precision and reach patients worldwide.
              </p>
              
              <div className="space-y-6">
                {doctorSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100 group-hover:border-brand-lime transition-colors">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-500 font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Link to="/doctor/signup" className="btn btn-primary px-10 py-5 text-base flex items-center gap-3 w-fit">
                  Expert Registration Portal <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-brand-lime/10 rounded-full blur-[100px] animate-pulse"></div>
              <div className="glass-card bg-brand-black p-12 relative z-10 space-y-10 border-brand-lime/20">
                <div className="flex justify-between items-start">
                  <div className="w-20 h-2 bg-brand-lime rounded-full"></div>
                  <div className="text-white/20 text-4xl font-black">01</div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white tracking-tighter">Clinical Workflow</h3>
                  <p className="text-gray-400 font-medium leading-relaxed">
                    Our platform streamlines the path from initial AI screening to professional clinical confirmation. Doctors act as the final validation node in our diagnostic neural network.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-brand-lime text-2xl font-black">98.5%</p>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">AI Precision</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-white text-2xl font-black">Real-time</p>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Patient Sync</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Section - Now using the detailed component */}
      <ModelComparisonSection />

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-12 md:p-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lime/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="grid md:grid-cols-2 gap-16 relative z-10">
              <div>
                <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
                <p className="text-gray-600 mb-10">Have questions about our technology or need support? Our team is here to help you 24/7.</p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email us</p>
                      <p className="font-bold">support@skintermo.ai</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Call us</p>
                      <p className="font-bold">+1 (800) SKIN-AI</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Visit us</p>
                      <p className="font-bold">Silicon Valley, CA</p>
                    </div>
                  </div>
                </div>
              </div>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-lime" />
                  <input type="text" placeholder="Last Name" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-lime" />
                </div>
                <input type="email" placeholder="Email Address" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-lime" />
                <textarea placeholder="Your Message" rows={4} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-lime"></textarea>
                <button type="submit" className="btn btn-primary w-full py-5">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-black text-white py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SkinTermo AI Logo" className="w-10 h-10 object-contain rounded-xl bg-white" />
            <span className="text-lg font-black uppercase tracking-tighter">SkinTermo AI</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-brand-lime">Privacy Policy</a>
            <a href="#" className="hover:text-brand-lime">Terms of Service</a>
          </div>
          <p className="text-sm text-gray-500">© 2024 SkinTermo AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
