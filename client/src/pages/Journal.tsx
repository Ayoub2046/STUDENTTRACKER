import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Journal } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, BookHeart, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const moodEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  excited: '🤩',
  tired: '😴',
  grateful: '🙏',
  motivated: '💪',
  neutral: '😐',
}

const moods = ['happy', 'sad', 'anxious', 'excited', 'tired', 'grateful', 'motivated', 'neutral']
const categories = ['personal', 'academic', 'career', 'health', 'reflection', 'grateful']

export function JournalPage() {
  const [entries, setEntries] = useState<Journal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', mood: 'neutral', category: 'personal' })

  useEffect(() => { load() }, [])

  function load() { api.get<Journal[]>('/journal').then(setEntries) }

  async function create() {
    if (!form.title) { toast.error('Title is required'); return }
    try { await api.post('/journal', form); toast.success('Journal entry created'); setShowForm(false); setForm({ title: '', content: '', mood: 'neutral', category: 'personal' }); load() } catch (e: any) { toast.error(e.message) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return
    await api.delete(`/journal/${id}`)
    toast.success('Entry deleted')
    load()
  }

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Journal</h1>
          <p className="text-sm text-gray-400 mt-1">{entries.length} entries</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> New Entry</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="space-y-4">
            <Input placeholder="Entry title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea
              placeholder="Write your thoughts..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={6}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 text-sm resize-none"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <select className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 text-sm" value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })}>
                {moods.map(m => <option key={m} value={m}>{moodEmojis[m]} {m}</option>)}
              </select>
              <select className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 text-sm capitalize" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Button onClick={create}>Save Entry</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {sorted.map(entry => (
          <Card key={entry.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{moodEmojis[entry.mood || 'neutral'] || '😐'}</span>
                <div>
                  <h3 className="font-semibold text-white">{entry.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 capitalize">{entry.category}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(entry.id)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
            </div>
            {entry.content && (
              <p className="text-sm text-gray-400 whitespace-pre-wrap">{entry.content}</p>
            )}
          </Card>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <BookHeart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No journal entries yet. Start writing!</p>
        </div>
      )}
    </motion.div>
  )
}
