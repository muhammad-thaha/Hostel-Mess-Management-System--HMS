import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hmms';

console.log("Backend starting...");
console.log("MongoDB URI:", MONGO_URI);
console.log("Gemini API Key set:", !!process.env.GEMINI_API_KEY);

import router from './routes.js';
import authRouter from './auth.js';

app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use('/api/auth', authRouter);

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.warn('⚠️  MongoDB connection failed (chat will still work without DB):', err.message));

app.get('/', (req, res) => {
  res.send('✅ HMMS Backend Running');
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Add error handlers
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

// Keep the process alive
process.stdin.resume();
