import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BookOpen, GraduationCap, BookMarked, Users, ScrollText,
  ClipboardCheck, CalendarCheck, FolderKanban, FlaskConical, Award,
  Brain, Briefcase, Calendar, BarChart3, FolderOpen, Target, BookHeart,
  StickyNote, Trophy, Settings, ChevronLeft, ChevronRight,
  School, Sparkles, Search
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: School, label: 'Academic Journey', path: '/semesters' },
  { icon: BookOpen, label: 'Subjects', path: '/subjects' },
  { icon: Users, label: 'Teachers', path: '/teachers' },
  { icon: ScrollText, label: 'Marks', path: '/marks' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
  { icon: ClipboardCheck, label: 'Assignments', path: '/assignments' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: FlaskConical, label: 'Research', path: '/research' },
  { icon: Award, label: 'Certificates', path: '/certificates' },
  { icon: Brain, label: 'Skills', path: '/skills' },
  { icon: Briefcase, label: 'Career', path: '/career' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: FolderOpen, label: 'Files', path: '/files' },
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: BookHeart, label: 'Journal', path: '/journal' },
  { icon: StickyNote, label: 'Notes', path: '/notes' },
  { icon: Trophy, label: 'Achievements', path: '/achievements' },
  { icon: Sparkles, label: 'AI Assistant', path: '/ai-assistant' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen z-40 transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-60'
    )}>
      <div className="h-full glass border-r border-white/5 flex flex-col">
        <div className={cn(
          'flex items-center gap-3 px-4 h-14 border-b border-white/5',
          collapsed && 'justify-center px-2'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm text-white">AYUB OS</span>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {!collapsed && (
            <div className="px-3 py-2 mb-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                <input
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
          )}
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'sidebar-item',
                isActive && 'active',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </div>

        <div className="border-t border-white/5 p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-item w-full justify-center"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
