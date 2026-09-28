# School Examination Management System — Full-Stack Web Application

A production-style, secure, responsive School Examination Management System built with **React.js**, **Express.js**, and **MySQL**. Features role-based access for **Students** and **Admin/Teachers**, live examination countdown timer, persistent question navigation palette, instant auto-grading, result analytics, and leaderboards.

---

## 🌟 Key Features

### 🎓 Student Suite
- **Account Registration & Authentication**: Student registration with class assignment.
- **Available Examinations**: View exams published specifically for the student's enrolled class.
- **Exam Instructions & Checklist**: Review exam duration, passing thresholds, marking scheme before launching.
- **Interactive Examination Engine**:
  - Persistent real-time countdown timer with auto-submission on expiration.
  - Question Palette displaying status (🟩 Answered, 🟧 Marked for Review, 🟦 Current, ⬜ Unanswered).
  - Clear Answer & Mark for Review options.
  - Submit confirmation dialog displaying attempt summary.
- **Instant Result Evaluation**: Comprehensive score breakdown (Attempted, Correct, Incorrect, Unanswered, Percentage, Pass/Fail).
- **Answer Review**: Itemized review showing student's chosen option vs correct answer key.
- **Exam History**: Track past performance and scores over time.

### 👑 Admin / Teacher Suite
- **Analytics Dashboard**: Real-time stats (Total Students, Active Classes, Subjects, Examinations, Submissions).
- **Student Management**: Add, edit, assign classes, deactivate, or delete student accounts.
- **Class Management**: Full CRUD management for academic classes (e.g. Class 9, Class 10, Class 11, Class 12).
- **Subject Management**: Full CRUD management for subjects (e.g. Mathematics, Computer Science, Science) with course codes.
- **Examination Management**: Create exams, set title, target class, subject, duration, total marks, passing marks, and toggle publish/draft status.
- **MCQ Question Bank**: Create and manage multiple-choice questions per exam, assign 4 options, set correct answer key (A/B/C/D), and assign marks.
- **Master Results & Leaderboard**: Filter student scores by class, subject, exam, sort by marks, inspect individual student attempt breakdown, and view Top Performers Leaderboard.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM (v6), Axios, Lucide Icons, Custom CSS Design System.
- **Backend**: Node.js, Express.js (REST API Architecture), Cors, Dotenv, JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`).
- **Database**: MySQL (`mysql2` connection pool & prepared statements with `database/schema.sql`). Seamless embedded persistence fallback included for instant out-of-the-box running.

---

## 🔑 Demo Test Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Teacher / Admin** | `admin@school.com` | `admin123` | Full system access, exam & student management |
| **Student (Class 10)** | `john@student.com` | `student123` | Enrolled in Class 10 |
| **Student (Class 12)** | `sarah@student.com` | `student123` | Enrolled in Class 12 |

---

## 🚀 Quick Setup & Installation Instructions

### 1. Prerequisites
- Node.js (v16+) installed
- MySQL Server (optional; if MySQL is not running, the application seamlessly uses an embedded file-backed database so it works immediately without setup!).

### 2. Database Setup (MySQL)
If using local MySQL:
```bash
mysql -u root -p < database/schema.sql
```

### 3. Backend Setup
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Copy environment file:
   ```bash
   cp ../.env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start backend server:
   ```bash
   npm start
   ```
   *The backend server runs on `http://localhost:5000`.*

### 4. Frontend Setup
1. Navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite dev server:
   ```bash
   npm run dev
   ```
   *The frontend web app runs on `http://localhost:3000`.*

---

## 📂 Project Structure

```
school-exam-system/
├── client/
│   ├── src/
│   │   ├── components/   # Navbar, Sidebar, Modal, ProtectedRoute
│   │   ├── context/      # AuthContext
│   │   ├── layouts/      # DashboardLayout
│   │   ├── pages/        # Login, Register, Dashboards, Exam Engine, Results, Management Pages
│   │   ├── services/     # API Axios wrapper
│   │   ├── App.jsx       # Route configuration
│   │   ├── index.css     # Global CSS design tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── config/           # DB pool setup, JWT secret
│   ├── controllers/      # Auth, Students, Classes, Subjects, Exams, Questions, Results
│   ├── middleware/       # Auth JWT, Role RBAC, Error Handler
│   ├── routes/           # REST API Route declarations
│   ├── utils/            # Seed data initializer
│   ├── app.js            # Express server entry point
│   └── package.json
├── database/
│   └── schema.sql        # MySQL relational schema
├── .env.example
├── .gitignore
└── README.md
```
