import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, MessResource, MessMenu, Complaint, Announcement, AttendanceRecord } from './models.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hmms';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected for seeding');

        // Clear existing data
        await User.deleteMany({});
        await MessResource.deleteMany({});
        await MessMenu.deleteMany({});
        await Complaint.deleteMany({});
        await Announcement.deleteMany({});
        await AttendanceRecord.deleteMany({});

        console.log('Existing data cleared');

        // Hash password
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Users
        const users = [
            {
                name: "Dr. Suresh Kumar",
                email: "warden@gcek.ac.in",
                password: hashedPassword,
                role: "WARDEN_MATREN",
            },
            {
                name: "Ravi Teja",
                email: "mess@gcek.ac.in",
                password: hashedPassword,
                role: "CHAIRMAN_SECRETARY",
            },
            {
                name: "Rahul Das",
                email: "rahul@student.gcek.ac.in",
                password: hashedPassword,
                role: "STUDENT",
                registerNumber: "KNR21CS045",
                department: "CSE",
                year: "3rd",
                messStatus: "Active",
                messCardId: "MC-2024-045",
            },
            {
                name: "Sunil V",
                email: "sunil@staff.gcek.ac.in",
                password: hashedPassword,
                role: "STAFF",
            },
            {
                name: "Arjun P",
                email: "arjun@student.gcek.ac.in",
                password: hashedPassword,
                role: "STUDENT",
                registerNumber: "KNR21CS050",
                department: "ME",
                year: "3rd",
                messStatus: "Active",
                messCardId: "MC-2024-050",
            }
        ];

        await User.insertMany(users);
        console.log('Users seeded');

        // Resources
        const resources = [
            {
                name: "Rice",
                category: "Groceries",
                quantity: 250,
                unit: "kg",
                threshold: 50,
                lastUpdated: "2024-05-20",
            },
            {
                name: "Cooking Oil",
                category: "Groceries",
                quantity: 45,
                unit: "L",
                threshold: 20,
                lastUpdated: "2024-05-20",
            },
            {
                name: "Potatoes",
                category: "Vegetables",
                quantity: 15,
                unit: "kg",
                threshold: 25,
                lastUpdated: "2024-05-21",
            },
            {
                name: "Gas Cylinders",
                category: "Fuel",
                quantity: 8,
                unit: "units",
                threshold: 3,
                lastUpdated: "2024-05-18",
            },
            {
                name: "Milk",
                category: "Dairy",
                quantity: 120,
                unit: "L",
                threshold: 40,
                lastUpdated: "2024-05-21",
            },
        ];

        await MessResource.insertMany(resources);
        console.log('Resources seeded');

        // Menu
        const menu = [
            {
                day: "Monday",
                breakfast: "Idli, Sambar",
                lunch: "Rice, Fish Curry, Veg Thoran",
                dinner: "Chappathi, Dal Fry",
                type: "current"
            },
            {
                day: "Tuesday",
                breakfast: "Appam, Veg Stew",
                lunch: "Rice, Chicken Curry, Avial",
                dinner: "Kanji, Payar, Pappadam",
                type: "current"
            },
            {
                day: "Wednesday",
                breakfast: "Puttu, Kadala Curry",
                lunch: "Rice, Moru Curry, Cabbage Thoran",
                dinner: "Fried Rice, Gobi Manchurian",
                type: "current"
            },
            {
                day: "Thursday",
                breakfast: "Upma, Banana",
                lunch: "Rice, Sambar, Olan",
                dinner: "Chappathi, Egg Roast",
                type: "current"
            },
            {
                day: "Friday",
                breakfast: "Masala Dosa, Chutney",
                lunch: "Ghee Rice, Beef Fry, Salad",
                dinner: "Pathiri, Chicken Curry",
                type: "current"
            },
        ];

        await MessMenu.insertMany(menu);
        console.log('Menu seeded');

        // Complaints
        const rahul = await User.findOne({ email: "rahul@student.gcek.ac.in" });
        const arjun = await User.findOne({ email: "arjun@student.gcek.ac.in" });

        const complaints = [
            {
                studentId: rahul ? rahul._id : "temp_id_1",
                studentName: "Rahul Das",
                category: "Quality",
                description: "Dinner curry was too salty",
                status: "In Progress",
                createdAt: "2024-05-20",
            },
            {
                studentId: arjun ? arjun._id : "temp_id_2",
                studentName: "Arjun P",
                category: "Hygiene",
                description: "Table cleaning was delayed today",
                status: "Pending",
                createdAt: "2024-05-21",
            },
        ];

        await Complaint.insertMany(complaints);
        console.log('Complaints seeded');

        // Announcements
        const announcements = [
            {
                title: "Special Onam Lunch",
                content:
                    "Special Sadya will be served this coming Friday. External guests allowed with tokens.",
                author: "Mess Manager",
                date: "2024-05-15",
                priority: "High",
            },
            {
                title: "Token Collection",
                content:
                    "Mess tokens for next month can be collected from the office starting tomorrow.",
                author: "Office Staff",
                date: "2024-05-20",
                priority: "Normal",
            },
        ];

        await Announcement.insertMany(announcements);
        console.log('Announcements seeded');

        console.log('Seed completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
