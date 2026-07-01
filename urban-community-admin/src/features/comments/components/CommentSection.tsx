import { useState } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Send, Trash2, MessageSquare, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { CommentDto } from '@/features/comments/api/commentsApi'
import { useAuthStore } from '@/stores/auth.store'

type CommentSectionProps = {
  comments: CommentDto[]
  isLoading: boolean
  isError: boolean
  currentUserId?: string
  onCreateComment: (content: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
  isCreating: boolean
  placeholder?: string
}

export function CommentSection({
  comments,
  isLoading,
  isError,
  currentUserId,
  onCreateComment,
  onDeleteComment,
  isCreating,
  placeholder = 'Yorumunuzu yazın...',
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const user = useAuthStore((s) => s.user)
  const resolvedUserId = currentUserId ?? user?.id ?? ''

  const handleSubmit = async () => {
    const trimmed = newComment.trim()
    if (!trimmed) return
    try {
      await onCreateComment(trimmed)
      setNewComment('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Yorum gönderilemedi')
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <MessageSquare className="size-4" />
        Yorumlar ({comments.length})
      </h4>

      <div className="flex gap-2">
        <Textarea
          placeholder={placeholder}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[60px] text-sm resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <Button
          size="icon"
          className="self-end shrink-0"
          onClick={handleSubmit}
          disabled={!newComment.trim() || isCreating}
        >
          {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive text-center py-4">Yorumlar yüklenemedi.</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Henüz yorum yapılmamış.</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 rounded-lg border p-3">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {(comment.authorName ?? '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{comment.authorName}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.updatedAt ?? comment.createdAt), 'dd MMM HH:mm', { locale: tr })}
                    </span>
                    {(resolvedUserId === comment.userId) && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
