import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
  onClick?: () => void
}

export function Card({ className, children, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl card-gradient transition-all duration-300',
        hover && 'cursor-pointer hover:bg-white/[0.08] hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 py-4 border-b border-white/5', className)}>{children}</div>
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}

export function StatCard({ icon, label, value, sub, trend, color }: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down'
  color?: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg bg-white/5" style={{ color: color || '#8b5cf6' }}>
          {icon}
        </div>
        {trend && (
          <span className={cn('text-xs font-medium', trend === 'up' ? 'text-emerald-400' : 'text-red-400')}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </Card>
  )
}
