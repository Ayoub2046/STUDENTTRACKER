import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Skill } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, TrendingUp, Target, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const categories = ['Programming', 'AI', 'ML', 'Data Science', 'Web Development', 'Database', 'DevOps', 'Design', 'Soft Skills', 'Other']

export function Skills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Programming', currentLevel: 50, targetLevel: 100 })

  useEffect(() => { load() }, [])

  function load() { api.get<Skill[]>('/skills').then(setSkills) }

  async function create() {
    try { await api.post('/skills', form); toast.success('Skill added'); setShowForm(false); setForm({ name: '', category: 'Programming', currentLevel: 50, targetLevel: 100 }); load() } catch (e: any) { toast.error(e.message) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this skill?')) return
    await api.delete(`/skills/${id}`)
    toast.success('Skill deleted')
    load()
  }

  const grouped = categories.map(cat => ({
    category: cat,
    items: skills.filter(s => s.category === cat)
  })).filter(g => g.items.length > 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Skills & Progress</h1>
          <p className="text-sm text-gray-400 mt-1">{skills.length} skills tracked</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Skill</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="grid sm:grid-cols-4 gap-4">
            <Input placeholder="Skill name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <select className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Current: {form.currentLevel}%</label>
              <input type="range" min={0} max={100} value={form.currentLevel} onChange={e => setForm({ ...form, currentLevel: parseInt(e.target.value) })} className="w-full accent-violet-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Target: {form.targetLevel}%</label>
              <input type="range" min={0} max={100} value={form.targetLevel} onChange={e => setForm({ ...form, targetLevel: parseInt(e.target.value) })} className="w-full accent-emerald-500" />
            </div>
            <Button onClick={create}>Save Skill</Button>
          </div>
        </Card>
      )}

      {grouped.map(group => (
        <div key={group.category}>
          <h2 className="text-lg font-semibold text-white mb-3">{group.category}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.items.map(s => {
              const progress = Math.min(Math.round((s.currentLevel / s.targetLevel) * 100), 100)
              return (
                <Card key={s.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white">{s.name}</h3>
                    <Button variant="danger" size="sm" onClick={() => remove(s.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {s.currentLevel}%</span>
                        <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {s.targetLevel}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Progress</span>
                      <span className={progress >= 100 ? 'text-emerald-400 font-medium' : 'text-violet-400 font-medium'}>{progress}%</span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      {grouped.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-sm text-gray-500">No skills added yet. Start tracking your progress!</p>
        </Card>
      )}
    </motion.div>
  )
}
