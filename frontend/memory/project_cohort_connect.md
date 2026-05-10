---
name: CohortConnect Project Structure
description: Full-stack social platform for students/faculty — React frontend, Express/MongoDB backend, Manim Python service
type: project
---

Full-stack social platform called CohortConnect built at C:\Users\Rokhiya\Desktop\ProjectSpace\cohort-connect

**Why:** User provided detailed workflow specs for all modules and requested complete implementation with Manim replacing Gemini API for video generation.

**How to apply:** When working on this project, understand the 3-service architecture and the Manim-based AI pipeline.

## Architecture
- **Frontend:** React 19 + Vite 8 + Tailwind CSS 4 — runs on port 5173 (`npm run dev`)
- **Backend:** Node.js + Express + MongoDB (Mongoose) — runs on port 5000 (`cd backend && npm run dev`)
- **Manim Service:** Python Flask + Manim + Pillow — runs on port 5001 (`cd manim-service && python app.py`)

## Key directories
- `src/` — React frontend
- `backend/` — Express API server
- `manim-service/` — Python Flask video/poster generation service

## Features implemented
1. Auth: JWT-based login/signup with role selection (Student/Faculty/Admin)
2. Feed: Paginated post feed with create/edit/delete
3. Posts: Like, save, share tracking with points system
4. Comments: Threaded with replies, likes, parent-child comment structure
5. Leaderboard: Points-based (likes +2, saves +5, view time +1/min, fake post penalty -50)
6. AI Studio: Manim videos, Pillow posters/thumbnails, rule-based captions
7. Reports: Full report pipeline — submit → admin review → resolve/dismiss
8. Admin Panel: Report management with status filters

## Admin code (for testing)
Default admin code: `cohort-admin-2024` (set in backend/.env as ADMIN_SECRET)

## Env files
- `.env` (root) — VITE_API_URL, VITE_MANIM_SERVICE_URL
- `backend/.env` — MONGODB_URI, JWT_SECRET, PORT, MANIM_SERVICE_URL, ADMIN_SECRET
