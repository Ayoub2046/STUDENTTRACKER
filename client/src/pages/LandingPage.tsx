import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Brain, BarChart3, Sparkles, Target, Shield, BookOpen, Award, ChevronRight, Star, Users, Globe, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'

const features = [
  { icon: Brain, title: 'AI Study Assistant', description: 'Get instant explanations, generate quizzes, flashcards, and study plans powered by AI.' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Track GPA trends, attendance patterns, study hours, and academic performance with beautiful charts.' },
  { icon: Target, title: 'Smart Goals', description: 'Set daily, weekly, and life goals. Track progress with streaks, XP points, and achievements.' },
  { icon: Shield, title: 'Secure Platform', description: 'Enterprise-grade security with JWT authentication, role-based access, and data encryption.' },
  { icon: Award, title: 'Gamification', description: 'Earn badges, level up, compete on leaderboards, and stay motivated with rewards.' },
  { icon: Globe, title: 'Multi-Language', description: 'Full support for English and Somali with Arabic coming soon.' },
]

const stats = [
  { value: '15+', label: 'Core Modules' },
  { value: '99.9%', label: 'Uptime' },
  { value: '50K+', label: 'Students' },
  { value: '4.9★', label: 'User Rating' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AYUB<span className="text-violet-400">OS</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-white/5 text-gray-400">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
            <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-6">
              <Sparkles className="w-4 h-4" /> The Ultimate Academic Operating System
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your Academic Journey,{' '}
              <span className="text-gradient">Supercharged</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The all-in-one platform for students to manage courses, track grades, build skills,
              and accelerate your career — powered by AI.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/register')}>
                Start Free <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                Watch Demo
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="mt-16">
            <div className="glass rounded-2xl p-2 max-w-4xl mx-auto">
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-violet-500/20 via-black/40 to-emerald-500/20 p-2">
                <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80" alt="Dashboard Preview" className="rounded-lg w-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-400">20+ integrated modules for complete academic management</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-6 hover:bg-white/[0.08] transition-all group">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-all">
                  <feature.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Academic Life?</h2>
            <p className="text-lg text-gray-400 mb-8">Join thousands of students already using AYUB OS to achieve more.</p>
            <Button size="lg" onClick={() => navigate('/register')}>
              Get Started Free <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>© 2026 AYUB Academic OS. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <button className="hover:text-gray-300 transition-all">Privacy</button>
            <button className="hover:text-gray-300 transition-all">Terms</button>
            <button className="hover:text-gray-300 transition-all">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
