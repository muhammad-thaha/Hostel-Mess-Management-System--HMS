import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'MESS_MANAGER', 'STUDENT', 'STAFF'] },
  registerNumber: String,
  department: String,
  year: String,
  messStatus: { type: String, enum: ['Active', 'Suspended', 'Guest'] },
  messCardId: String
});

const messResourceSchema = new mongoose.Schema({
  name: String,
  category: { type: String, enum: ['Groceries', 'Vegetables', 'Dairy', 'Fuel', 'Spices'] },
  quantity: Number,
  unit: String,
  threshold: Number,
  lastUpdated: String
});

const messMenuSchema = new mongoose.Schema({
  day: String,
  breakfast: String,
  lunch: String,
  dinner: String,
  type: { type: String, enum: ['current', 'upcoming'], default: 'current' }
});

const complaintSchema = new mongoose.Schema({
  studentId: String,
  studentName: String,
  category: { type: String, enum: ['Quality', 'Hygiene', 'Timings', 'Staff', 'Other'] },
  description: String,
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'] },
  createdAt: String
});

const announcementSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  date: String,
  priority: { type: String, enum: ['High', 'Normal'] }
});

const attendanceRecordSchema = new mongoose.Schema({
  studentId: String,
  studentName: String,
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'] },
  status: { type: String, enum: ['Present', 'Absent'] },
  date: String
});

export const User = mongoose.model('User', userSchema);
export const MessResource = mongoose.model('MessResource', messResourceSchema);
export const MessMenu = mongoose.model('MessMenu', messMenuSchema);
export const Complaint = mongoose.model('Complaint', complaintSchema);
export const Announcement = mongoose.model('Announcement', announcementSchema);
export const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
