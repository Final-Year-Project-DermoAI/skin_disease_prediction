import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorManagement from './pages/admin/DoctorManagement';
import PatientManagement from './pages/admin/PatientManagement';
import ConsultationChat from './components/ConsultationChat';
import AIChatBot from './pages/AIChatBot';
import ScanningPage from './pages/patient/ScanningPage';

import PatientConnectionPage from './pages/doctor/PatientConnectionPage';
import DoctorConnectionPage from './pages/patient/DoctorConnectionPage';
import ConsultationChatPage from './pages/ConsultationChatPage';
import ProfilePage from './pages/ProfilePage';

import DoctorVerificationPage from './pages/doctor/DoctorVerificationPage';
import LandingPage from './pages/LandingPage';
import DoctorSignup from './pages/DoctorSignup';
import PatientSignup from './pages/PatientSignup';

// Placeholder components for remaining screens
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center p-12 glass-card h-64 border-dashed border-gray-200">
    <h2 className="text-2xl font-bold mb-4 tracking-tight">{title} Screen</h2>
    <p className="text-text-secondary text-sm">Feature integration pending in current R&D cycle.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/doctor/verify" element={<DoctorVerificationPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor/signup" element={<DoctorSignup />} />
        <Route path="/patient/signup" element={<PatientSignup />} />
        
        {/* Doctor Routes */}
        <Route path="/doctor" element={<Layout role="DOCTOR" />}>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="reports" element={<Placeholder title="Diagnostic Reports" />} />
          <Route path="requests" element={<PatientConnectionPage />} />
          <Route path="chat/:sessionId" element={<ConsultationChatPage role="doctor" />} />
          <Route path="chatbot" element={<AIChatBot />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        {/* Patient Routes */}
        <Route path="/patient" element={<Layout role="PATIENT" />}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="chatbot" element={<AIChatBot />} />
          <Route path="scanning" element={<ScanningPage />} />
          <Route path="doctors" element={<DoctorConnectionPage />} />
          <Route path="chat/:sessionId" element={<ConsultationChatPage role="patient" />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<Layout role="ADMIN" />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="settings" element={<Placeholder title="Protocol Settings" />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;
