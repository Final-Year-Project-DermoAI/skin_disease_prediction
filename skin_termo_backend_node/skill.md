# SkinTermo Backend Technology Stack 

The SkinTermo Node.js Backend was completely rewritten from Python (FastAPI) to Node.js. 

Below is the detailed list of technologies, libraries, and architectural decisions used to power the new backend.

---

## 🏗️ Core Infrastructure
* **Runtime:** Node.js (v18+)
* **Language:** TypeScript
* **Web Framework:** Express.js

## 🗄️ Database & ORM
* **Database Engine:** PostgreSQL
  * *Changed from SQLite for robust production scalability.*
* **ORM (Object-Relational Mapping):** Sequelize
  * Used to map TypeScript Classes/Objects to PostgreSQL Tables automatically without writing raw SQL.
* **Driver Packages:** `pg` and `pg-hstore`

## 🔐 Authentication & Security
* **JWT (JSON Web Tokens):** `jsonwebtoken`
  * Used for stateless authentication across the Patient and Doctor portals. 
* **Password Hashing:** `bcryptjs`
  * Used to securely salt and hash user passwords before storing them in PostgreSQL.
* **CORS:** `cors` middleware
  * Secures the API by restricting which frontend domains can communicate with the backend.

## 🧠 AI & External Integrations
* **AI Provider:** ZhipuAI API
* **Supported Models:** 
  * `glm-4.6v-flash` - Used for Vision processing (Skin Condition Analysis from image uploads).
  * `glm-4.7-flash` - Used for the high-speed stateless Medical Chatbot.
* **HTTP Client:** `axios`
  * Used for reliable, promise-based server-to-server HTTP requests to the Zhipu API from inside the Express controllers.

## 💾 File Management
* **Uploads Handling:** `multer` (Note: Native Node `fs` & `Buffer` parsing was ultimately utilized in standard base64 decoding due to current frontend implementation)
* **UUID:** `uuid` 
  * Generates unique filenames (`uuidv4`) ensuring uploaded skin scans and chat images do not overwrite each other in the `/uploads/` directory.

## ⚙️ Development Environment
* **Environment Variables:** `dotenv`
  * Parses the `.env` file securely holding the Database URL, JWT Secret, and Zhipu API Key.
* **Hot Reloading:** `nodemon` + `ts-node`
  * Allows the application to run directly from TypeScript in development and automatically restarts upon code changes.
