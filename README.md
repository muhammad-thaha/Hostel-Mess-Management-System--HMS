# Hostel Mess Management System (HMMS)

Full-stack hostel mess management application with:

- React + Vite frontend
- Express + MongoDB backend
- Gemini-powered assistant features (with deterministic DB-backed menu answers)

## Features

- User authentication (register/login)
- Weekly menu management (`current` and `upcoming`)
- Inventory tracking and AI risk prediction
- Announcements and complaint system
- Attendance tracking
- Mess Mate chat assistant
	- Reads latest menu data from DB
	- Answers weekly spread, upcoming meal, and menu update-time queries from live DB data

## Project Structure

```text
.
|- backend/           # Express + MongoDB API
|- components/        # React components
|- pages/             # React pages
|- .env.example       # Shared env template (frontend + backend)
|- package.json       # Frontend + workspace scripts
```

## Requirements

- Node.js 18+
- npm 9+
- MongoDB (local or Docker)

## Environment

Single shared env file at project root:

1. Create `.env` from template:

```bash
cp .env.example .env
```

2. Fill values:

```env
PORT=5000
MONGO_URI=mongodb://<user>:<password>@localhost:27017/hmms?authSource=admin
JWT_SECRET=replace_with_a_strong_secret
GEMINI_API_KEY=your_gemini_api_key
```

Notes:

- Frontend reads `GEMINI_API_KEY` via `vite.config.ts`.
- Backend always loads root `.env`.

## Install

Install root and backend dependencies:

```bash
npm install
cd backend && npm install
```

## Run

From project root:

- Frontend only:

```bash
npm run dev
```

- Backend only (from root):

```bash
npm run dev:backend
```

- Frontend + backend together:

```bash
npm run dev:all
```

Default URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Seed Database

This resets and reseeds core collections (users/resources/menu/complaints/announcements):

```bash
cd backend
node seed.js
```

## Useful Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/menu?type=current`
- `GET /api/menu?type=upcoming`
- `POST /api/ai/chat`

## Troubleshooting

- `Command find requires authentication` on signup:
	- Your `MONGO_URI` credentials are invalid or missing.
- `EADDRINUSE` on port `5000` or `3000`:
	- Kill old processes and restart.
- Gemini `429 quota exceeded`:
	- Chat still answers menu/schedule queries from DB deterministically.

