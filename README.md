# GCEK Hostel Mess Management System (HMMS)

A full-stack platform for managing hostel mess operations at GCEK, including menu planning, attendance, inventory, announcements, complaints, and role-based access. Built with React (Vite), Node.js/Express, MongoDB, and Gemini LLM integration.

---

## Features

- **Role-based Access:** Student, Staff, Warden, Mess Manager, Admin
- **Mess Menu Management:** View, update, and schedule weekly menus
- **Attendance Tracking:** Record and analyze meal attendance
- **Resource Inventory:** Track groceries, supplies, and thresholds
- **Complaint System:** File and resolve complaints, LLM-powered analysis
- **Announcements:** Smart, LLM-powered announcements
- **LLM Chatbot:** Gemini-powered assistant for queries and insights
- **Secure Auth:** Registration and login with JWT
- **Modern UI:** Responsive, dashboard-style interface

---

## Project Structure

- `/pages` — React pages (Dashboard, MessManagement, Attendance, Inventory, etc.)
- `/components` — Shared UI components
- `/backend` — Express API, MongoDB models, authentication, LLM integration
- `/types.ts` — Shared TypeScript types
- `/constants.tsx` — App constants and mock data

---

## Local Setup

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/muhammad-thaha/Hostel-Mess-Management-System--HMS.git
cd Hostel-Mess-Management-System--HMS
```

### 2. Install dependencies

#### Frontend

```bash
npm install
```

#### Backend

```bash
cd backend
npm install
```

### 3. Environment Variables

#### Frontend

- Copy `.env.local` and set your Gemini API key:
  ```env
  GEMINI_API_KEY=your_gemini_api_key
  ```

#### Backend

- Copy `.env` and set your MongoDB URI and Gemini API key:
  ```env
  MONGO_URI=mongodb://localhost:27017/hmms
  PORT=5000
  GEMINI_API_KEY=your_gemini_api_key
  ```

### 4. Run the backend server

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### 5. Run the frontend app

```bash
cd ..
npm run dev
# Runs on http://localhost:5173
```

---

## Usage

- Register or login with your role (Student, Staff, Warden, Mess Manager, Admin)
- Access features based on your role
- Use the dashboard for analytics and quick actions
- Mess menu, attendance, inventory, complaints, and announcements are all live and role-filtered

---

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Lucide Icons, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Gemini API

---

## Project Metadata

- **Name:** GCEK Hostel Mess Management System
- **Description:** Specialized platform for managing mess operations at GCEK, focusing on timings, menu planning, resource inventory, and attendance tracking.

---

## License

MIT License
