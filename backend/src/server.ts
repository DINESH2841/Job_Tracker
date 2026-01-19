import express, { RequestHandler } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './utils/db';
import authRoutes from './routes/auth.routes';
import gmailRoutes from './routes/gmail.routes';
import jobRoutes from './routes/jobs.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://job-tracker.dineshsevinni.me',
    process.env.FRONTEND_URL || ''
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser() as unknown as RequestHandler);

// Routes
app.use('/auth', authRoutes);
app.use('/gmail', gmailRoutes);
app.use('/jobs', jobRoutes);

// Health Check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Legacy health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
