# SkinTermo AI - React Frontend

Welcome to the premium React frontend for **SkinTermo AI**, an advanced skin disease prediction and consultation platform. This application provides separate interfaces for Patients, Doctors, and Administrators with a stunning modern design.

## 🚀 Features

### For Patients
- **Dashboard**: Quick overview of recent health scans and activities.
- **Scanning Page**: interface for uploading/scanning skin images for prediction.
- **Chatbot**: AI-driven assistant for preliminary skin health queries.
- **Doctor Search**: Find and book consultations with specialist dermatologists.
- **Profile**: Manage personal health records and settings.

### For Doctors
- **Dashboard**: Comprehensive overview of patient statistics and appointments.
- **Patient Reports**: Detailed history and analysis of patient skin conditions.
- **Patient Requests**: Manage incoming consultation requests.
- **ChatBot**: Communication channel with patients and AI assistant.
- **Profile**: Professional information and specialized details.

### For Administrators
- **Admin Dashboard**: System-wide analytics and management.
- **User Management**: Control access for both doctors and patients.

## 🛠️ Technology Stack

- **Framework**: [React.js](https://reactjs.org/) (with TypeScript)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: Vanilla CSS (Custom Design System with Glassmorphism)

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the web directory:
   ```bash
   cd skin_termo_web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🎨 Design System

The application uses a custom design system defined in `src/index.css`:
- **Glassmorphism**: Elegant semi-transparent surfaces with backdrop blurs.
- **Responsive Layout**: Sidebar-based navigation for desktop and mobile-ready components.
- **Theme**: Deep slate background with vibrant indigo and purple accents.

## 🤖 AI Integration

The system is designed to work with the **CNN-RNN Model** (`skin_disease_model.py`) for real-time skin disease diagnosis and captioning.

---
Developed for the Final Year Project - SkinTermo AI.
