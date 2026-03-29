import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './models.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, registerNumber, department, year } = req.body;
    console.log('Register request:', req.body);
    if (!name || !email || !password || !role) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Email already registered');
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({
        name, email, password: hashed, role, registerNumber, department, year,
        messStatus: 'Active',
        messCardId: role === 'STUDENT' ? `MC-${new Date().getFullYear()}-${Math.floor(Math.random() * 999)}` : undefined
      });
      res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (err) {
      console.error('User.create error:', err);
      throw err;
    }
  } catch (e) {
    console.error('Registration error:', e);
    if ((e?.message || '').toLowerCase().includes('requires authentication')) {
      return res.status(500).json({ error: 'Database authentication failed. Check MONGO_URI username/password and authSource.' });
    }
    if (e.name === 'ValidationError') {
      return res.status(400).json({ error: e.message });
    }
    if (e.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: e.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    if ((e?.message || '').toLowerCase().includes('requires authentication')) {
      return res.status(500).json({ error: 'Database authentication failed. Check MONGO_URI username/password and authSource.' });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
