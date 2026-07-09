import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Project } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Code, ExternalLink, Trash2 } from 'lucide-react'
import { getStatusColor, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', github: '', liveDemo: '', technologies: '', status: 'active' })

  useEffect(() => { load() }, [])

  function load() { api.get<Project[]>('/projects').then(setProjects) }

  async function create() {
    try { await api.post('/projects', form); toast.success('Project created'); setShowForm(false); setForm({ title: '', description: '', github: '', liveDemo: '', technologies: '', status: 'active' }); load() } catch (e: any) { toast.error(e.message) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this project?')) return
    await api.delete(`/projects/${id}`)
    toast.success('Project deleted')
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-gray-400 mt-1">{projects.length} projects</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Project</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input placeholder="Project title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="GitHub URL" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
            <Input placeholder="Live demo URL" value={form.liveDemo} onChange={e => setForm({ ...form, liveDemo: e.target.value })} />
            <Input placeholder="Technologies (comma separated)" value={form.technologies} onChange={e => setForm({ ...form, technologies: e.target.value })} />
            <select className="px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="archived">Archived</option>
            </select>
            <Button onClick={create}>Create Project</Button>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(p => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white truncate">{p.title}</h3>
                  <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                </div>
                <p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p>
              </div>
            </div>
            {p.description && <p className="text-sm text-gray-400 mb-3 line-clamp-2">{p.description}</p>}
            {p.technologies && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {p.technologies.split(',').map((t, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-gray-300">{t.trim()}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors"><Code className="w-4 h-4" /></a>}
              {p.liveDemo && <a href={p.liveDemo} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /></a>}
              <Button variant="danger" size="sm" className="ml-auto" onClick={() => remove(p.id)}><Trash2 className="w-3 h-3" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
