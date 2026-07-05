import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatCardVariant =
  | 'blue'
  | 'amber'
  | 'green'
  | 'emerald'
  | 'purple'
  | 'red'
  | 'slate'

const variantClasses: Record<StatCardVariant, string> = {
  blue:    'bg-blue-100   text-blue-600   dark:bg-blue-950/40   dark:text-blue-400',
  amber:   'bg-amber-100  text-amber-600  dark:bg-amber-950/40  dark:text-amber-400',
  green:   'bg-green-100  text-green-600  dark:bg-green-950/40  dark:text-green-400',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  purple:  'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  red:     'bg-red-100    text-red-600    dark:bg-red-950/40    dark:text-red-400',
  slate:   'bg-slate-200  text-slate-600  dark:bg-slate-800/50  dark:text-slate-400',
}

type StatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  variant: StatCardVariant
  active?: boolean
  onClick?: () => void
}

export function StatCard({ label, value, icon: Icon, variant, active, onClick }: StatCardProps) {
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={cn(
        'rounded-xl border bg-card p-4 text-left transition-all',
        onClick && 'cursor-pointer hover:shadow-md',
        active && 'ring-2 ring-offset-2',
        active && variant === 'blue' && 'ring-blue-500',
        active && variant === 'amber' && 'ring-amber-500',
        active && variant === 'green' && 'ring-green-500',
        active && variant === 'emerald' && 'ring-emerald-500',
        active && variant === 'purple' && 'ring-purple-500',
        active && variant === 'red' && 'ring-red-500',
        active && variant === 'slate' && 'ring-slate-500',
      )}
    >
      <div className={cn('mb-3 flex size-10 items-center justify-center rounded-xl', variantClasses[variant])}>
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Component>
  )
}
