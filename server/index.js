import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from "./db.js";
import authRoutes from './routes/auth.js';
import resourceRoutes from './routes/resources.js';
import adminRoutes from './routes/admin.js';
import researchRoutes from './routes/research.js';
import reportRoutes from './routes/reports.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/reports', reportRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

pool.query("SELECT NOW()")
  .then((res) => {
    console.log("✅ DB Connected:", res.rows[0]);
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err);
  });