import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Goal } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Target, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { getStatusColor, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const categories = ['daily', 'weekly', 'monthly', 'yearly', 'life']

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'monthly', status: 'pending', targetDate: '' })

  useEffect(() => { load() }, [])

  function load() { api.get<Goal[]>('/goals').then(setGoals) }

  async function create() {
    try { await api.post('/goals', form); toast.success('Goal created'); setShowForm(false); setForm({ title: '', category: 'monthly', status: 'pending', targetDate: '' }); load() } catch (e: any) { toast.error(e.message) }
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/goals/${id}`, { status }); load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this goal?')) return
    await api.delete(`/goals/${id}`)
    toast.success('Goal deleted')
    load()
  }

  const grouped = categories.map(cat => ({
    category: cat,
    items: goals.filter(g => g.category === cat)
  }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals</h1>
          <p className="text-sm text-gray-400 mt-1">{goals.filter(g => g.status === 'completed').length}/{goals.length} completed</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Goal</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="grid sm:grid-cols-4 gap-4">
            <Input placeholder="Goal title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <select className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 text-sm capitalize" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <Input type="date" placeholder="Target date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
            <Button onClick={create}>Create Goal</Button>
          </div>
        </Card>
      )}

      {grouped.map(group => (
        <div key={group.category}>
          <h2 className="text-lg font-semibold text-white capitalize mb-3">{group.category} Goals</h2>
          <Card>
            <div className="divide-y divide-white/5">
              {group.items.map(g => {
                const isCompleted = g.status === 'completed'
                return (
                  <div key={g.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-all">
                    <button onClick={() => updateStatus(g.id, isCompleted ? 'pending' : 'completed')} className="shrink-0">
                      {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-gray-500 hover:text-gray-300 transition-colors" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-medium text-sm ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>{g.title}</span>
                        <Badge className={getStatusColor(g.status)}>{g.status}</Badge>
                      </div>
                      {g.targetDate && <p className="text-xs text-gray-500">Target: {formatDate(g.targetDate)}</p>}
                    </div>
                    <Button variant="danger" size="sm" onClick={() => remove(g.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                )
              })}
              {group.items.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6 capitalize">No {group.category} goals</p>
              )}
            </div>
          </Card>
        </div>
      ))}
    </motion.div>
  )
}
