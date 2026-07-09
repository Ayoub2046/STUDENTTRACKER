import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Teacher } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Mail, Phone, MapPin, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', department: '', email: '', phone: '', office: '' })

  useEffect(() => { load() }, [])

  function load() { api.get<Teacher[]>('/teachers').then(setTeachers) }

  async function create() {
    try { await api.post('/teachers', form); toast.success('Teacher added'); setShowForm(false); setForm({ name: '', department: '', email: '', phone: '', office: '' }); load() } catch (e: any) { toast.error(e.message) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Teachers</h1>
          <p className="text-sm text-gray-400 mt-1">{teachers.length} teachers</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Teacher</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input placeholder="Teacher name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Office" value={form.office} onChange={e => setForm({ ...form, office: e.target.value })} />
            <Button onClick={create}>Save Teacher</Button>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map(t => (
          <Card key={t.id} className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="font-semibold text-white">{t.name}</h3>
                <p className="text-xs text-gray-400">{t.department || 'No department'}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-gray-400">
              {t.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {t.email}</p>}
              {t.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {t.phone}</p>}
              {t.office && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {t.office}</p>}
              {t._count && <p className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> {t._count.subjects} subjects</p>}
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
