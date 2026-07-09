import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { CalendarEvent } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar as CalendarIcon, Trash2, Bell, Clock, ChevronLeft, ChevronRight, List, Grid } from 'lucide-react'
import { formatDate, formatTime, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const categories = ['exam', 'assignment', 'study', 'general', 'meeting', 'personal']
const categoryColors: Record<string, string> = {
  exam: '#ef4444', assignment: '#f59e0b', study: '#8b5cf6',
  general: '#3b82f6', meeting: '#10b981', personal: '#ec4899'
}

export function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '',
    color: '#8b5cf6', category: 'general', allDay: false, createReminder: false
  })

  useEffect(() => { load() }, [])

  function load() { api.get<CalendarEvent[]>('/events').then(setEvents) }

  async function create() {
    if (!form.title || !form.startDate) { toast.error('Title and start date are required'); return }
    try {
      const payload = { title: form.title, startDate: form.startDate, endDate: form.endDate || null, color: form.color, category: form.category, allDay: form.allDay }
      const ev = await api.post<CalendarEvent>('/events', payload)
      if (form.createReminder) {
        await api.post('/reminders', {
          title: `Reminder: ${form.title}`,
          message: `${form.category}: ${form.title}`,
          type: form.category,
          dueDate: form.startDate
        })
      }
      toast.success('Event created')
      if (form.category === 'exam') toast('📚 Exam reminder set!', { icon: '🔔' })
      setShowForm(false)
      setForm({ title: '', description: '', startDate: '', endDate: '', color: '#8b5cf6', category: 'general', allDay: false, createReminder: false })
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this event?')) return
    await api.delete(`/events/${id}`)
    toast.success('Event deleted')
    load()
  }

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const monthEvents = events.filter(e => {
    const d = new Date(e.startDate)
    return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()
  })

  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    const key = ev.startDate?.split('T')[0] || 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(ev)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort()

  const upcoming = events.filter(e => new Date(e.startDate) >= new Date()).slice(0, 5)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-sm text-gray-400 mt-1">{events.length} events • {upcoming.length} upcoming</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            <button onClick={() => setView('list')} className={cn('px-3 py-1.5 text-xs transition-all', view === 'list' ? 'bg-violet-500/20 text-violet-400' : 'text-gray-400 hover:text-white')}><List className="w-3.5 h-3.5" /></button>
            <button onClick={() => setView('grid')} className={cn('px-3 py-1.5 text-xs transition-all', view === 'grid' ? 'bg-violet-500/20 text-violet-400' : 'text-gray-400 hover:text-white')}><Grid className="w-3.5 h-3.5" /></button>
          </div>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Event</Button>
        </div>
      </div>

      {showForm && (
        <Card className="p-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input placeholder="Event title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input type="date" placeholder="Start date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <Input type="date" placeholder="End date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            <div className="flex gap-2 items-center">
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer shrink-0" />
              <select className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100 text-sm capitalize" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input type="checkbox" checked={form.allDay} onChange={e => setForm({ ...form, allDay: e.target.checked })} className="rounded border-white/10 bg-white/5" />
              All day
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input type="checkbox" checked={form.createReminder} onChange={e => setForm({ ...form, createReminder: e.target.checked })} className="rounded border-white/10 bg-white/5" />
              <Bell className="w-3.5 h-3.5" /> Set reminder
            </label>
            <Button onClick={create}>Create Event</Button>
          </div>
        </Card>
      )}

      {view === 'grid' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 rounded hover:bg-white/5 text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
              <h3 className="text-sm font-semibold text-white">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 rounded hover:bg-white/5 text-gray-400"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs text-gray-500 py-2">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 bg-white/[0.01] rounded" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayEvents = monthEvents.filter(e => e.startDate?.startsWith(dateStr))
                const isToday = new Date().toISOString().startsWith(dateStr)
                return (
                  <div key={day} className={cn('h-20 p-1 rounded border border-white/5 overflow-hidden', isToday ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02]')}>
                    <span className={cn('text-xs', isToday ? 'text-violet-400 font-bold' : 'text-gray-400')}>{day}</span>
                    {dayEvents.slice(0, 2).map(ev => (
                      <div key={ev.id} className="text-[10px] truncate rounded px-1 mt-0.5 text-white" style={{ backgroundColor: (ev.color || categoryColors[ev.category] || '#8b5cf6') + '40' }}>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-[10px] text-gray-500 px-1">+{dayEvents.length - 2} more</div>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {sortedDates.map(date => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-violet-400" />
                {formatDate(date)}
                <span className="text-xs text-gray-500 font-normal">{grouped[date].length} event{grouped[date].length > 1 ? 's' : ''}</span>
              </h2>
              <div className="space-y-2">
                {grouped[date].map(ev => (
                  <Card key={ev.id} className="p-4 hover:bg-white/[0.08] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: ev.color || categoryColors[ev.category] || '#8b5cf6' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-white">{ev.title}</span>
                          <Badge className="capitalize text-[10px]" style={{ backgroundColor: (ev.color || categoryColors[ev.category] || '#8b5cf6') + '20', color: ev.color || categoryColors[ev.category] || '#8b5cf6', border: 'none' }}>
                            {ev.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(ev.startDate)}{ev.endDate ? ` - ${formatTime(ev.endDate)}` : ''}</span>
                          {ev.allDay && <span>All day</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => remove(ev.id)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {events.length === 0 && !showForm && (
        <Card className="p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No events yet. Add exams, assignments, and study sessions.</p>
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Your First Event</Button>
        </Card>
      )}
    </motion.div>
  )
}
