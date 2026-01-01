
export enum UserRole {
  CHAIRMAN_SECRETARY = 'CHAIRMAN_SECRETARY',
  WARDEN_MATREN = 'WARDEN_MATREN',
  STAFF = 'STAFF',
  STUDENT = 'STUDENT',
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  registerNumber?: string;
  department?: string;
  year?: string;
  messStatus?: 'Active' | 'Suspended' | 'Guest';
  messCardId?: string;
}

export interface MessResource {
  _id?: string;
  id?: string;
  name: string;
  category: 'Groceries' | 'Vegetables' | 'Dairy' | 'Fuel' | 'Spices' | 'Meat & Eggs';
  quantity: number;
  unit: string;
  threshold: number;
  monthlyUsage?: number;
  pricePerUnit?: number;
  lastUpdated: string;
}

export interface MessMenu {
  _id?: string;
  id?: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  type?: 'current' | 'upcoming';
}

export interface Complaint {
  _id?: string;
  id?: string;
  studentId: string;
  studentName: string;
  category: 'Quality' | 'Hygiene' | 'Timings' | 'Staff' | 'Other';
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface Announcement {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'High' | 'Normal';
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

export interface AttendanceRecord {
  _id?: string;
  id?: string;
  studentId: string;
  studentName: string;
  mealType: MealType;
  status: 'Present' | 'Absent';
  date: string;
}
