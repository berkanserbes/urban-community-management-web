import { Badge } from '@/components/ui/badge'
import type { ReportPriority, ReportStatus } from '@/types/api.types'

const statusLabelMap: Record<ReportStatus, string> = {
  PendingReview: 'Bekliyor',
  AiReview: 'AI İncelemede',
  Confirmed: 'Onaylandı',
  InProgress: 'İşlemde',
  Resolved: 'Çözüldü',
  Rejected: 'Reddedildi',
}

const statusVariantMap: Record<ReportStatus, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  PendingReview: 'secondary',
  AiReview: 'outline',
  Confirmed: 'default',
  InProgress: 'default',
  Resolved: 'secondary',
  Rejected: 'destructive',
}

const priorityLabelMap: Record<ReportPriority, string> = {
  Low: 'Düşük',
  Medium: 'Orta',
  High: 'Yüksek',
  Urgent: 'Acil',
}

const priorityClassMap: Record<ReportPriority, string> = {
  Low:    'bg-slate-100  text-slate-700  dark:bg-slate-800  dark:text-slate-300  border-transparent',
  Medium: 'bg-blue-100   text-blue-700   dark:bg-blue-950/50 dark:text-blue-300  border-transparent',
  High:   'bg-amber-100  text-amber-700  dark:bg-amber-950/50 dark:text-amber-300 border-transparent',
  Urgent: 'bg-red-100    text-red-700    dark:bg-red-950/50  dark:text-red-300   border-transparent',
}

export function ReportStatusBadge({ status }: { status: ReportStatus | null | undefined }) {
  if (!status || !statusLabelMap[status]) {
    return <Badge variant="secondary">-</Badge>
  }
  return <Badge variant={statusVariantMap[status]}>{statusLabelMap[status]}</Badge>
}

export function ReportPriorityBadge({ priority }: { priority: ReportPriority | null | undefined }) {
  if (!priority || !priorityLabelMap[priority]) {
    return <Badge className="bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 border-transparent">-</Badge>
  }
  return <Badge className={priorityClassMap[priority]}>{priorityLabelMap[priority]}</Badge>
}
