import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  open: boolean
  suggestionTitle?: string
  initialResponse?: string | null
  isSaving?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (officialResponse: string) => Promise<void> | void
}

export function SuggestionEvaluationDialog({
  open,
  suggestionTitle,
  initialResponse,
  isSaving = false,
  onOpenChange,
  onSubmit,
}: Props) {
  const [officialResponse, setOfficialResponse] = useState(initialResponse ?? '')

  const trimmedResponse = officialResponse.trim()
  const canSubmit = trimmedResponse.length >= 10 && !isSaving

  const handleSubmit = async () => {
    if (!canSubmit) return
    await onSubmit(trimmedResponse)
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!isSaving) onOpenChange(nextOpen)
    }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Öneriyi değerlendir</DialogTitle>
          <DialogDescription>
            Öneriyi kapatmadan önce vatandaşa gösterilecek resmi yanıtı yazın.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {suggestionTitle && (
            <p className="rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground">
              {suggestionTitle}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="official-response">Resmi yanıt</Label>
            <Textarea
              id="official-response"
              value={officialResponse}
              onChange={(event) => setOfficialResponse(event.target.value)}
              placeholder="Öneriniz değerlendirilmiş ve başarıyla hayata geçirilmiştir..."
              className="min-h-32 resize-none"
              maxLength={2000}
              disabled={isSaving}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>En az 10 karakter girin.</span>
              <span>{trimmedResponse.length}/2000</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            İptal
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {isSaving ? 'Kaydediliyor...' : 'Yanıtla ve kapat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
