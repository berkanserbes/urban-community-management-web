import { useState } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Bell, BellOff, CheckCheck, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useMarkAsUnreadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} from '@/features/notifications/hooks/useNotifications'
import type { NotificationDto } from '@/types/api.types'

function NotificationIcon({ type }: { type?: string | null }) {
  switch (type) {
    case 'Report':
      return <Bell className="size-4 text-blue-500" />
    case 'Suggestion':
      return <Bell className="size-4 text-amber-500" />
    case 'Announcement':
      return <Bell className="size-4 text-emerald-500" />
    default:
      return <Bell className="size-4 text-muted-foreground" />
  }
}

type NotificationsPageProps = {
  navigateToRelated?: (notification: NotificationDto) => void
}

export function NotificationsPage({ navigateToRelated }: NotificationsPageProps) {
  const notificationsQuery = useNotificationsQuery()
  const markAsReadMutation = useMarkAsReadMutation()
  const markAllAsReadMutation = useMarkAllAsReadMutation()
  const markAsUnreadMutation = useMarkAsUnreadMutation()
  const deleteMutation = useDeleteNotificationMutation()
  const deleteAllMutation = useDeleteAllNotificationsMutation()
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)

  const notifications = notificationsQuery.data ?? []
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Okunamadı')
    }
  }

  const handleMarkAsUnread = async (id: string) => {
    try {
      await markAsUnreadMutation.mutateAsync(id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Güncellenemedi')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync()
      toast.success('Tüm bildirimler okundu olarak işaretlendi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'İşlem başarısız')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Silinemedi')
    }
  }

  const handleDeleteAll = async () => {
    try {
      await deleteAllMutation.mutateAsync()
      toast.success('Tüm bildirimler silindi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Silinemedi')
    } finally {
      setDeleteAllOpen(false)
    }
  }

  const handleClick = (notification: NotificationDto) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
    if (navigateToRelated && notification.relatedEntityId) {
      navigateToRelated(notification)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bildirimler"
        description="Sistem bildirimlerinizi görüntüleyin ve yönetin."
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="mr-2 size-4" />
                Tümünü Okundu İşaretle
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setDeleteAllOpen(true)}>
                <Trash2 className="mr-2 size-4" />
                Tümünü Sil
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            Bildirim Listesi
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">{unreadCount} okunmamış</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notificationsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : notificationsQuery.isError ? (
            <div className="py-12 text-center text-sm text-destructive">
              Bildirimler yüklenemedi.
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Henüz bildiriminiz bulunmuyor.
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 rounded-lg p-3 transition-colors cursor-pointer hover:bg-accent ${
                    !notification.isRead ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleClick(notification)}
                >
                  <div className="mt-1">
                    <NotificationIcon type={notification.relatedEntityType} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {format(new Date(notification.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {notification.isRead ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAsUnread(notification.id) }}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                        title="Okunmadı işaretle"
                      >
                        <BellOff className="size-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id) }}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                        title="Okundu işaretle"
                      >
                        <CheckCheck className="size-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(notification.id) }}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-destructive"
                      title="Sil"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tüm bildirimler silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Tüm bildirimleriniz kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAll}
            >
              {deleteAllMutation.isPending ? 'Siliniyor...' : 'Tümünü Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
