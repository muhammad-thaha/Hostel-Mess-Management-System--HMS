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

// Initialize Gemini using 2.5 Flash for faster/cheaper responses.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_DAY_ORDER = new Map(WEEK_DAYS.map((d, i) => [d, i]));

function pickLatestMenuPerDay(items) {
  const byDay = new Map();
  for (const item of items) {
    const existing = byDay.get(item.day);
    const itemTs = new Date(item.updatedAt || item.createdAt || 0).getTime();
    const existingTs = existing ? new Date(existing.updatedAt || existing.createdAt || 0).getTime() : -1;
    if (!existing || itemTs >= existingTs) {
      byDay.set(item.day, item);
    }
  }
  return [...byDay.values()].sort((a, b) => (WEEK_DAY_ORDER.get(a.day) ?? 99) - (WEEK_DAY_ORDER.get(b.day) ?? 99));
}

async function getLatestMenuByType(type) {
  const all = await MessMenu.find({ type });
  return pickLatestMenuPerDay(all);
}

function formatMenuLastUpdated(items) {
  if (!items || items.length === 0) return 'Not available';
  let latest = 0;
  for (const item of items) {
    const ts = new Date(item.updatedAt || item.createdAt || 0).getTime();
    if (ts > latest) latest = ts;
  }
  return latest ? new Date(latest).toLocaleString() : 'Not available';
}

function buildWeeklySpreadText(items) {
  if (!items || items.length === 0) return 'Not available';
  return items.map(m => `${m.day}: B-${m.breakfast}, L-${m.lunch}, D-${m.dinner}`).join(' | ');
}

function buildDeterministicChatReply(message, context) {
  const text = (message || '').toLowerCase();
  const asksUpdateTime = /(last\s*updated|updated\s*on|when\s*(was|is).*(updated|menu))/i.test(text);
  const asksUpcomingMeal = /(next\s*meal|upcoming\s*meal|what.*meal)/i.test(text);
  const asksWeeklySpread = /(weekly\s*spread|week\s*menu|weekly\s*menu|full\s*week|schedule)/i.test(text);
  const asksTodayMenu = /(today('| i)?s\s*(food|menu)|today\s*menu|what.*today)/i.test(text);

  if (asksUpdateTime) {
    return `Current weekly menu was last updated on ${context.currentMenuLastUpdated}. Upcoming weekly menu was last updated on ${context.upcomingMenuLastUpdated}.`;
  }

  if (asksUpcomingMeal) {
    return `Your next meal is ${context.nextMealName} on ${context.nextMealDay} (${context.nextMealTime}). Dish: ${context.nextMealDish}.`;
  }

  if (asksWeeklySpread) {
    return `Current week: ${buildWeeklySpreadText(context.currentWeekMenu)}. Upcoming week: ${buildWeeklySpreadText(context.upcomingWeekMenu)}.`;
  }

  if (asksTodayMenu) {
    const m = context.menu;
    return `Today's menu (${context.today}) is Breakfast: ${m?.breakfast || 'Not scheduled'}, Lunch: ${m?.lunch || 'Not scheduled'}, Dinner: ${m?.dinner || 'Not scheduled'}.`;
  }

  return null;
}

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
    const menu = await getLatestMenuByType(type);
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
    const now = new Date();
    const today = WEEK_DAYS[now.getDay()];

    // Fetch weekly menus for both schedule types.
    const [currentWeekMenu, upcomingWeekMenu] = await Promise.all([
      getLatestMenuByType('current'),
      getLatestMenuByType('upcoming')
    ]);

    const currentMenuByDay = new Map(currentWeekMenu.map(m => [m.day, m]));
    const upcomingMenuByDay = new Map(upcomingWeekMenu.map(m => [m.day, m]));
    // If current week data for today is missing, fallback to upcoming week.
    const menu = currentMenuByDay.get(today) || upcomingMenuByDay.get(today);

    const weeklyCurrentText = currentWeekMenu.length > 0
      ? currentWeekMenu.map(m => `- ${m.day}: B-${m.breakfast}, L-${m.lunch}, D-${m.dinner}`).join('\n')
      : 'Current weekly spread is not available.';

    const weeklyUpcomingText = upcomingWeekMenu.length > 0
      ? upcomingWeekMenu.map(m => `- ${m.day}: B-${m.breakfast}, L-${m.lunch}, D-${m.dinner}`).join('\n')
      : 'Upcoming weekly spread is not available.';

    const currentMenuLastUpdated = formatMenuLastUpdated(currentWeekMenu);
    const upcomingMenuLastUpdated = formatMenuLastUpdated(upcomingWeekMenu);

    const minuteOfDay = now.getHours() * 60 + now.getMinutes();
    const tomorrow = WEEK_DAYS[(now.getDay() + 1) % 7];
    let nextMealName = 'Breakfast';
    let nextMealTime = '07:00 AM - 09:00 AM';
    let nextMealDay = today;

    if (minuteOfDay < 7 * 60) {
      nextMealName = 'Breakfast';
      nextMealTime = '07:00 AM - 09:00 AM';
      nextMealDay = today;
    } else if (minuteOfDay < 12 * 60) {
      nextMealName = 'Lunch';
      nextMealTime = '12:00 PM - 02:00 PM';
      nextMealDay = today;
    } else if (minuteOfDay < 19 * 60) {
      nextMealName = 'Dinner';
      nextMealTime = '07:00 PM - 09:00 PM';
      nextMealDay = today;
    } else {
      nextMealName = 'Breakfast';
      nextMealTime = '07:00 AM - 09:00 AM';
      nextMealDay = tomorrow;
    }

    // Prefer current schedule, but fallback to upcoming schedule for the same day.
    const nextMealSource = currentMenuByDay.get(nextMealDay) || upcomingMenuByDay.get(nextMealDay);

    const nextMealDish = nextMealSource?.[nextMealName.toLowerCase()] || 'Not scheduled';

    // Fetch recent announcements
    const recentAnnouncements = await Announcement.find().sort({ date: -1 }).limit(3);
    const announcementsText = recentAnnouncements.length > 0
      ? recentAnnouncements.map(a => `- ${a.title} (${a.date}): ${a.content}`).join('\n')
      : "No recent announcements.";

    const deterministicReply = buildDeterministicChatReply(message, {
      today,
      menu,
      currentWeekMenu,
      upcomingWeekMenu,
      currentMenuLastUpdated,
      upcomingMenuLastUpdated,
      nextMealName,
      nextMealDay,
      nextMealTime,
      nextMealDish
    });

    // Serve menu/schedule queries directly from DB context to avoid quota-related failures.
    if (deterministicReply) {
      return res.json({ reply: deterministicReply, source: 'deterministic' });
    }

    // 2. Construct System Context
    const systemContext = `
    You are Mess Mate, the smart AI assistant for the Hostel Mess Management System.
    
    Current Date: ${new Date().toLocaleDateString()} (${today})
    
    🛒 TODAY'S MENU (${today}):
    - Breakfast: ${menu?.breakfast || "Not scheduled"}
    - Lunch: ${menu?.lunch || "Not scheduled"}
    - Dinner: ${menu?.dinner || "Not scheduled"}

    📅 CURRENT WEEKLY SPREAD:
    Last Updated: ${currentMenuLastUpdated}
    ${weeklyCurrentText}

    📆 UPCOMING WEEKLY SPREAD:
    Last Updated: ${upcomingMenuLastUpdated}
    ${weeklyUpcomingText}

    🍽️ NEXT UPCOMING MEAL:
    - Day: ${nextMealDay}
    - Meal: ${nextMealName}
    - Time: ${nextMealTime}
    - Dish: ${nextMealDish}

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
    - Answer the user's question based strictly on the provided context (today menu, current weekly spread, upcoming weekly spread, next meal, announcements, timings).
    - If asked when the menu was updated, use the "Last Updated" timestamps exactly as provided.
    - If asked about "weekly spread" or "week menu", use CURRENT WEEKLY SPREAD and UPCOMING WEEKLY SPREAD.
    - If asked about "next meal" or "upcoming meal", use NEXT UPCOMING MEAL.
    - If asked about "today's food" or specific meals, use the TODAY'S MENU data.
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
    res.json({
      reply: `I'm temporarily unable to reach Gemini. I can still answer menu queries like today's menu, upcoming meal, weekly spread, and last updated times from live DB data.`,
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
  if (req.query.type) {
    return res.json(await getLatestMenuByType(req.query.type));
  }

  const [current, upcoming] = await Promise.all([
    getLatestMenuByType('current'),
    getLatestMenuByType('upcoming')
  ]);
  res.json([...current, ...upcoming]);
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
