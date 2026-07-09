import React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  placeholder?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, placeholder, options, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-gray-400">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50',
          'transition-all duration-200 text-sm appearance-none cursor-pointer',
          !props.value && 'text-gray-500',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      >
        {placeholder && <option value="" disabled className="bg-gray-900 text-gray-500">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
