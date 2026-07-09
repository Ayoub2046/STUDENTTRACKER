import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Trophy, Star, Zap } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlockedAt: string
}

export function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => { load() }, [])

  function load() { api.get<Achievement[]>('/achievements').then(setAchievements) }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Achievements</h1>
          <p className="text-sm text-gray-400 mt-1">{achievements.length} unlocked</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">Level {user?.level || 0}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-400 font-medium">{user?.xpPoints || 0} XP</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(a => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{a.name}</h3>
                <p className="text-xs text-gray-400">{a.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-violet-400">
                <Zap className="w-3 h-3" /> +{a.xpReward} XP
              </span>
              {a.unlockedAt && (
                <span className="text-gray-500">{formatDate(a.unlockedAt)}</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {achievements.length === 0 && (
        <Card className="p-8 text-center">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No achievements yet. Keep learning!</p>
        </Card>
      )}
    </motion.div>
  )
}
