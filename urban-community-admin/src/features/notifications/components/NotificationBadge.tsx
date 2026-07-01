import { Bell, Loader2 } from 'lucide-react'
import { useUnreadCountQuery } from '@/features/notifications/hooks/useNotifications'
import { cn } from '@/lib/utils'

type Props = {
  onClick?: () => void
  className?: string
}

export function NotificationBadge({ onClick, className }: Props) {
  const { data: unreadCount, isLoading } = useUnreadCountQuery(true)

  return (
    <button
      onClick={onClick}
      className={cn('relative p-2 rounded-md hover:bg-accent transition-colors', className)}
      title="Bildirimler"
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <Bell className="size-4 text-muted-foreground" />
      )}
      {unreadCount != null && unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
