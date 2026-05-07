import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/db.js'; //MongoDB connection

import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/assignmentRoutes.js'
import workerRoutes from './routes/workerRoutes.js'

dotenv.config();

const app = express();

// Configure CORS origins from env (comma-separated) with sensible defaults
const defaultOrigins = [
  'http://localhost:5173',
  'https://modular-geo-tagging-attendance-syst.vercel.app'
];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultOrigins.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g., curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
// Routes
app.use('/api/auth',authRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/worker',workerRoutes);
app.use("/uploads", express.static("uploads"));

app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

//connection to db and running server
(async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
})();