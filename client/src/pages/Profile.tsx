import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { User, Mail, Phone, Building, GraduationCap, BookOpen, Calendar, Camera, Save } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Profile() {
  const { user, updateUser } = useAuth()
  const avatarRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.profile?.bio || '',
    phone: user?.profile?.phone || '',
    department: user?.profile?.department || '',
    faculty: user?.profile?.faculty || '',
    studentId: user?.profile?.studentId || '',
    year: user?.profile?.year?.toString() || '',
  })

  async function saveProfile() {
    setSaving(true)
    try {
      const updated = await api.put<any>('/auth/profile', form)
      updateUser(updated as any)
      toast.success('Profile updated')
    } catch (e: any) { toast.error(e.message) } finally { setSaving(false) }
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const updated = await api.post<any>('/auth/avatar', fd)
      updateUser(updated as any)
      toast.success('Avatar updated')
    } catch (e: any) { toast.error(e.message) } finally { setUploadingAvatar(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your personal information</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Avatar</h3>
            <p className="text-xs text-gray-500">Upload your profile picture</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || '?'
              )}
            </div>
            <button
              onClick={() => avatarRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
          </div>
          <div className="text-sm text-gray-400">
            <p className="font-medium text-white">{user?.name}</p>
            <p className="flex items-center gap-1 mt-1"><Mail className="w-3 h-3" /> {user?.email}</p>
            {user?.createdAt && <p className="mt-1">Joined {formatDate(user.createdAt)}</p>}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Personal Info</h3>
            <p className="text-xs text-gray-500">Update your name and bio</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input label="Name" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Bio</label>
            <textarea
              placeholder="Tell us about yourself..."
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 text-sm resize-none"
            />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <GraduationCap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Academic Info</h3>
            <p className="text-xs text-gray-500">Your academic details</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Student ID" placeholder="e.g. STU-001" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} />
          <Input label="Year" placeholder="e.g. 3" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
          <Input label="Department" placeholder="e.g. Computer Science" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
          <Input label="Faculty" placeholder="e.g. Engineering" value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })} />
          <Input label="Phone" placeholder="e.g. +252 61 234 5678" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="sm:col-span-2" />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveProfile} loading={saving} size="lg"><Save className="w-4 h-4" /> Save Changes</Button>
      </div>
    </motion.div>
  )
}
