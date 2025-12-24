
import express from 'express';
import bcrypt from 'bcryptjs';
import { User, MessResource, MessMenu, Complaint, Announcement, AttendanceRecord } from './models.js';
import { askGemini } from './gemini.js';

const router = express.Router();




// --- LLM: Complaint Analysis ---
router.post('/llm/complaint-analysis', async (req, res) => {
  const { description } = req.body;
  const prompt = `Categorize and summarize this student complaint: "${description}". Reply with category and a short summary.`;
  const result = await askGemini(prompt);
  res.json({ result });
});

// --- LLM: Smart Announcement ---
router.post('/llm/smart-announcement', async (req, res) => {
  const { title, content } = req.body;
  const prompt = `Rewrite this announcement for clarity and a positive tone. Title: "${title}" Content: "${content}". Reply with improved title and content.`;
  const result = await askGemini(prompt);
  res.json({ result });
});

// --- LLM: Chatbot Assistant ---
router.post('/llm/chat', async (req, res) => {
  const { message } = req.body;
  const prompt = `You are a helpful assistant for a hostel mess management system. ${message}`;
  const result = await askGemini(prompt);
  res.json({ result });
});

// --- LLM: Data Insights ---
router.post('/llm/data-insights', async (req, res) => {
  const { data, type } = req.body;
  const prompt = `Analyze and summarize the following ${type} data for a hostel mess management system: ${JSON.stringify(data)}. Reply with key insights in plain language.`;
  const result = await askGemini(prompt);
  res.json({ result });
});



// --- User Routes ---
router.get('/users', async (req, res) => {
  res.json(await User.find());
});
router.post('/users', async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      res.json(await User.create({ ...rest, password: hashedPassword }));
    } else {
      res.status(400).json({ error: 'Password is required' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/users/:id', async (req, res) => {
  res.json(await User.findById(req.params.id));
});
router.put('/users/:id', async (req, res) => {
  res.json(await User.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/users/:id', async (req, res) => {
  res.json(await User.findByIdAndDelete(req.params.id));
});

// --- MessResource Routes ---
router.get('/resources', async (req, res) => {
  res.json(await MessResource.find());
});
router.post('/resources', async (req, res) => {
  res.json(await MessResource.create(req.body));
});
router.put('/resources/:id', async (req, res) => {
  res.json(await MessResource.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/resources/:id', async (req, res) => {
  res.json(await MessResource.findByIdAndDelete(req.params.id));
});

// --- MessMenu Routes ---
router.get('/menu', async (req, res) => {
  // Optionally filter by type (current/upcoming) if you add a 'type' field to MessMenu
  if (req.query.type) {
    res.json(await MessMenu.find({ type: req.query.type }));
  } else {
    res.json(await MessMenu.find());
  }
});
router.post('/menu', async (req, res) => {
  res.json(await MessMenu.create(req.body));
});
router.put('/menu', async (req, res) => {
  // Replace all menu items for the given week type
  const type = req.query.type || 'current';
  // Remove old menu for this type
  await MessMenu.deleteMany({ type });
  // Insert new menu with type field
  const menuWithType = req.body.map((item) => ({ ...item, type }));
  const result = await MessMenu.insertMany(menuWithType);
  res.json(result);
});
router.put('/menu/:id', async (req, res) => {
  res.json(await MessMenu.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/menu/:id', async (req, res) => {
  res.json(await MessMenu.findByIdAndDelete(req.params.id));
});

// --- Complaint Routes ---
router.get('/complaints', async (req, res) => {
  res.json(await Complaint.find());
});
router.post('/complaints', async (req, res) => {
  res.json(await Complaint.create(req.body));
});
router.put('/complaints/:id', async (req, res) => {
  res.json(await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/complaints/:id', async (req, res) => {
  res.json(await Complaint.findByIdAndDelete(req.params.id));
});

// --- Announcement Routes ---
router.get('/announcements', async (req, res) => {
  res.json(await Announcement.find());
});
router.post('/announcements', async (req, res) => {
  res.json(await Announcement.create(req.body));
});
router.put('/announcements/:id', async (req, res) => {
  res.json(await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/announcements/:id', async (req, res) => {
  res.json(await Announcement.findByIdAndDelete(req.params.id));
});

// --- AttendanceRecord Routes ---
router.get('/attendance', async (req, res) => {
  res.json(await AttendanceRecord.find());
});
router.post('/attendance', async (req, res) => {
  res.json(await AttendanceRecord.create(req.body));
});
router.put('/attendance/:id', async (req, res) => {
  res.json(await AttendanceRecord.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/attendance/:id', async (req, res) => {
  res.json(await AttendanceRecord.findByIdAndDelete(req.params.id));
});

export default router;
