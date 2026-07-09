import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Research as ResearchType } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen, ExternalLink, Trash2 } from 'lucide-react'
import { getStatusColor } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Research() {
  const [research, setResearch] = useState<ResearchType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'paper', description: '', authors: '', journal: '', doi: '', year: new Date().getFullYear(), status: 'published' })

  useEffect(() => { load() }, [])

  function load() { api.get<ResearchType[]>('/research').then(setResearch) }

  async function create() {
    try { await api.post('/research', form); toast.success('Research entry created'); setShowForm(false); setForm({ title: '', type: 'paper', description: '', authors: '', journal: '', doi: '', year: new Date().getFullYear(), status: 'published' }); load() } catch (e: any) { toast.error(e.message) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this research entry?')) return
    await api.delete(`/research/${id}`)
    toast.success('Research deleted')
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Research</h1>
          <p className="text-sm text-gray-400 mt-1">{research.length} publications</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Research</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input placeholder="Research title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <select className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="paper">Paper</option>
              <option value="conference">Conference</option>
              <option value="thesis">Thesis</option>
              <option value="book">Book</option>
              <option value="article">Article</option>
              <option value="poster">Poster</option>
            </select>
            <Input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="Authors" value={form.authors} onChange={e => setForm({ ...form, authors: e.target.value })} />
            <Input placeholder="Journal / Venue" value={form.journal} onChange={e => setForm({ ...form, journal: e.target.value })} />
            <Input placeholder="DOI" value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })} />
            <Input type="number" placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} />
            <select className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="published">Published</option>
              <option value="in-progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="accepted">Accepted</option>
            </select>
            <Button onClick={create}>Create</Button>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {research.map(r => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-white truncate">{r.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={getStatusColor(r.status)}>{r.status}</Badge>
                  <Badge className="bg-white/5 text-gray-300 border-white/10">{r.type}</Badge>
                  {r.year && <Badge className="bg-white/5 text-gray-300 border-white/10">{r.year}</Badge>}
                </div>
              </div>
            </div>
            {r.description && <p className="text-sm text-gray-400 mb-2 line-clamp-2">{r.description}</p>}
            {r.authors && <p className="text-xs text-gray-500 mb-1">Authors: {r.authors}</p>}
            {r.journal && <p className="text-xs text-gray-500 mb-1">Journal: {r.journal}</p>}
            {r.doi && (
              <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> DOI: {r.doi}
              </a>
            )}
            <Button variant="danger" size="sm" className="mt-3" onClick={() => remove(r.id)}><Trash2 className="w-3 h-3" /> Delete</Button>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
