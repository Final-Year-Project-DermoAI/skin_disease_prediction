# ⚙️ SkinTermo Backend (Node.js + Express + TypeScript)

This is the central reliable backend service for the SkinTermo application ecosystem (Web and Mobile). It provides a secure RESTful API for user authentication, skin condition analysis, doctor portals, and AI-assisted chat functionality.

---

## 🚀 Technologies

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (via Sequelize ORM)
- **Authentication:** JWT (JSON Web Tokens)
- **AI Integration:** ZhipuAI API (GLM-4 model)
- **File Uploads:** Multer with Local Storage (Base64 parsing allowed)

---

## 📂 Project Structure

```text
skin_termo_backend_node/
├── src/
│   ├── config/          # Environment & Database Configuration
│   ├── controllers/     # Route Controllers (Logic for end-routes)
│   ├── middlewares/     # Auth, Role Verification & Error Handling
│   ├── models/          # Sequelize Database Models / Schemas
│   ├── routes/          # Express Routes Definitions (auth, chat, doctor, etc)
│   ├── services/        # External Services (ZhipuAI Integrations)
│   ├── utils/           # Utility Functions (Hashing, Token Gen)
│   └── index.ts         # Application Entry Point
├── uploads/             # Static Directory for Uploaded Images
├── .env                 # Environment Variables
├── package.json         # Project Dependencies
└── tsconfig.json        # TypeScript Configuration
```

---

## 📡 API Endpoints Overview

The backend acts as the unified source of truth for both the **React Web App** and the **Flutter Mobile App**.

### 🔐 Authentication (`/auth`)
*Links to: Web (Login/Signup Pages), Mobile (Auth Service)*
* `POST /auth/register` - Register a Patient, Doctor, or Admin.
* `POST /auth/login` - Authenticate and receive a JWT token.
* `GET /auth/me` - Fetch the authenticated user's profile.
* `PATCH /auth/me` - Update basic user information.

### 🩺 Skin Analysis (`/analysis`)
*Links to: Web (Patient/SkinScan), Mobile (Prediction Page)*
* `POST /analysis/scan` - Process image via ZhipuAI to return a medical skin assessment.
* `GET /analysis/history` - Fetch previous scan results for the logged-in user.

### 👨‍⚕️ Doctor Portal (`/doctor` & `/doctors`)
*Links to: Web (Doctor Finder/Doctor Dashboard), Mobile (Doctors List)*
* `GET /doctors` - Retrieve all verified doctors.
* `POST /doctor/onboarding` - Submit specialist details (Web: DoctorOnboarding).
* `GET /doctor/me/profile` - Doctor fetches their active profile.
* `GET /doctor/profile/:userId` - Patient view of a doctor's profile.

### 💬 AI Chat & Logs (`/chat`)
*Links to: Web (Patient/AIChat), Mobile (Healthcare Chat Page)*
* `POST /chat/sessions` - Start a new diagnostic chat branch.
* `GET /chat/sessions` - Retrieve historical session branches.
* `POST /chat/sessions/:sessionId/messages` - Send and receive a response in a session.
* `POST /chat/message` - Quick stateless AI response.

### 👑 Admin & Moderation (`/admin`)
*Links to: Web (Admin/Dashboard)*
* `GET /admin/doctors` - Overview of all registered doctors for approval workflows.
* `GET /admin/users` - Global user registry access.
* `PATCH /admin/doctor/:doctorId/location` - Administrative update to a doctor's location base.

---

## 🛠️ Setup & Installation

**1. Install dependencies**
```bash
npm install
```

**2. Configure Environment Variables**
Create a `.env` file based on your local Postgres/Zhipu environment:
```env
DB_NAME=skintermo
DB_USER=postgres
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
ZHIPU_API_KEY=your_actual_zhipu_api_key_here
PORT=3000
```

**3. Start the Application**
```bash
# Development (Hot Reloading)
npm run dev

# Production
npm run build && npm start
```
