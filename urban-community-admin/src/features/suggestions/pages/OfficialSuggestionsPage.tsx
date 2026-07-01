import { useMemo, useState } from 'react'
import { Lightbulb, ThumbsUp, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SuggestionsTable } from '@/features/suggestions/components/SuggestionsTable'
import { SuggestionDetailSheet } from '@/features/suggestions/components/SuggestionDetailSheet'
import { SuggestionEvaluationDialog } from '@/features/suggestions/components/SuggestionEvaluationDialog'
import {
  useSuggestionsQuery,
  useChangeSuggestionStatusMutation,
  useUpdateSuggestionOfficialResponseMutation,
} from '@/features/suggestions/hooks/useSuggestions'
import type { SuggestionDto, SuggestionStatus } from '@/types/api.types'

type StatusFilter = 'all' | SuggestionStatus

export function OfficialSuggestionsPage() {
  const suggestionsQuery = useSuggestionsQuery()
  const changeStatusMutation = useChangeSuggestionStatusMutation()
  const officialResponseMutation = useUpdateSuggestionOfficialResponseMutation()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [evaluatingSuggestion, setEvaluatingSuggestion] = useState<SuggestionDto | null>(null)
  const [detailSuggestionId, setDetailSuggestionId] = useState<string | null>(null)

  const suggestions = useMemo(() => suggestionsQuery.data ?? [], [suggestionsQuery.data])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return suggestions
    return suggestions.filter((s) => s.status === statusFilter)
  }, [suggestions, statusFilter])

  const stats = useMemo(() => ({
    total: suggestions.length,
    active: suggestions.filter((s) => s.status === 'Active').length,
    reviewing: suggestions.filter((s) => s.status === 'Reviewing').length,
    implementation: suggestions.filter((s) => s.status === 'Implementation').length,
  }), [suggestions])

  const handleChangeStatus = async (id: string, status: SuggestionStatus) => {
    if (status === 'Closed') {
      const suggestion = suggestions.find((item) => item.id === id)
      if (suggestion) setEvaluatingSuggestion(suggestion)
      return
    }

    try {
      await changeStatusMutation.mutateAsync({ id, status })
      toast.success('Öneri durumu güncellendi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Güncelleme başarısız')
    }
  }

  const handleEvaluationSubmit = async (officialResponse: string) => {
    if (!evaluatingSuggestion) return

    try {
      await officialResponseMutation.mutateAsync({
        id: evaluatingSuggestion.id,
        officialResponse,
      })
      await changeStatusMutation.mutateAsync({
        id: evaluatingSuggestion.id,
        status: 'Closed',
      })
      toast.success('Öneri yanıtlandı ve kapatıldı')
      setEvaluatingSuggestion(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Öneri kapatılamadı')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Öneriler"
        description="Vatandaşların gönderdiği önerileri inceleyin ve durumlarını güncelleyin."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam" value={String(stats.total)} icon={Lightbulb} variant="blue" />
        <StatCard label="Aktif" value={String(stats.active)} icon={ThumbsUp} variant="emerald" />
        <StatCard label="İncelemede" value={String(stats.reviewing)} icon={Clock} variant="amber" />
        <StatCard label="Uygulamada" value={String(stats.implementation)} icon={CheckCircle2} variant="purple" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Öneri Listesi</CardTitle>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="Active">Aktif</SelectItem>
              <SelectItem value="Reviewing">İncelemede</SelectItem>
              <SelectItem value="Implementation">Uygulamada</SelectItem>
              <SelectItem value="Closed">Kapatıldı</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {suggestionsQuery.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Öneriler yükleniyor…</div>
          ) : suggestionsQuery.isError ? (
            <div className="py-12 text-center text-sm text-destructive">Öneriler yüklenemedi.</div>
          ) : (
            <SuggestionsTable
              suggestions={filtered}
              canChangeStatus
              canDelete={false}
              onChangeStatus={handleChangeStatus}
              onDetail={setDetailSuggestionId}
            />
          )}
        </CardContent>
      </Card>

      <SuggestionDetailSheet
        suggestionId={detailSuggestionId}
        onOpenChange={(open) => { if (!open) setDetailSuggestionId(null) }}
      />

      <SuggestionEvaluationDialog
        open={evaluatingSuggestion !== null}
        suggestionTitle={evaluatingSuggestion?.title}
        initialResponse={evaluatingSuggestion?.officialResponse}
        isSaving={officialResponseMutation.isPending || changeStatusMutation.isPending}
        onOpenChange={(open) => { if (!open) setEvaluatingSuggestion(null) }}
        onSubmit={handleEvaluationSubmit}
      />
    </div>
  )
}
