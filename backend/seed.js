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
        const rawStudents = [
            { name: "ABDA SAJJAD", gender: "Female", age: 21 },
            { name: "ADILA SHAHARBAN", gender: "Female", age: 21 },
            { name: "AFRA KAIS P", gender: "Female", age: 21 },
            { name: "AISHWARYA VISHWANATHAN", gender: "Female", age: 20 },
            { name: "ANAGHA SAGUNAN", gender: "Female", age: 21 },
            { name: "ANCIA S BABU", gender: "Female", age: 20 },
            { name: "ASWATHI SHYLESH P", gender: "Female", age: 20 },
            { name: "ATHIRA K", gender: "Female", age: 20 },
            { name: "CHAITHANYA RETHISH", gender: "Female", age: 20 },
            { name: "GOPIKA SUNIL", gender: "Female", age: 20 },
            { name: "HANNA FATHIMA P", gender: "Female", age: 21 },
            { name: "HARITHA P", gender: "Female", age: 20 },
            { name: "HRIDYA M", gender: "Female", age: 19 },
            { name: "JEMSHEERA BASHEER KUNJU", gender: "Female", age: 20 },
            { name: "JESMINA E", gender: "Female", age: 21 },
            { name: "JUDHA C K", gender: "Female", age: 20 },
            { name: "KEERTHANA C K", gender: "Female", age: 20 },
            { name: "NILA S", gender: "Female", age: 20 },
            { name: "NISHITHA E", gender: "Female", age: 20 },
            { name: "PUNYA K", gender: "Female", age: 19 },
            { name: "REEHA FATHIMA", gender: "Female", age: 20 },
            { name: "SAJA FATHIMA EV", gender: "Female", age: 21 },
            { name: "SANDWANA K", gender: "Female", age: 22 },
            { name: "SANIYA K", gender: "Female", age: 20 },
            { name: "SENO CLARANSE", gender: "Female", age: 23 },
            { name: "SHASNA JASMINE K P", gender: "Female", age: 21 },
            { name: "SHEZA P", gender: "Female", age: 21 },
            { name: "SREELAKSHMI K S", gender: "Female", age: 20 },
            { name: "VAISHNAVI A V", gender: "Female", age: 19 },
            { name: "VRINDA A", gender: "Female", age: 20 },
            { name: "ABHINANDANA C P", gender: "Female", age: 20 },
            { name: "ARUNIMA M", gender: "Female", age: 21 },
            { name: "ABHINAV P V", gender: "Male", age: 20 },
            { name: "ABHIRAM K", gender: "Male", age: 21 },
            { name: "AFHAM HUDA M", gender: "Male", age: 22 },
            { name: "AHAMMED IRFAN", gender: "Male", age: 21 },
            { name: "AKSHAY RAJEESH", gender: "Male", age: 20 },
            { name: "AMITH CHALIL", gender: "Male", age: 20 },
            { name: "ANUPAM NIVED D", gender: "Male", age: 21 },
            { name: "AVINASH M P", gender: "Male", age: 20 },
            { name: "GAUTHAM KRISHNA", gender: "Male", age: 19 },
            { name: "JOEAL RAPHEAL JAMES", gender: "Male", age: 20 },
            { name: "KASHINATH A M", gender: "Male", age: 21 },
            { name: "MOHAMED BINSAL", gender: "Male", age: 19 },
            { name: "MOHAMMED SHAHMEL A N P", gender: "Male", age: 21 },
            { name: "MUHAMMAD RASHAD HASHIM", gender: "Male", age: 20 },
            { name: "MUHAMMED RAZIN K T", gender: "Male", age: 21 },
            { name: "NAJIH V", gender: "Male", age: 20 },
            { name: "THEJWIN T K", gender: "Male", age: 20 },
            { name: "MUHAMMAD RISHAL P", gender: "Male", age: 22 }
        ];

        const studentUsers = await Promise.all(rawStudents.map(async (s, i) => {
            // Password is name
            const password = await bcrypt.hash(s.name, 10);
            return {
                name: s.name,
                email: s.name.toLowerCase().replace(/\s+/g, '') + "@gcek.ac.in",
                password: password,
                role: "STUDENT",
                registerNumber: `KNR21CS${(0 + i).toString()}`,
                department: "CSE",
                year: "3rd",
                messStatus: "Active",
                messCardId: `MC-2024-${(100 + i).toString()}`
            };
        }));

        const adminPassword = await bcrypt.hash("password123", 10);
        const staffUsers = [
            {
                name: "Dr. Suresh Kumar",
                email: "warden@gcek.ac.in",
                password: adminPassword,
                role: "WARDEN_MATREN",
            },
            {
                name: "Ravi Teja",
                email: "mess@gcek.ac.in",
                password: adminPassword,
                role: "CHAIRMAN_SECRETARY",
            },
            {
                name: "Sunil V",
                email: "sunil@staff.gcek.ac.in",
                password: adminPassword,
                role: "STAFF",
            }
        ];

        const users = [...staffUsers, ...studentUsers];

        await User.insertMany(users);
        console.log('Users seeded');

        // Resources
        const resources = [
            // Groceries
            { name: "Rice (Ponni)", category: "Groceries", quantity: 1200, unit: "kg", threshold: 200, monthlyUsage: 1500, pricePerUnit: 45, lastUpdated: "2024-05-25" },
            { name: "Basmati Rice", category: "Groceries", quantity: 80, unit: "kg", threshold: 20, monthlyUsage: 100, pricePerUnit: 90, lastUpdated: "2024-05-25" },
            { name: "Wheat Flour (Atta)", category: "Groceries", quantity: 400, unit: "kg", threshold: 100, monthlyUsage: 500, pricePerUnit: 40, lastUpdated: "2024-05-25" },
            { name: "Toor Dal", category: "Groceries", quantity: 80, unit: "kg", threshold: 20, monthlyUsage: 100, pricePerUnit: 110, lastUpdated: "2024-05-25" },
            { name: "Urad Dal", category: "Groceries", quantity: 120, unit: "kg", threshold: 30, monthlyUsage: 150, pricePerUnit: 130, lastUpdated: "2024-05-25" },
            { name: "Green Gram", category: "Groceries", quantity: 60, unit: "kg", threshold: 15, monthlyUsage: 80, pricePerUnit: 100, lastUpdated: "2024-05-25" },
            { name: "Bengal Gram", category: "Groceries", quantity: 50, unit: "kg", threshold: 10, monthlyUsage: 70, pricePerUnit: 90, lastUpdated: "2024-05-25" },
            { name: "Rava", category: "Groceries", quantity: 80, unit: "kg", threshold: 20, monthlyUsage: 100, pricePerUnit: 50, lastUpdated: "2024-05-25" },
            { name: "Sugar", category: "Groceries", quantity: 120, unit: "kg", threshold: 30, monthlyUsage: 150, pricePerUnit: 42, lastUpdated: "2024-05-25" },
            { name: "Cooking Oil", category: "Groceries", quantity: 250, unit: "L", threshold: 50, monthlyUsage: 300, pricePerUnit: 120, lastUpdated: "2024-05-25" },
            { name: "Coconut Oil", category: "Groceries", quantity: 80, unit: "L", threshold: 20, monthlyUsage: 100, pricePerUnit: 180, lastUpdated: "2024-05-25" },
            { name: "Ghee", category: "Groceries", quantity: 25, unit: "kg", threshold: 5, monthlyUsage: 30, pricePerUnit: 600, lastUpdated: "2024-05-25" },
            { name: "Tea Powder", category: "Groceries", quantity: 40, unit: "kg", threshold: 10, monthlyUsage: 50, pricePerUnit: 300, lastUpdated: "2024-05-25" },
            { name: "Coffee Powder", category: "Groceries", quantity: 25, unit: "kg", threshold: 5, monthlyUsage: 30, pricePerUnit: 400, lastUpdated: "2024-05-25" },

            // Vegetables
            { name: "Onions", category: "Vegetables", quantity: 350, unit: "kg", threshold: 50, monthlyUsage: 400, pricePerUnit: 30, lastUpdated: "2024-05-28" },
            { name: "Tomatoes", category: "Vegetables", quantity: 250, unit: "kg", threshold: 40, monthlyUsage: 300, pricePerUnit: 25, lastUpdated: "2024-05-28" },
            { name: "Potatoes", category: "Vegetables", quantity: 250, unit: "kg", threshold: 40, monthlyUsage: 300, pricePerUnit: 35, lastUpdated: "2024-05-28" },
            { name: "Green Chilies", category: "Vegetables", quantity: 25, unit: "kg", threshold: 5, monthlyUsage: 30, pricePerUnit: 60, lastUpdated: "2024-05-28" },
            { name: "Ginger", category: "Vegetables", quantity: 15, unit: "kg", threshold: 5, monthlyUsage: 20, pricePerUnit: 120, lastUpdated: "2024-05-28" },
            { name: "Garlic", category: "Vegetables", quantity: 15, unit: "kg", threshold: 5, monthlyUsage: 20, pricePerUnit: 150, lastUpdated: "2024-05-28" },
            { name: "Carrots", category: "Vegetables", quantity: 80, unit: "kg", threshold: 20, monthlyUsage: 100, pricePerUnit: 50, lastUpdated: "2024-05-28" },
            { name: "Cabbage", category: "Vegetables", quantity: 80, unit: "kg", threshold: 20, monthlyUsage: 100, pricePerUnit: 40, lastUpdated: "2024-05-28" },
            { name: "Beans", category: "Vegetables", quantity: 60, unit: "kg", threshold: 15, monthlyUsage: 80, pricePerUnit: 60, lastUpdated: "2024-05-28" },
            { name: "Cauliflower", category: "Vegetables", quantity: 80, unit: "kg", threshold: 20, monthlyUsage: 100, pricePerUnit: 45, lastUpdated: "2024-05-28" },
            { name: "Coconut", category: "Vegetables", quantity: 500, unit: "units", threshold: 100, monthlyUsage: 600, pricePerUnit: 20, lastUpdated: "2024-05-28" },

            // Dairy
            { name: "Milk", category: "Dairy", quantity: 100, unit: "L", threshold: 50, monthlyUsage: 1500, pricePerUnit: 52, lastUpdated: "2024-05-28" },
            { name: "Curd/Yogurt", category: "Dairy", quantity: 50, unit: "L", threshold: 20, monthlyUsage: 400, pricePerUnit: 60, lastUpdated: "2024-05-28" },

            // Meat & Eggs
            { name: "Chicken", category: "Meat & Eggs", quantity: 400, unit: "kg", threshold: 50, monthlyUsage: 500, pricePerUnit: 180, lastUpdated: "2024-05-28" },
            { name: "Fish", category: "Meat & Eggs", quantity: 300, unit: "kg", threshold: 50, monthlyUsage: 400, pricePerUnit: 250, lastUpdated: "2024-05-28" },
            { name: "Beef", category: "Meat & Eggs", quantity: 150, unit: "kg", threshold: 30, monthlyUsage: 200, pricePerUnit: 350, lastUpdated: "2024-05-28" },
            { name: "Eggs", category: "Meat & Eggs", quantity: 2500, unit: "units", threshold: 500, monthlyUsage: 3000, pricePerUnit: 6, lastUpdated: "2024-05-28" },

            // Spices
            { name: "Chilli Powder", category: "Spices", quantity: 40, unit: "kg", threshold: 10, monthlyUsage: 50, pricePerUnit: 250, lastUpdated: "2024-05-25" },
            { name: "Coriander Powder", category: "Spices", quantity: 40, unit: "kg", threshold: 10, monthlyUsage: 50, pricePerUnit: 200, lastUpdated: "2024-05-25" },
            { name: "Turmeric Powder", category: "Spices", quantity: 15, unit: "kg", threshold: 5, monthlyUsage: 20, pricePerUnit: 180, lastUpdated: "2024-05-25" },
            { name: "Garam Masala", category: "Spices", quantity: 10, unit: "kg", threshold: 3, monthlyUsage: 15, pricePerUnit: 600, lastUpdated: "2024-05-25" },

            // Fuel
            { name: "Gas Cylinders", category: "Fuel", quantity: 20, unit: "units", threshold: 5, monthlyUsage: 25, pricePerUnit: 1100, lastUpdated: "2024-05-25" }
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

        // Upcoming Menu
        const upcomingMenu = [
            {
                day: "Monday",
                breakfast: "Puri, Masala",
                lunch: "Rice, Sambar, Cabbage",
                dinner: "Chappathi, Veg Curry",
                type: "upcoming"
            },
            {
                day: "Tuesday",
                breakfast: "Idiyappam, Egg Curry",
                lunch: "Rice, Fish Fry, Moru",
                dinner: "Ghee Rice, Chicken",
                type: "upcoming"
            },
            {
                day: "Wednesday",
                breakfast: "Dosa, Sambar",
                lunch: "Biryani, Salad, Pickle",
                dinner: "Porotta, Beef Roast",
                type: "upcoming"
            },
            {
                day: "Thursday",
                breakfast: "Upma, Banana",
                lunch: "Rice, Dal, Beans Mezhukkupuratti",
                dinner: "Chappathi, Paneer Butter Masala",
                type: "upcoming"
            },
            {
                day: "Friday",
                breakfast: "Appam, Stew",
                lunch: "Sadya (Rice, Sambar, Avial, Payasam)",
                dinner: "Kanji, Payar",
                type: "upcoming"
            }
        ];

        await MessMenu.insertMany(upcomingMenu);
        console.log('Menu seeded');

        // Complaints
        const students = await User.find({ role: "STUDENT" }).limit(2);
        const student1 = students[0];
        const student2 = students[1];

        const complaints = [
            {
                studentId: student1 ? student1._id : "temp_id_1",
                studentName: student1 ? student1.name : "Student 1",
                category: "Quality",
                description: "Dinner curry was too salty",
                status: "In Progress",
                createdAt: "2024-05-20",
            },
            {
                studentId: student2 ? student2._id : "temp_id_2",
                studentName: student2 ? student2.name : "Student 2",
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
