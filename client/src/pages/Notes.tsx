import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Note, Subject } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Pin, PinOff, Trash2, StickyNote, Tag } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', tags: '', subjectId: '' })

  useEffect(() => { load(); api.get<Subject[]>('/subjects').then(setSubjects) }, [])

  function load() { api.get<Note[]>('/notes').then(setNotes) }

  async function create() {
    if (!form.title) { toast.error('Title is required'); return }
    try { await api.post('/notes', form); toast.success('Note created'); setShowForm(false); setForm({ title: '', content: '', tags: '', subjectId: '' }); load() } catch (e: any) { toast.error(e.message) }
  }

  async function togglePin(id: string, isPinned: boolean) {
    await api.put(`/notes/${id}`, { isPinned: !isPinned }); load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this note?')) return
    await api.delete(`/notes/${id}`)
    toast.success('Note deleted')
    load()
  }

  const sorted = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notes</h1>
          <p className="text-sm text-gray-400 mt-1">{notes.length} notes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Note</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="space-y-4">
            <Input placeholder="Note title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea
              placeholder="Content..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={5}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 text-sm resize-none"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
              <select className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 text-sm" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                <option value="">No subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <Button onClick={create}>Create Note</Button>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(note => (
          <Card key={note.id} className={cn('p-5', note.isPinned && 'border-violet-500/30')}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <StickyNote className="w-4 h-4 text-violet-400 shrink-0" />
                <h3 className="font-semibold text-white truncate">{note.title}</h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => togglePin(note.id, note.isPinned)} className="p-1 rounded hover:bg-white/5 transition-colors">
                  {note.isPinned ? <PinOff className="w-3.5 h-3.5 text-violet-400" /> : <Pin className="w-3.5 h-3.5 text-gray-500" />}
                </button>
                <button onClick={() => remove(note.id)} className="p-1 rounded hover:bg-white/5 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
            {note.content && (
              <p className="text-sm text-gray-400 line-clamp-3 mb-3 whitespace-pre-wrap">{note.content}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {note.tags?.split(',').filter(Boolean).map((tag, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {tag.trim()}
                </span>
              ))}
              {note.subject && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: note.subject.color + '20', color: note.subject.color }}>
                  {note.subject.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">{formatDate(note.createdAt)}</p>
          </Card>
        ))}
      </div>

      {notes.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-12">No notes yet. Start taking notes!</p>
      )}
    </motion.div>
  )
}
