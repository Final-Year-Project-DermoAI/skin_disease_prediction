# 📱 SkinTermo Mobile AI (Flutter)

Welcome to the **SkinTermo Mobile Application**, a cross-platform mobile app built with **Flutter**. 
This application brings the power of SkinTermo's AI diagnostics and medical consultation directly to users' smartphones.

---

## 🚀 Technologies

- **Framework**: Flutter (Dart)
- **Local AI Analysis**: TensorFlow Lite (`tflite_service.dart`)
- **Remote AI & Chat**: ZhipuAI / Ollama Integrations
- **State & Storage**: Shared Preferences (`session_manager.dart`), Local DB configurations.

---

## 📂 Project Structure & Pages Overview

The mobile application is highly modular and strictly structured for performance and code reusability:

### 🏠 Core & Navigation
* **`main.dart` / `onboarding_page.dart`** - App initialization, entry point, and first-time user walkthroughs.
* **`home_page.dart`** - The main hub post-authentication.

### 🩺 Analysis & Diagnostics
* **`prediction_page.dart`** - Interface to capture or upload skin images for real-time AI inference.
* **`analysis_history_page.dart`** - Log and review past skin assessments and reports.

### 💬 Consultations & Chat
* **`healthcare_chat_page.dart`** - Interactive AI chatbot for medical guidance and symptom checking.
* **`chat_history_page.dart`** - Access previous conversations with the AI or practitioners.

### 👨‍⚕️ Portals (Doctor & Patient Lists)
* **`doctors_list_page.dart`** - Patient view to browse available/verified doctors.
* **`doctor_home_page.dart`** - Specialized hub for registered doctors to manage their practice.
* **`patients_list_page.dart`** - Doctor view to see patient records and inquiries.

### ⚙️ Settings & Account
* **`settings_page.dart`** - App-wide settings and preferences.
* **`account_settings_page.dart`** - User profile management, password updates, and personal details.

---

## 🔌 Core Services (`lib/services/`)

The mobile app relies strongly on abstracted service files to communicate with external logic:
* **`auth_service.dart`** - Handles registration and login with the Node.js backend.
* **`chat_service.dart`** - Manages conversation states and payloads.
* **`tflite_service.dart`** - Loads `.tflite` models to run edge inference locally on the device.
* **`zhipu_service.dart` / `ollama_service.dart`** - Remote API integrations for heavy AI lifting.

---

## 🛠️ Setup & Installation

**1. Install Dependencies**
```bash
flutter pub get
```

**2. API Configuration**
Check `lib/api_config.dart` to ensure it points to the correct Node.js backend IP address / Base URL. Ensure `.env` is populated if running local builds.

**3. Run the App**
```bash
# To run on a connected physical device or emulator
flutter run
```

**4. Build APK (Android) or IPA (iOS)**
```bash
flutter build apk --release
flutter build ipa --release
```
