import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Semester } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, TrendingUp, Target, ChevronRight, GraduationCap } from 'lucide-react'
import { getStatusColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

export function Semesters() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  function load() { api.get<Semester[]>('/semesters').then(setSemesters) }

  async function toggleStatus(sem: Semester) {
    const newStatus = sem.status === 'active' ? 'completed' : sem.status === 'planned' ? 'active' : 'planned'
    try {
      await api.put(`/semesters/${sem.id}`, { status: newStatus })
      toast.success(`${sem.name} → ${newStatus}`)
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  const gpaChart = semesters.map(s => ({ name: s.name.split(' ').pop(), gpa: s.gpa }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Academic Journey</h1>
          <p className="text-sm text-gray-400 mt-1">Foundation → Semester 1 → Semester 8</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl card-gradient text-center">
          <p className="text-2xl font-bold text-violet-400">{semesters.length}</p>
          <p className="text-xs text-gray-400">Semesters</p>
        </div>
        <div className="p-4 rounded-xl card-gradient text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {semesters.filter(s => s.status === 'completed').length}
          </p>
          <p className="text-xs text-gray-400">Completed</p>
        </div>
        <div className="p-4 rounded-xl card-gradient text-center">
          <p className="text-2xl font-bold text-amber-400">
            {semesters.filter(s => s.status === 'active').length}
          </p>
          <p className="text-xs text-gray-400">Active</p>
        </div>
        <div className="p-4 rounded-xl card-gradient text-center">
          <p className="text-2xl font-bold text-blue-400">
            {semesters.reduce((s, sem) => s + sem.credits, 0)}
          </p>
          <p className="text-xs text-gray-400">Total Credits</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {semesters.map(sem => (
          <Card key={sem.id} className="p-5 hover:border-violet-500/30 transition-all cursor-pointer group" onClick={() => navigate('/subjects')}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  sem.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  sem.status === 'active' ? 'bg-violet-500/20 text-violet-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{sem.name}</h3>
                  <p className="text-xs text-gray-500">Year {sem.year} • {sem.credits} Credits</p>
                </div>
              </div>
              <Badge className={getStatusColor(sem.status)}>{sem.status}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-lg font-bold" style={{ color: sem.gpa >= 3 ? '#10b981' : sem.gpa >= 2 ? '#f59e0b' : '#ef4444' }}>
                  {sem.gpa.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">GPA</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-lg font-bold text-white">{sem.average.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Avg</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-lg font-bold text-white">{sem._count?.subjects || 0}</p>
                <p className="text-xs text-gray-500">Subjects</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {sem.status === 'planned' && (
                  <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); toggleStatus(sem) }}>Start</Button>
                )}
                {sem.status === 'active' && (
                  <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); toggleStatus(sem) }}>Complete</Button>
                )}
                {sem.status === 'completed' && (
                  <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); toggleStatus(sem) }}>Reopen</Button>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors" />
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
