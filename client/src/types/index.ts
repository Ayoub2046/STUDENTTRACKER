export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  xpPoints: number
  level: number
  streak: number
  isVerified: boolean
  createdAt: string
  profile?: Profile
  settings?: Settings
  _count?: { semesters: number; subjects: number; assignments: number; notifications: number }
}

export interface Profile {
  id: string
  bio?: string
  phone?: string
  department?: string
  faculty?: string
  studentId?: string
  year?: number
}

export interface Settings {
  theme: string
  language: string
}

export interface Semester {
  id: string
  userId: string
  name: string
  year: number
  gpa: number
  cgpa: number
  average: number
  credits: number
  status: string
  startDate?: string
  endDate?: string
  createdAt: string
  _count?: { subjects: number }
}

export interface Subject {
  id: string
  name: string
  code?: string
  credits: number
  semesterId: string
  teacherId?: string
  description?: string
  studyHours: number
  average: number
  grade?: string
  gpaPoint: number
  status: string
  color: string
  semester?: { name: string }
  teacher?: { name: string }
  _count?: { assessments: number; assignments: number; attendance: number }
}

export interface Teacher {
  id: string
  name: string
  department?: string
  email?: string
  phone?: string
  office?: string
  notes?: string
  color: string
  _count?: { subjects: number }
}

export interface Assessment {
  id: string
  subjectId: string
  type: string
  maxMarks: number
  obtainedMarks: number
  percentage: number
  grade?: string
  comments?: string
  date: string
}

export interface Attendance {
  id: string
  subjectId: string
  date: string
  status: string
  notes?: string
}

export interface AttendanceStats {
  present: number
  absent: number
  late: number
  excused: number
  total: number
  percentage: number
}

export interface Assignment {
  id: string
  subjectId?: string
  title: string
  description?: string
  dueDate?: string
  priority: string
  status: string
  submission?: string
  grade?: number
  feedback?: string
  subject?: { name: string; color: string }
}

export interface Project {
  id: string
  title: string
  description?: string
  images?: string
  video?: string
  github?: string
  liveDemo?: string
  technologies?: string
  status: string
  createdAt: string
}

export interface Research {
  id: string
  title: string
  type: string
  description?: string
  authors?: string
  journal?: string
  doi?: string
  pdf?: string
  awards?: string
  year?: number
  status: string
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  description?: string
  issueDate?: string
  expiryDate?: string
  credentialId?: string
  url?: string
  file?: string
}

export interface Skill {
  id: string
  name: string
  category: string
  currentLevel: number
  targetLevel: number
  progress: number
  milestone?: string
  deadline?: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  category: string
  status: string
  targetDate?: string
  completedAt?: string
}

export interface Note {
  id: string
  subjectId?: string
  title: string
  content?: string
  tags?: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
  subject?: { name: string; color: string }
}

export interface Journal {
  id: string
  title: string
  content?: string
  mood?: string
  category: string
  date: string
}

export interface CareerEntry {
  id: string
  type: string
  title: string
  description?: string
  organization?: string
  location?: string
  startDate?: string
  endDate?: string
  isCurrent: boolean
  url?: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  allDay: boolean
  color: string
  category: string
  recurring?: string
}

export interface FileItem {
  id: string
  name: string
  type: string
  size: number
  url: string
  folder: string
  subject?: { name: string }
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link?: string
  createdAt: string
}

export interface StudySession {
  id: string
  subjectId?: string
  duration: number
  type: string
  notes?: string
  date: string
  subject?: { name: string; color: string }
}

export interface DashboardData {
  currentSemester?: Semester
  overallGPA: number
  cgpa: number
  overallAverage: number
  totalCredits: number
  completedCredits: number
  subjects: number
  pendingAssignments: number
  upcomingExams: number
  attendancePercent: number
  skillProgress: number
  currentStreak: number
  todayTasks: number
  weeklyHours: number
  totalStudyHours: number
  completions: number
  recentActivity: { id: string; type: string; title: string; date: string; status?: string }[]
  monthlyProgress: { month: string; hours: number }[]
}

export interface AnalyticsData {
  gpaTrend: { name: string; gpa: number; cgpa: number; average: number }[]
  cgpa: number
  subjectComparison: { name: string; average: number; credits: number; color: string }[]
  attendanceStats: { name: string; value: number }[]
  studyHours: { name: string; hours: number }[]
  taskCompletion: { completed: number; pending: number; overdue: number }
  skillGrowth: { name: string; currentLevel: number; targetLevel: number; progress: number }[]
  totalStudyHours: number
  totalAssessments: number
  averageScore: number
}
