import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always read env from the project root so frontend/backend share one .env file.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hmms';

console.log("Backend starting...");
console.log("MongoDB URI:", MONGO_URI);
console.log("Gemini API Key set:", !!process.env.GEMINI_API_KEY);

const { default: router } = await import('./routes.js');
const { default: authRouter } = await import('./auth.js');

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
