
export enum UserRole {
  ADMIN = 'ADMIN',
  MESS_MANAGER = 'MESS_MANAGER',
  STUDENT = 'STUDENT',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registerNumber?: string;
  department?: string;
  year?: string;
  messStatus?: 'Active' | 'Suspended' | 'Guest';
  messCardId?: string;
}

export interface MessResource {
  id: string;
  name: string;
  category: 'Groceries' | 'Vegetables' | 'Dairy' | 'Fuel' | 'Spices';
  quantity: number;
  unit: string;
  threshold: number;
  lastUpdated: string;
}

export interface MessMenu {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  category: 'Quality' | 'Hygiene' | 'Timings' | 'Staff' | 'Other';
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'High' | 'Normal';
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  mealType: MealType;
  status: 'Present' | 'Absent';
  date: string;
}
