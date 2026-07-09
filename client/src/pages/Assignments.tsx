import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Assignment } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, ExternalLink } from 'lucide-react'
import { getStatusColor, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', status: 'pending', subjectId: '' })

  useEffect(() => { load() }, [])

  function load() { api.get<Assignment[]>('/assignments').then(setAssignments) }

  async function create() {
    try { await api.post('/assignments', form); toast.success('Assignment created'); setShowForm(false); load() } catch (e: any) { toast.error(e.message) }
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/assignments/${id}`, { status }); load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Assignments</h1><p className="text-sm text-gray-400 mt-1">{assignments.length} total</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Assignment</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <Input placeholder="Assignment title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            <Select options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} />
            <Select options={[{ value: 'pending', label: 'Pending' }, { value: 'in-progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }]} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
            <Button onClick={create}>Create</Button>
          </div>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {assignments.map(a => (
            <div key={a.id} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-medium text-white text-sm">{a.title}</h3>
                  <Badge className={getStatusColor(a.priority)}>{a.priority}</Badge>
                  <Badge className={getStatusColor(a.status)}>{a.status}</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {a.subject?.name && `${a.subject.name} • `}
                  {a.dueDate && `Due ${formatDate(a.dueDate)}`}
                </p>
              </div>
              <div className="flex gap-2">
                {a.status !== 'completed' && (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, 'completed')}>Complete</Button>
                )}
              </div>
            </div>
          ))}
          {assignments.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No assignments</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}
