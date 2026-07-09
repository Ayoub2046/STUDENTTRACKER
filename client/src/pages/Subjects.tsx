import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Subject, Semester, Teacher } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen, Users, GraduationCap, ChevronRight } from 'lucide-react'
import { getStatusColor } from '@/lib/utils'
import toast from 'react-hot-toast'

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedSemester, setSelectedSemester] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', credits: 3, teacherId: '', color: '#6366f1' })

  useEffect(() => {
    api.get<Semester[]>('/semesters').then(sems => {
      setSemesters(sems)
      const active = sems.find(s => s.status === 'active')
      if (active) setSelectedSemester(active.id)
    })
    api.get<Teacher[]>('/teachers').then(setTeachers)
  }, [])

  useEffect(() => { if (selectedSemester) load() }, [selectedSemester])

  function load() {
    api.get<Subject[]>('/subjects').then(all => {
      setSubjects(all.filter(s => s.semesterId === selectedSemester))
    })
  }

  const activeSemester = semesters.find(s => s.id === selectedSemester)

  async function create() {
    if (!selectedSemester) { toast.error('Select a semester first'); return }
    try {
      await api.post('/subjects', { ...form, semesterId: selectedSemester })
      toast.success('Subject added')
      setShowForm(false)
      setForm({ name: '', code: '', credits: 3, teacherId: '', color: '#6366f1' })
      load()
      semestersReload()
    } catch (e: any) { toast.error(e.message) }
  }

  async function semestersReload() {
    api.get<Semester[]>('/semesters').then(setSemesters)
  }

  async function activateSemester(id: string) {
    await api.put(`/semesters/${id}`, { status: 'active' })
    semestersReload()
    toast.success('Semester activated')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subjects</h1>
          <p className="text-sm text-gray-400 mt-1">Manage subjects per semester</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <Select
          options={semesters.map(s => ({ value: s.id, label: `${s.name} (${s.status})` }))}
          placeholder="Select semester..."
          value={selectedSemester}
          onChange={e => setSelectedSemester(e.target.value)}
        />
        {activeSemester && (
          <>
            <div className="p-3 rounded-lg bg-violet-500/10 text-center border border-violet-500/20">
              <p className="text-lg font-bold text-violet-400">{(activeSemester as any)._count?.subjects || subjects.length}</p>
              <p className="text-xs text-gray-400">Subjects</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-center border border-emerald-500/20">
              <p className="text-lg font-bold text-emerald-400">{activeSemester.gpa.toFixed(2)}</p>
              <p className="text-xs text-gray-400">GPA</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-center border border-amber-500/20">
              <p className="text-lg font-bold text-amber-400">{activeSemester.credits}</p>
              <p className="text-xs text-gray-400">Credits</p>
            </div>
          </>
        )}
      </div>

      {selectedSemester && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">{activeSemester?.name}</h2>
              <Badge className={getStatusColor(activeSemester?.status || 'planned')}>{activeSemester?.status}</Badge>
            </div>
            <div className="flex gap-2">
              {activeSemester?.status === 'planned' && (
                <Button size="sm" variant="ghost" onClick={() => activateSemester(selectedSemester)}>
                  Activate Semester
                </Button>
              )}
              <Button size="sm" onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4" /> Add Subject
              </Button>
            </div>
          </div>

          {showForm && (
            <Card className="p-5">
              <div className="grid sm:grid-cols-3 gap-4">
                <Input placeholder="Subject name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Code (e.g. CS101)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                <Input type="number" placeholder="Credits" value={form.credits} onChange={e => setForm({ ...form, credits: parseInt(e.target.value) })} />
                <Select options={teachers.map(t => ({ value: t.id, label: t.name }))} placeholder="Teacher (optional)" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })} />
                <Input placeholder="Color (optional)" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
                <Button onClick={create}>Save Subject</Button>
              </div>
            </Card>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.length === 0 && !showForm && (
              <Card className="p-8 col-span-full text-center">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No subjects in this semester yet</p>
                <Button variant="secondary" className="mt-4" onClick={() => setShowForm(true)}>Add your first subject</Button>
              </Card>
            )}
            {subjects.map(sub => (
              <Card key={sub.id} className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: sub.color + '20', color: sub.color }}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{sub.name}</h3>
                    <p className="text-xs text-gray-500">{sub.code || 'No code'} • {sub.credits} cr</p>
                  </div>
                  <Badge className={getStatusColor(sub.status)}>{sub.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-violet-400">{sub.average.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Avg</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-emerald-400">{sub.gpaPoint.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">GPA</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-amber-400">{sub.grade || '-'}</p>
                    <p className="text-xs text-gray-500">Grade</p>
                  </div>
                </div>
                {sub.teacher && <p className="text-xs text-gray-400 flex items-center gap-1"><Users className="w-3 h-3" /> {sub.teacher.name}</p>}
              </Card>
            ))}
          </div>
        </>
      )}

      {!selectedSemester && (
        <Card className="p-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white font-medium mb-2">Select a Semester</h3>
          <p className="text-gray-400">Choose a semester from the dropdown above to view and manage its subjects</p>
        </Card>
      )}
    </motion.div>
  )
}
