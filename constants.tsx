import React from "react";
import {
  UserRole,
  User,
  MessResource,
  MessMenu,
  Complaint,
  Announcement,
} from "./types";
import {
  LayoutDashboard,
  Users,
  Utensils,
  Package,
  MessageSquare,
  Bell,
  ClipboardCheck,
  TrendingUp,
  FileText,
} from "lucide-react";

export const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Dr. Suresh Kumar",
    email: "warden@gcek.ac.in",
    role: UserRole.WARDEN_MATREN,
  },
  {
    id: "2",
    name: "Ravi Teja",
    email: "mess@gcek.ac.in",
    role: UserRole.CHAIRMAN_SECRETARY,
  },
  {
    id: "3",
    name: "Rahul Das",
    email: "rahul@student.gcek.ac.in",
    role: UserRole.STUDENT,
    registerNumber: "KNR21CS045",
    department: "CSE",
    year: "3rd",
    messStatus: "Active",
    messCardId: "MC-2024-045",
  },
  {
    id: "4",
    name: "Sunil V",
    email: "sunil@staff.gcek.ac.in",
    role: UserRole.STAFF,
  },
];

export const MOCK_RESOURCES: MessResource[] = [
  {
    id: "1",
    name: "Rice",
    category: "Groceries",
    quantity: 250,
    unit: "kg",
    threshold: 50,
    lastUpdated: "2024-05-20",
  },
  {
    id: "2",
    name: "Cooking Oil",
    category: "Groceries",
    quantity: 45,
    unit: "L",
    threshold: 20,
    lastUpdated: "2024-05-20",
  },
  {
    id: "3",
    name: "Potatoes",
    category: "Vegetables",
    quantity: 15,
    unit: "kg",
    threshold: 25,
    lastUpdated: "2024-05-21",
  },
  {
    id: "4",
    name: "Gas Cylinders",
    category: "Fuel",
    quantity: 8,
    unit: "units",
    threshold: 3,
    lastUpdated: "2024-05-18",
  },
  {
    id: "5",
    name: "Milk",
    category: "Dairy",
    quantity: 120,
    unit: "L",
    threshold: 40,
    lastUpdated: "2024-05-21",
  },
];

export const MOCK_MENU: MessMenu[] = [
  {
    day: "Monday",
    breakfast: "Idli, Sambar",
    lunch: "Rice, Fish Curry, Veg Thoran",
    dinner: "Chappathi, Dal Fry",
  },
  {
    day: "Tuesday",
    breakfast: "Appam, Veg Stew",
    lunch: "Rice, Chicken Curry, Avial",
    dinner: "Kanji, Payar, Pappadam",
  },
  {
    day: "Wednesday",
    breakfast: "Puttu, Kadala Curry",
    lunch: "Rice, Moru Curry, Cabbage Thoran",
    dinner: "Fried Rice, Gobi Manchurian",
  },
  {
    day: "Thursday",
    breakfast: "Upma, Banana",
    lunch: "Rice, Sambar, Olan",
    dinner: "Chappathi, Egg Roast",
  },
  {
    day: "Friday",
    breakfast: "Masala Dosa, Chutney",
    lunch: "Ghee Rice, Beef Fry, Salad",
    dinner: "Pathiri, Chicken Curry",
  },
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "c1",
    studentId: "3",
    studentName: "Rahul Das",
    category: "Quality",
    description: "Dinner curry was too salty",
    status: "In Progress",
    createdAt: "2024-05-20",
  },
  {
    id: "c2",
    studentId: "5",
    studentName: "Arjun P",
    category: "Hygiene",
    description: "Table cleaning was delayed today",
    status: "Pending",
    createdAt: "2024-05-21",
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "Special Onam Lunch",
    content:
      "Special Sadya will be served this coming Friday. External guests allowed with tokens.",
    author: "Mess Manager",
    date: "2024-05-15",
    priority: "High",
  },
  {
    id: "a2",
    title: "Token Collection",
    content:
      "Mess tokens for next month can be collected from the office starting tomorrow.",
    author: "Office Staff",
    date: "2024-05-20",
    priority: "Normal",
  },
];

export const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    roles: [
      UserRole.CHAIRMAN_SECRETARY,
      UserRole.WARDEN_MATREN,
      UserRole.STAFF,
      UserRole.STUDENT,
    ],
  },
  {
    id: "mess-members",
    label: "Mess Members",
    icon: <Users size={20} />,
    roles: [UserRole.CHAIRMAN_SECRETARY, UserRole.WARDEN_MATREN],
  },
  {
    id: "mess-menu",
    label: "Mess Menu",
    icon: <Utensils size={20} />,
    roles: [
      UserRole.CHAIRMAN_SECRETARY,
      UserRole.WARDEN_MATREN,
      UserRole.STUDENT,
    ],
  },
  {
    id: "inventory",
    label: "Inventory (Stock)",
    icon: <Package size={20} />,
    roles: [
      UserRole.CHAIRMAN_SECRETARY,
      UserRole.WARDEN_MATREN,
      UserRole.STAFF,
    ],
  },
  {
    id: "attendance",
    label: "Meal Attendance",
    icon: <ClipboardCheck size={20} />,
    roles: [
      UserRole.CHAIRMAN_SECRETARY,
      UserRole.WARDEN_MATREN,
      UserRole.STAFF,
    ],
  },
  {
    id: "complaints",
    label: "Feedback & Complaints",
    icon: <MessageSquare size={20} />,
    roles: [
      UserRole.CHAIRMAN_SECRETARY,
      UserRole.WARDEN_MATREN,
      UserRole.STUDENT,
    ],
  },
  {
    id: "announcements",
    label: "Announcements",
    icon: <Bell size={20} />,
    roles: [
      UserRole.CHAIRMAN_SECRETARY,
      UserRole.WARDEN_MATREN,
      UserRole.STAFF,
      UserRole.STUDENT,
    ],
  },
  {
    id: "reports",
    label: "Mess Reports",
    icon: <FileText size={20} />,
    roles: [UserRole.CHAIRMAN_SECRETARY, UserRole.WARDEN_MATREN],
  },
];
