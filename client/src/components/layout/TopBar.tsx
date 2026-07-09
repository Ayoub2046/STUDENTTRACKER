import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { getInitials } from '@/lib/utils'
import { Bell, Search, Sun, Moon, LogOut, User, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function TopBar({ onSearch }: { onSearch?: (q: string) => void }) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="h-14 glass border-b border-white/5 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          placeholder="Search anything..."
          className="bg-transparent border-none outline-none text-sm text-gray-300 placeholder-gray-500 w-full"
          onChange={e => onSearch?.(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center text-xs font-medium text-white">
              {user ? getInitials(user.name) : '?'}
            </div>
            <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 z-50 rounded-xl glass border border-white/10 shadow-xl overflow-hidden">
                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-all" onClick={() => setShowUserMenu(false)}>
                  <User className="w-4 h-4" /> Profile
                </Link>
                <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-all" onClick={() => setShowUserMenu(false)}>
                  <SettingsIcon className="w-4 h-4" /> Settings
                </Link>
                <hr className="border-white/5" />
                <button onClick={() => { setShowUserMenu(false); logout() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-all">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
