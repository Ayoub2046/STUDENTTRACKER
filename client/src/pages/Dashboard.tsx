import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { DashboardData } from '@/types'
import { StatCard, Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, GraduationCap, Target, Award, Clock, CalendarCheck, Brain, Zap, TrendingUp, Activity, ChevronRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDate, getStatusColor } from '@/lib/utils'

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<DashboardData>('/dashboard').then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-28 rounded-xl bg-white/5" />)}
        </div>
        <div className="h-80 rounded-xl bg-white/5" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Your academic overview at a glance</p>
        </div>
        {data?.currentSemester && (
          <Badge variant="success">{data.currentSemester.name} • Active</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<GraduationCap className="w-5 h-5" />} label="Current GPA" value={data?.overallGPA.toFixed(2) || '0.00'} color="#8b5cf6" />
        <StatCard icon={<Target className="w-5 h-5" />} label="CGPA" value={data?.cgpa.toFixed(2) || '0.00'} color="#10b981" />
        <StatCard icon={<Award className="w-5 h-5" />} label="Overall Average" value={`${data?.overallAverage.toFixed(1) || '0'}%`} color="#f59e0b" />
        <StatCard icon={<BookOpen className="w-5 h-5" />} label="Completed Credits" value={data?.completedCredits || 0} color="#3b82f6" />
        <StatCard icon={<Activity className="w-5 h-5" />} label="Subjects" value={data?.subjects || 0} color="#ec4899" />
        <StatCard icon={<CalendarCheck className="w-5 h-5" />} label="Assignments" value={data?.pendingAssignments || 0} sub="pending" color="#8b5cf6" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Attendance" value={`${data?.attendancePercent.toFixed(1) || '0'}%`} color="#10b981" />
        <StatCard icon={<Brain className="w-5 h-5" />} label="Skill Progress" value={`${data?.skillProgress.toFixed(0) || '0'}%`} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Zap className="w-5 h-5" />} label="Current Streak" value={`${data?.currentStreak || 0} days`} color="#8b5cf6" />
        <StatCard icon={<Target className="w-5 h-5" />} label="Today's Tasks" value={data?.todayTasks || 0} color="#10b981" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Weekly Hours" value={`${data?.weeklyHours || 0}h`} color="#3b82f6" />
        <StatCard icon={<Activity className="w-5 h-5" />} label="Completions" value={data?.completions || 0} color="#ec4899" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Monthly Progress</h3>
              <span className="text-xs text-gray-500">Study hours</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyProgress || []}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fill="url(#colorHours)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.recentActivity.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
            {data?.recentActivity.map((activity, i) => (
              <div key={activity.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                </div>
                {activity.status && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>{activity.status}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
