import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useState } from 'react'
import {
  ThumbsUp,
  ThumbsDown,
  Loader2,
  User,
  Clock,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SuggestionStatusBadge } from '@/features/suggestions/components/SuggestionsTable'
import { SuggestionEvaluationDialog } from '@/features/suggestions/components/SuggestionEvaluationDialog'
import { CommentSection } from '@/features/comments/components/CommentSection'
import {
  useSuggestionDetailQuery,
  useAllowedSuggestionTransitionsQuery,
  useVoteSummaryQuery,
  useSetVoteMutation,
  useRemoveVoteMutation,
} from '@/features/suggestions/hooks/useSuggestionDetail'
import {
  useSuggestionCommentsQuery,
  useCreateSuggestionCommentMutation,
  useDeleteSuggestionCommentMutation,
} from '@/features/comments/hooks/useComments'
import {
  useChangeSuggestionStatusMutation,
  useUpdateSuggestionOfficialResponseMutation,
} from '@/features/suggestions/hooks/useSuggestions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SuggestionStatus } from '@/types/api.types'

const STATUS_LABELS: Record<SuggestionStatus, string> = {
  Active: 'Aktif',
  Reviewing: 'İncelemede',
  Implementation: 'Uygulamada',
  Closed: 'Kapatıldı',
}

type Props = {
  suggestionId: string | null
  onOpenChange: (open: boolean) => void
}

export function SuggestionDetailSheet({ suggestionId, onOpenChange }: Props) {
  const detailQuery = useSuggestionDetailQuery(suggestionId)
  const transitionsQuery = useAllowedSuggestionTransitionsQuery(suggestionId)
  const voteSummaryQuery = useVoteSummaryQuery(suggestionId)
  const commentsQuery = useSuggestionCommentsQuery(suggestionId)
  const createCommentMutation = useCreateSuggestionCommentMutation()
  const deleteCommentMutation = useDeleteSuggestionCommentMutation()
  const changeStatusMutation = useChangeSuggestionStatusMutation()
  const officialResponseMutation = useUpdateSuggestionOfficialResponseMutation()
  const setVoteMutation = useSetVoteMutation()
  const removeVoteMutation = useRemoveVoteMutation()
  const [evaluationOpen, setEvaluationOpen] = useState(false)

  const suggestion = detailQuery.data
  const transitions = transitionsQuery.data?.allowedNextStatuses ?? []
  const voteSummary = voteSummaryQuery.data
  const comments = commentsQuery.data?.pages.flatMap((page) => page.items) ?? []
  const commentPages = commentsQuery.data?.pages ?? []
  const commentCount = commentPages[commentPages.length - 1]?.totalCount ?? 0

  const isOpen = Boolean(suggestionId)

  const handleCreateComment = async (content: string) => {
    if (!suggestionId) return
    await createCommentMutation.mutateAsync({ suggestionId, content })
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!suggestionId) return
    await deleteCommentMutation.mutateAsync({ suggestionId, commentId })
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!suggestionId) return

    if (newStatus === 'Closed') {
      setEvaluationOpen(true)
      return
    }

    try {
      await changeStatusMutation.mutateAsync({ id: suggestionId, status: newStatus as SuggestionStatus })
      toast.success('Öneri durumu güncellendi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Güncelleme başarısız')
    }
  }

  const handleEvaluationSubmit = async (officialResponse: string) => {
    if (!suggestionId) return

    try {
      await officialResponseMutation.mutateAsync({ id: suggestionId, officialResponse })
      await changeStatusMutation.mutateAsync({ id: suggestionId, status: 'Closed' })
      toast.success('Öneri yanıtlandı ve kapatıldı')
      setEvaluationOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Öneri kapatılamadı')
    }
  }

  const handleVote = async (voteType: 'Upvote' | 'Downvote') => {
    if (!suggestionId) return
    try {
      if (voteSummary?.userVote === voteType) {
        await removeVoteMutation.mutateAsync(suggestionId)
      } else {
        await setVoteMutation.mutateAsync({ suggestionId, voteType })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Oy işlemi başarısız')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {detailQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : detailQuery.isError || !suggestion ? (
          <div className="py-12 text-center text-sm text-destructive">Öneri yüklenemedi.</div>
        ) : (
          <div className="space-y-6">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="size-5" />
                {suggestion.title}
              </SheetTitle>
            </SheetHeader>

            {/* Status + Actions */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <SuggestionStatusBadge status={suggestion.status} />
              </div>
              {transitions.length > 0 && (
                <Select
                  value={suggestion.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transitions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Votes */}
            <div className="flex items-center gap-4">
              <Button
                variant={voteSummary?.userVote === 'Upvote' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('Upvote')}
                disabled={setVoteMutation.isPending}
              >
                <ThumbsUp className="mr-1.5 size-4" />
                {voteSummary?.upVotes ?? suggestion.upVotes}
              </Button>
              <Button
                variant={voteSummary?.userVote === 'Downvote' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('Downvote')}
                disabled={setVoteMutation.isPending}
              >
                <ThumbsDown className="mr-1.5 size-4" />
                {voteSummary?.downVotes ?? suggestion.downVotes}
              </Button>
              <span className="text-sm text-muted-foreground">
                Puan: {suggestion.voteScore}
              </span>
            </div>

            {/* Content */}
            <div>
              <p className="text-sm whitespace-pre-wrap text-foreground/80">{suggestion.content}</p>
            </div>

            {suggestion.officialResponse && (
              <div className="rounded-md border bg-muted/40 p-4">
                <h3 className="mb-2 text-sm font-medium">Resmi yanıt</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {suggestion.officialResponse}
                </p>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="size-3.5" />
                {suggestion.userFullName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {format(new Date(suggestion.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
              </span>
            </div>

            <Separator />

            {/* Comments */}
            <CommentSection
              comments={comments}
              totalCount={commentCount}
              hasMore={commentsQuery.hasNextPage}
              isLoadingMore={commentsQuery.isFetchingNextPage}
              onLoadMore={() => commentsQuery.fetchNextPage()}
              isLoading={commentsQuery.isLoading}
              isError={commentsQuery.isError}
              onCreateComment={handleCreateComment}
              onDeleteComment={handleDeleteComment}
              isCreating={createCommentMutation.isPending}
              placeholder="Öneri hakkında yorum yazın..."
            />
          </div>
        )}
      </SheetContent>

      <SuggestionEvaluationDialog
        open={evaluationOpen}
        suggestionTitle={suggestion?.title}
        initialResponse={suggestion?.officialResponse}
        isSaving={officialResponseMutation.isPending || changeStatusMutation.isPending}
        onOpenChange={setEvaluationOpen}
        onSubmit={handleEvaluationSubmit}
      />
    </Sheet>
  )
}
