import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from './models';
import authRoutes from './routes/authRoutes';
import analysisRoutes from './routes/analysisRoutes';
import { router as doctorsRouter, doctorRouter } from './routes/doctorRoutes';
import chatRoutes from './routes/chatRoutes';
import adminRoutes from './routes/adminRoutes';
import consultationRoutes from './routes/consultationRoutes';

import fs from 'fs';
const app = express();
const PORT = parseInt(process.env.PORT as string, 10) || 3000;

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log('Created uploads directory');
}

// Configure CORS
app.use(cors({
  origin: function (origin, callback) {
    // Dynamic origin matching allows credentials true
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Setup Body Parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SkinTermo Node.js Backend is running' });
});

app.use('/auth', authRoutes);
app.use('/analysis', analysisRoutes);
app.use('/doctors', doctorsRouter);
app.use('/doctor', doctorRouter);
app.use('/chat', chatRoutes);
app.use('/admin', adminRoutes);
app.use('/consultation', consultationRoutes);

// Sync Database and Start Server
sequelize.sync({ alter: true }).then(() => {
  console.log('SQL Database synchronized.');
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
  
  server.on('error', (e) => {
    console.error('Express Server Error:', e);
  });
  
  process.on('exit', (code) => {
    console.log(`Node process exiting with code: ${code}`);
  });
}).catch((error) => {
  console.error('Failed to sync database:', error);
});
