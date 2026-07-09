# 🎓 AYUB Academic OS

**The Ultimate Student Academic & Career Operating System**

A complete, production-ready SaaS web application for student management, academic analytics, career growth, skills tracking, portfolio management, GPA calculation, and performance dashboards.

## Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS v4** with custom theme
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Lucide React** icons
- **React Router** for routing
- **React Hot Toast** for notifications

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** with **SQLite** (dev) / **PostgreSQL** (prod)
- **JWT** authentication with refresh tokens
- **bcryptjs** for password hashing
- **Multer** for file uploads

## Project Structure

```
ayub-academic-os/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   └── badge.tsx
│   │   │   └── layout/
│   │   │       ├── AppLayout.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── TopBar.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/
│   │   │   ├── utils.ts
│   │   │   └── api.ts
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Semesters.tsx
│   │   │   ├── Subjects.tsx
│   │   │   ├── Teachers.tsx
│   │   │   ├── Marks.tsx
│   │   │   ├── Attendance.tsx
│   │   │   ├── Assignments.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── Research.tsx
│   │   │   ├── Certificates.tsx
│   │   │   ├── Skills.tsx
│   │   │   ├── Career.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Files.tsx
│   │   │   ├── Goals.tsx
│   │   │   ├── Journal.tsx
│   │   │   ├── Notes.tsx
│   │   │   ├── Achievements.tsx
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                     # Express Backend
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.ts
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── upload.ts
│   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── helpers.ts
│   │   │   ├── jwt.ts
│   │   │   └── prisma.ts
│   │   └── index.ts
│   ├── uploads/
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

## Features

### Core Modules (20+)
- **Dashboard** - Overview cards, monthly progress charts, recent activity
- **Academic Journey** - Semester tracking with GPA, CGPA, averages
- **Subjects** - Manage subjects with grades, credits, teachers
- **Teachers** - Directory of instructors with contact info
- **Marks** - Assessment tracking with automatic GPA calculation
- **Attendance** - Track present/absent/late with percentage charts
- **Assignments** - Assignment management with priority and status
- **Projects** - Portfolio of projects with GitHub links
- **Research** - Papers, posters, journals with DOI tracking
- **Certificates** - Professional certifications from major platforms
- **Skills** - Skill tracking with progress bars and categories
- **Career** - CV, internships, jobs, and career entries
- **Calendar** - Academic calendar with event management
- **Analytics** - GPA trends, subject comparison, attendance pie charts
- **Files** - File upload and organization by subject
- **Goals** - Daily/weekly/monthly/yearly goal tracking
- **Journal** - Daily reflections and learning notes
- **Notes** - Rich text notes with subject tagging
- **Achievements** - Gamification with XP and levels
- **AI Assistant** - Chat-based AI study helper
- **Settings** - Theme, language, profile, password management

### Advanced Features
- **JWT Authentication** with refresh tokens and role-based access
- **Dark/Light Theme** with system preference detection
- **Glassmorphism UI** design with smooth animations
- **Responsive Layout** for all screen sizes
- **Landing Page** with hero, features, and testimonials
- **Global Search** across all modules
- **Notifications** system with read/unread
- **Auto GPA/CGPA Calculation** from assessment marks
- **Real-time Charts** with Recharts
- **File Upload** with type validation
- **Protected Routes** with authentication guards

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd ayub-academic-os

# 2. Set up the backend
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev

# 3. In a new terminal, set up the frontend
cd client
npm install
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Environment Variables

#### Server (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| POST | /api/auth/refresh | Refresh token |
| POST | /api/auth/forgot-password | Request reset |
| POST | /api/auth/reset-password | Reset password |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/password | Change password |
| PUT | /api/auth/settings | Update settings |

### Modules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Dashboard data |
| GET | /api/search?q= | Global search |
| CRUD | /api/semesters | Semester management |
| CRUD | /api/subjects | Subject management |
| CRUD | /api/teachers | Teacher management |
| CRUD | /api/assessments/:subjectId | Assessment management |
| CRUD | /api/attendance/:subjectId | Attendance management |
| CRUD | /api/assignments | Assignment management |
| CRUD | /api/projects | Project management |
| CRUD | /api/research | Research management |
| CRUD | /api/certificates | Certificate management |
| CRUD | /api/skills | Skill management |
| CRUD | /api/goals | Goal management |
| CRUD | /api/notes | Note management |
| CRUD | /api/journal | Journal management |
| CRUD | /api/career | Career management |
| CRUD | /api/events | Calendar events |
| CRUD | /api/files | File management |
| GET | /api/analytics | Analytics data |
| GET | /api/achievements | Achievements |
| POST | /api/chat | AI Chat messages |

## Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
vercel --prod
```

### Backend (Render/Railway)
```bash
cd server
npm run build
# Deploy dist/ to Render or Railway
```

### Database (Supabase for production)
Update `.env` with your Supabase PostgreSQL connection string:
```
DATABASE_URL="postgresql://user:password@host:6543/postgres"
```

## Design System

### Colors
- **Primary**: Violet (#8b5cf6)
- **Accent**: Emerald (#10b981)
- **Background**: Dark (#0a0a12)
- **Cards**: Glass effect (rgba(255,255,255,0.03) with backdrop-blur)

### Typography
- **Font**: Inter (system font stack fallback)
- **Scale**: 12px - 48px

### Components
- **Glassmorphism**: `.glass` class with backdrop-filter blur
- **Cards**: `.card-gradient` with gradient backgrounds
- **Animations**: Framer Motion for page transitions
- **Charts**: Recharts with custom dark theme

## Security
- JWT access tokens (15min) + refresh tokens (7 days)
- Password hashing with bcrypt (12 rounds)
- Role-based access (student, admin, superadmin)
- Rate limiting on API routes
- CORS protection
- File upload validation
- Protected routes on frontend

## License
MIT

---

Built with ❤️ by AYUB Academic OS
