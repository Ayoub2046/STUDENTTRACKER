import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { CareerEntry } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Briefcase, Building2, Calendar, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const careerTypes = [
  { value: 'resume', label: 'Resume / CV' },
  { value: 'internship', label: 'Internship' },
  { value: 'job', label: 'Job' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'education', label: 'Education' },
  { value: 'certification', label: 'Certification' },
  { value: 'award', label: 'Award' },
]

export function Career() {
  const [entries, setEntries] = useState<CareerEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'internship', title: '', organization: '', startDate: '', endDate: '', isCurrent: false })

  useEffect(() => { load() }, [])

  function load() { api.get<CareerEntry[]>('/career').then(setEntries) }

  async function create() {
    try { await api.post('/career', form); toast.success('Career entry added'); setShowForm(false); setForm({ type: 'internship', title: '', organization: '', startDate: '', endDate: '', isCurrent: false }); load() } catch (e: any) { toast.error(e.message) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return
    await api.delete(`/career/${id}`)
    toast.success('Entry deleted')
    load()
  }

  const sorted = [...entries].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1
    if (!a.isCurrent && b.isCurrent) return 1
    return (b.startDate || '').localeCompare(a.startDate || '')
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Career Journey</h1>
          <p className="text-sm text-gray-400 mt-1">{entries.length} career entries</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Entry</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <select className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {careerTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Input placeholder="Title (e.g. Software Engineer)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Organization" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} />
            <Input type="date" placeholder="Start date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <Input type="date" placeholder="End date" value={form.endDate} disabled={form.isCurrent} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.isCurrent} onChange={e => setForm({ ...form, isCurrent: e.target.checked, endDate: e.target.checked ? '' : form.endDate })} className="accent-violet-500" />
              Currently active
            </label>
            <Button onClick={create}>Save Entry</Button>
          </div>
        </Card>
      )}

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />
        {sorted.map(e => (
          <div key={e.id} className="relative pl-12 pb-6 last:pb-0">
            <div className="absolute left-3.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-violet-500 bg-gray-900 z-10" />
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-violet-400 shrink-0" />
                    <h3 className="font-semibold text-white">{e.title}</h3>
                    {e.isCurrent && <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Current</Badge>}
                  </div>
                  {e.organization && (
                    <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-2">
                      <Building2 className="w-3.5 h-3.5" /> {e.organization}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <Badge className="bg-white/5 text-gray-300 border-white/10 capitalize">{e.type}</Badge>
                    {e.startDate && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(e.startDate)}</span>
                    )}
                    {e.endDate && (
                      <span>— {formatDate(e.endDate)}</span>
                    )}
                    {e.startDate && !e.endDate && !e.isCurrent && <span>— Present</span>}
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={() => remove(e.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </Card>
          </div>
        ))}
        {sorted.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-sm text-gray-500">No career entries yet. Start building your journey!</p>
          </Card>
        )}
      </div>
    </motion.div>
  )
}
