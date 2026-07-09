import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }).format(new Date(date))
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date))
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function calculateGPA(percentage: number): number {
  if (percentage >= 90) return 4.0
  if (percentage >= 85) return 4.0
  if (percentage >= 80) return 3.7
  if (percentage >= 75) return 3.3
  if (percentage >= 70) return 3.0
  if (percentage >= 65) return 2.7
  if (percentage >= 60) return 2.3
  if (percentage >= 55) return 2.0
  if (percentage >= 50) return 1.7
  if (percentage >= 45) return 1.3
  if (percentage >= 40) return 1.0
  return 0.0
}

export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+'
  if (percentage >= 85) return 'A'
  if (percentage >= 80) return 'A-'
  if (percentage >= 75) return 'B+'
  if (percentage >= 70) return 'B'
  if (percentage >= 65) return 'B-'
  if (percentage >= 60) return 'C+'
  if (percentage >= 55) return 'C'
  if (percentage >= 50) return 'C-'
  if (percentage >= 45) return 'D+'
  if (percentage >= 40) return 'D'
  return 'F'
}

export const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'in-progress': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  published: 'bg-green-500/10 text-green-400 border-green-500/20',
  passed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  present: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  absent: 'bg-red-500/10 text-red-400 border-red-500/20',
  late: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  excused: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  low: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export function getStatusColor(status: string): string {
  return statusColors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

export const assessmentTypes = [
  'Quiz 1', 'Quiz 2', 'Quiz 3', 'Lab', 'Assignment',
  'Presentation', 'Project', 'Midterm Activities', 'Midterm Exam',
  'Final Activities', 'Final Exam', 'Practical', 'Research', 'Participation'
]
