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
  blue:    'bg-blue-100    text-blue-700    dark:bg-blue-950/40    dark:text-blue-400',
  amber:   'bg-amber-100   text-amber-700   dark:bg-amber-950/40   dark:text-amber-400',
  green:   'bg-green-100   text-green-700   dark:bg-green-950/40   dark:text-green-400',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  purple:  'bg-purple-100  text-purple-700  dark:bg-purple-950/40  dark:text-purple-400',
  red:     'bg-red-100     text-red-700     dark:bg-red-950/40     dark:text-red-400',
  slate:   'bg-slate-200   text-slate-700   dark:bg-slate-800/50   dark:text-slate-400',
}

type StatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  variant: StatCardVariant
}

export function StatCard({ label, value, icon: Icon, variant }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className={cn('mb-3 flex size-9 items-center justify-center rounded-lg', variantClasses[variant])}>
        <Icon className="size-4" />
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
