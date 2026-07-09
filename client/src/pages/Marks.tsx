import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Subject, Assessment } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Calculator } from 'lucide-react'
import { assessmentTypes } from '@/lib/utils'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function Marks() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subjectId: '', type: 'Quiz 1', maxMarks: '100', obtainedMarks: '0', comments: '' })

  useEffect(() => { api.get<Subject[]>('/subjects').then(setSubjects) }, [])

  useEffect(() => {
    if (selectedSubject) { api.get<Assessment[]>(`/assessments/${selectedSubject}`).then(setAssessments) }
  }, [selectedSubject])

  async function create() {
    try { await api.post('/assessments', { ...form, subjectId: selectedSubject }); toast.success('Assessment added'); setShowForm(false); setForm({ subjectId: '', type: 'Quiz 1', maxMarks: '100', obtainedMarks: '0', comments: '' }); const a = await api.get<Assessment[]>(`/assessments/${selectedSubject}`); setAssessments(a) } catch (e: any) { toast.error(e.message) }
  }

  const subjectData = subjects.find(s => s.id === selectedSubject)
  const chartData = assessments.map(a => ({ name: a.type, obtained: a.obtainedMarks, max: a.maxMarks }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marks & Assessments</h1>
          <p className="text-sm text-gray-400 mt-1">Track your performance across all assessments</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <Select options={subjects.map(s => ({ value: s.id, label: s.name }))} placeholder="Select subject" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} />
        {subjectData && (
          <>
            <div className="p-3 rounded-lg bg-white/5 text-center"><p className="text-xl font-bold text-violet-400">{subjectData.average.toFixed(1)}%</p><p className="text-xs text-gray-500">Average</p></div>
            <div className="p-3 rounded-lg bg-white/5 text-center"><p className="text-xl font-bold text-emerald-400">{subjectData.gpaPoint.toFixed(2)}</p><p className="text-xs text-gray-500">GPA</p></div>
            <div className="p-3 rounded-lg bg-white/5 text-center"><p className="text-xl font-bold text-amber-400">{subjectData.grade || '-'}</p><p className="text-xs text-gray-500">Grade</p></div>
          </>
        )}
      </div>

      {selectedSubject && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Assessment</Button>
          </div>

          {showForm && (
            <Card className="p-5">
              <div className="grid sm:grid-cols-3 gap-4">
                <Select options={assessmentTypes.map(t => ({ value: t, label: t }))} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
                <Input type="number" placeholder="Max marks" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} />
                <Input type="number" placeholder="Obtained marks" value={form.obtainedMarks} onChange={e => setForm({ ...form, obtainedMarks: e.target.value })} />
                <Input placeholder="Comments (optional)" value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} />
                <Button onClick={create}>Save</Button>
              </div>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><h3 className="text-sm font-semibold text-white">Assessment Scores</h3></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="obtained" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="max" fill="#374151" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><h3 className="text-sm font-semibold text-white">Assessment List</h3></CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {assessments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="text-sm text-gray-200">{a.type}</p>
                      <p className="text-xs text-gray-500">{a.percentage.toFixed(1)}% • {a.grade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{a.obtainedMarks}/{a.maxMarks}</p>
                    </div>
                  </div>
                ))}
                {assessments.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No assessments yet</p>}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  )
}
