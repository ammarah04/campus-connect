# CampusConnect

A full-stack university community platform built with the MERN stack. Students can join societies through an interview-based application process, register for events with QR-code attendance tracking, get real-time notifications, participate in department-scoped discussions, and share study resources — all scoped to their department (CS, SE, AI, Data Science, Cyber).

## Features

- **Authentication** — JWT access + refresh tokens, department-based registration
- **Societies** — browse, apply to join (with a scheduled interview step before approval), society admin dashboards with analytics
- **Events** — create, register, waitlist with auto-promotion, QR-code check-in, capacity limits
- **Real-time notifications** — Socket.io powered, bell icon with unread count
- **Discussion forum** — posts, comments, likes, category filters, department-scoped
- **Study resources** — upload and browse notes, past papers, quiz prep, and assignment help (PDF/image/Word/PowerPoint uploads via Cloudinary), department-scoped
- **Announcements** — targeted by department, semester, society, or university-wide
- **Real-time event chat** — per-event group chat for registered attendees
- **Certificates** — PDF certificate generation for event attendance
- **Department scoping** — most content (societies, events, announcements, discussions, study resources) is scoped to the user's department (CS, SE, AI, Data Science, Cyber); university admins see everything

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, TanStack Query, React Hook Form, Recharts, Socket.io Client, qrcode.react, html5-qrcode, date-fns

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, Socket.io, pdfkit, Cloudinary, Multer

## Getting Started

### Prerequisites
- Node.js
- A MongoDB Atlas account (or local MongoDB instance)
- A Cloudinary account (for file uploads)

### Installation

1. Clone the repository
git clone <your-repo-url>
cd CampusConnect

2. Install server dependencies
cd server
npm install

3. Install client dependencies
cd ../client
npm install
4. Set up environment variables
Create a `.env` file in `server/` with:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Create a `.env` file in `client/` with:

VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

5. Run the app

In one terminal:
cd server
npm run dev

In another terminal:
cd client
npm run dev

The client runs at `http://localhost:5173`, the server at `http://localhost:5000`.

## Project Structure

CampusConnect/
├── client/ # React + Vite frontend
│ └── src/
│ ├── pages/
│ ├── components/
│ ├── context/
│ └── api/
└── server/ # Express backend
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
└── scripts/


## License

This project was built as a personal portfolio project.
