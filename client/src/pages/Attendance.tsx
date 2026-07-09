import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Subject, Attendance as AttendanceType, AttendanceStats } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getStatusColor, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6b7280']

export function Attendance() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [records, setRecords] = useState<AttendanceType[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)

  useEffect(() => { api.get<Subject[]>('/subjects').then(setSubjects) }, [])

  useEffect(() => {
    if (selectedSubject) api.get<{ records: AttendanceType[]; stats: AttendanceStats }>(`/attendance/${selectedSubject}`).then(d => { setRecords(d.records); setStats(d.stats) })
  }, [selectedSubject])

  async function markAttendance(status: string) {
    try { await api.post('/attendance', { subjectId: selectedSubject, status }); toast.success('Attendance marked'); const d = await api.get<{ records: AttendanceType[]; stats: AttendanceStats }>(`/attendance/${selectedSubject}`); setRecords(d.records); setStats(d.stats) } catch (e: any) { toast.error(e.message) }
  }

  const pieData = stats ? [
    { name: 'Present', value: stats.present }, { name: 'Absent', value: stats.absent },
    { name: 'Late', value: stats.late }, { name: 'Excused', value: stats.excused },
  ].filter(d => d.value > 0) : []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Attendance</h1><p className="text-sm text-gray-400 mt-1">Track your class attendance</p></div>
      </div>

      <Select options={subjects.map(s => ({ value: s.id, label: s.name }))} placeholder="Select subject" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} />

      {selectedSubject && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-white/5 text-center"><p className="text-2xl font-bold text-emerald-400">{stats.present}</p><p className="text-xs text-gray-500">Present</p></div>
            <div className="p-4 rounded-lg bg-white/5 text-center"><p className="text-2xl font-bold text-red-400">{stats.absent}</p><p className="text-xs text-gray-500">Absent</p></div>
            <div className="p-4 rounded-lg bg-white/5 text-center"><p className="text-2xl font-bold text-amber-400">{stats.late}</p><p className="text-xs text-gray-500">Late</p></div>
            <div className="p-4 rounded-lg bg-white/5 text-center"><p className="text-2xl font-bold text-gray-400">{stats.excused}</p><p className="text-xs text-gray-500">Excused</p></div>
            <div className="p-4 rounded-lg bg-white/5 text-center"><p className="text-2xl font-bold text-violet-400">{stats.percentage.toFixed(1)}%</p><p className="text-xs text-gray-500">Rate</p></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card><CardHeader><h3 className="text-sm font-semibold text-white">Mark Today</h3></CardHeader><CardContent>
              <div className="flex gap-3">
                <Button variant="primary" onClick={() => markAttendance('present')} className="flex-1 bg-emerald-600/80 hover:bg-emerald-600">Present</Button>
                <Button variant="danger" onClick={() => markAttendance('absent')} className="flex-1">Absent</Button>
                <Button variant="secondary" onClick={() => markAttendance('late')} className="flex-1">Late</Button>
                <Button variant="ghost" onClick={() => markAttendance('excused')} className="flex-1">Excused</Button>
              </div>
            </CardContent></Card>

            <Card><CardHeader><h3 className="text-sm font-semibold text-white">Distribution</h3></CardHeader><CardContent>
              <div className="h-48"><ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie></PieChart>
              </ResponsiveContainer></div>
            </CardContent></Card>
          </div>

          <Card><CardHeader><h3 className="text-sm font-semibold text-white">History</h3></CardHeader><CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {records.map(r => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span className="text-sm text-gray-300">{formatDate(r.date)}</span>
                <Badge className={getStatusColor(r.status)}>{r.status}</Badge>
              </div>
            ))}
            {records.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No records</p>}
          </CardContent></Card>
        </>
      )}
    </motion.div>
  )
}
