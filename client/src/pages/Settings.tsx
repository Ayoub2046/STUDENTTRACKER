import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun, Monitor, Globe, User, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export function Settings() {
  const { user, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()

  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.profile?.bio || '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [language, setLanguage] = useState(user?.settings?.language || 'en')

  const themes: { value: string; icon: typeof Moon; label: string }[] = [
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  async function saveProfile() {
    setSavingProfile(true)
    try {
      const updated = await api.put<{ name: string; profile: { bio: string } }>('/auth/profile', profile)
      updateUser(updated as any)
      toast.success('Profile updated')
    } catch (e: any) { toast.error(e.message) } finally { setSavingProfile(false) }
  }

  async function savePassword() {
    if (password.newPassword !== password.confirmPassword) { toast.error('Passwords do not match'); return }
    if (password.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSavingPassword(true)
    try {
      await api.put('/auth/password', { currentPassword: password.currentPassword, newPassword: password.newPassword })
      toast.success('Password changed')
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e: any) { toast.error(e.message) } finally { setSavingPassword(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your preferences and account</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-violet-500/20">
            <Sun className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Theme</h3>
            <p className="text-xs text-gray-500">Choose your preferred appearance</p>
          </div>
        </div>
        <div className="flex gap-3">
          {themes.map(t => {
            const Icon = t.icon
            const isActive = theme === t.value
            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Language</h3>
            <p className="text-xs text-gray-500">Select your preferred language</p>
          </div>
        </div>
        <div className="flex gap-3">
          {[
            { value: 'en', label: 'English', flag: '🇬🇧' },
            { value: 'so', label: 'Somali', flag: '🇸🇴' },
          ].map(l => {
            const isActive = language === l.value
            return (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                <span>{l.flag}</span>
                {l.label}
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Profile</h3>
            <p className="text-xs text-gray-500">Update your personal information</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input label="Name" placeholder="Your name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Bio</label>
            <textarea
              placeholder="Tell us about yourself..."
              value={profile.bio}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 text-sm resize-none"
            />
          </div>
          <Button onClick={saveProfile} loading={savingProfile}><Save className="w-4 h-4" /> Save Profile</Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-red-500/20">
            <Lock className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Password</h3>
            <p className="text-xs text-gray-500">Change your account password</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input label="Current Password" type="password" placeholder="Enter current password" value={password.currentPassword} onChange={e => setPassword({ ...password, currentPassword: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="New Password" type="password" placeholder="Enter new password" value={password.newPassword} onChange={e => setPassword({ ...password, newPassword: e.target.value })} />
            <Input label="Confirm Password" type="password" placeholder="Confirm new password" value={password.confirmPassword} onChange={e => setPassword({ ...password, confirmPassword: e.target.value })} />
          </div>
          <Button onClick={savePassword} loading={savingPassword}><Save className="w-4 h-4" /> Change Password</Button>
        </div>
      </Card>
    </motion.div>
  )
}
