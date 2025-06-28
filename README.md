# 🎯 Gamified Habit Tracker

A full-stack web application designed to help users build and maintain positive habits through engaging **game mechanics** like XP, streaks, levels, and achievement badges.

## 🧠 Overview

Traditional habit trackers often struggle with user motivation. This project turns habit tracking into a **quest-like experience**, making self-improvement more rewarding and sustainable. Built with **Node.js** and **Express.js** on the backend, and **React.js (Vite)** on the frontend, it offers a seamless, interactive platform for users to track, manage, and celebrate habit progress.

## 🚀 Features

- 🔐 JWT-based user authentication
- ✅ Create, edit, delete, and complete habits
- 📈 XP gain, level-ups, and streak tracking
- 🏆 Achievements and badges
- 🎯 Dynamic challenges with multiple types:
  - Level-based
  - XP milestones
  - Count or streak goals
- 🧾 Daily logging and dashboard summary
- 🧩 Habit customization: name, icon, frequency, point value, etc.
- 💬 Real-time feedback via toast notifications

## 🛠️ Tech Stack

| Frontend     | Backend       | Database |
|--------------|---------------|----------|
| React (Vite) | Node.js       | MongoDB  |
| React Router | Express.js    |          |
| Context API  | JWT Auth      |          |
| Axios        | bcrypt        |          |
| React Toastify |             |          |

## 🎨 UI Highlights

- Responsive, mobile-friendly design
- Dashboard with XP bar, streak tracker, and habit overview
- Challenge tracker with visual progress
- Profile page displaying stats and earned badges

## 🔒 Security

- Encrypted password storage using `bcrypt`
- Protected routes with JWT middleware
- Role-based logic for potential admin access (seeding challenges)

## 📦 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/Malathi-gokila/Job_search_platform.git
cd Job_search_platform

# Install backend dependencies
cd backend
npm install
npm run dev

# Install frontend dependencies
cd ../frontend
npm install
npm run dev
