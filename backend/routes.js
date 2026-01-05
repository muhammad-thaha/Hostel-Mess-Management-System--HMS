import express from 'express';
import bcrypt from 'bcryptjs';
import { User, MessResource, MessMenu, Complaint, Announcement, AttendanceRecord } from './models.js';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Debug API Key presence
console.log("Gemini API Key Configured:", !!process.env.GEMINI_API_KEY);

const router = express.Router();

// Initialize Gemini (using gemini-1.5-pro for compatibility)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// --- Health Check ---
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is working' });
});

// --- AI Routes ---

// 1. AI Menu Planner
router.post('/ai/menu-plan', async (req, res) => {
  try {
    const inventory = await MessResource.find();
    const complaints = await Complaint.find({ category: 'Quality' }).sort({ createdAt: -1 }).limit(10);

    const inventoryText = inventory.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
    const complaintsText = complaints.map(c => c.description).join('; ');

    const prompt = `
        Act as a Hostel Mess Manager. Generate a 7-day weekly menu (Monday to Sunday) for Breakfast, Lunch, and Dinner.
        
        Constraints:
        1. Use available inventory where possible: ${inventoryText}
        2. Avoid items similar to recent complaints: ${complaintsText}
        3. Ensure nutritional balance and variety (South Indian/Kerala context).
        
        Output stricly valid JSON array of objects with keys: day, breakfast, lunch, dinner. 
        No markdown, no backticks. Just the raw JSON string.
        Example: [{"day": "Monday", "breakfast": "...", "lunch": "...", "dinner": "..."}]
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    // Clean cleanup markdown if present
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const menu = JSON.parse(text);

    res.json(menu);
  } catch (error) {
    console.error("AI Menu Error:", error);
    res.status(500).json({ error: "Failed to generate menu" });
  }
});

// 2. Predictive Inventory
router.post('/ai/predict-inventory', async (req, res) => {
  try {
    const type = req.query.type || 'upcoming';
    const menu = await MessMenu.find({ type });
    const resources = await MessResource.find();

    const menuText = menu.map(m => `${m.day}: B-${m.breakfast}, L-${m.lunch}, D-${m.dinner}`).join('\n');
    const stockText = resources.map(r => `${r.name}: ${r.quantity} ${r.unit}`).join(', ');

    const prompt = `
        Analyze the following Mess Menu and Current Inventory.
        
        Menu:
        ${menuText}
        
        Inventory:
        ${stockText}
        
        Task: Identify ingredients that are likely to run out or are critically low for this menu. 
        Infer ingredients for common Indian/Kerala dishes (e.g., Biryani needs Rice, Ghee, Chicken/Veg).
        
        Output strictly valid JSON array of objects with keys: item, reason, urgency (High/Medium).
        Return only items at risk. If none, return empty array.
        No markdown.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const predictions = JSON.parse(text);

    res.json(predictions);
  } catch (error) {
    console.error("AI Inventory Error:", error);
    res.status(500).json({ error: "Failed to analyze inventory" });
  }
});

// 3. Chatbot "Mess Mate" - Context Aware
router.post('/ai/chat', async (req, res) => {
  const { message, userId, role } = req.body;
  try {
    console.log("Chat request received:", { userId, role, message });

    // 1. Fetch Real Context Data
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    // Fetch today's menu
    const menu = await MessMenu.findOne({ day: today, type: 'current' });

    // Fetch recent announcements
    const recentAnnouncements = await Announcement.find().sort({ date: -1 }).limit(3);
    const announcementsText = recentAnnouncements.length > 0
      ? recentAnnouncements.map(a => `- ${a.title} (${a.date}): ${a.content}`).join('\n')
      : "No recent announcements.";

    // 2. Construct System Context
    const systemContext = `
    You are Mess Mate, the smart AI assistant for the Hostel Mess Management System.
    
    Current Date: ${new Date().toLocaleDateString()} (${today})
    
    🛒 TODAY'S MENU (${today}):
    - Breakfast: ${menu?.breakfast || "Not scheduled"}
    - Lunch: ${menu?.lunch || "Not scheduled"}
    - Dinner: ${menu?.dinner || "Not scheduled"}

    📢 LATEST ANNOUNCEMENTS:
    ${announcementsText}

    ⏰ MEAL TIMINGS:
    - Breakfast: 07:00 AM - 09:00 AM
    - Lunch: 12:00 PM - 02:00 PM
    - Dinner: 07:00 PM - 09:00 PM

    🛠️ APP FEATURES YOU CAN GUIDE USERS TO:
    - "Menu" tab: View full weekly menu.
    - "Complaints" tab: File/View complaints regarding quality, hygiene, etc.
    - "Attendance" tab: Mark yourself absent/present for meals.
    `;

    const userPrompt = `
    User Role: ${role || 'Student'}
    User Message: "${message}"
    
    Instructions:
    - Answer the user's question based strictly on the provided context (Menu, Announcements, Timings).
    - If asked about "today's food" or specific meals, use the Menu data provided.
    - If asked about news/updates, refer to Announcements.
    - If the user asks to perform an action (like filing a complaint or marking attendance), guide them to the respective tab in the app.
    - Be friendly, concise (max 2-3 sentences), and use emojis.
    - If you don't know the answer, politely say you don't have that information.
    `;

    // 3. Generate Response using Gemini
    const result = await model.generateContent(systemContext + "\n\n" + userPrompt);
    const response = await result.response;
    const reply = response.text().trim();

    console.log("Gemini Response:", reply);
    res.json({ reply });


  } catch (error) {
    console.error("Chat Error:", error);

    // Fallback if AI fails: Return the raw menu data we fetched
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    // Re-fetch or pass data if possible, but here we'll just try to fail gracefully with a hint
    // Since we can't easily access 'menu' variable from the catch block without restructuring,
    // we'll provide a generic but helpful message.

    res.json({
      reply: `⚠️ I'm having trouble connecting to my brain right now. \n\nHowever, you can check **Today's Menu** and **Announcements** directly in their respective tabs!`,
      error: error.message // Include technical error for debugging
    });
  }
});


// --- LLM: Complaint Analysis ---
router.post('/llm/complaint-analysis', async (req, res) => {
  try {
    const { description } = req.body;
    const prompt = `Categorize and summarize this student complaint: "${description}".Reply with category and a short summary.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ result: text });
  } catch (err) {
    console.error("Error in /llm/complaint-analysis:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- LLM: Smart Announcement ---
router.post('/llm/smart-announcement', async (req, res) => {
  try {
    const { title, content } = req.body;
    const prompt = `Rewrite this announcement for clarity and a positive tone.Title: "${title}" Content: "${content}".Reply with improved title and content.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ result: text });
  } catch (err) {
    console.error("Error in /llm/smart-announcement:", err);
    res.status(500).json({ error: err.message });
  }
});



// --- LLM: Data Insights ---
router.post('/llm/data-insights', async (req, res) => {
  try {
    const { data, type } = req.body;
    const prompt = `Analyze and summarize the following ${type} data for a hostel mess management system: ${JSON.stringify(data)}. Reply with key insights in plain language.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ result: text });
  } catch (err) {
    console.error("Error in /llm/data-insights:", err);
    res.status(500).json({ error: err.message });
  }
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
router.post('/announcements/:id/read', async (req, res) => {
  const { userId } = req.body;
  const announcement = await Announcement.findById(req.params.id);
  if (announcement) {
    if (!announcement.readBy) announcement.readBy = [];
    if (!announcement.readBy.includes(userId)) {
      announcement.readBy.push(userId);
      await announcement.save();
    }
  }
  res.json(announcement);
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
