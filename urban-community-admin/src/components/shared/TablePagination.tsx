import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PagedResult } from '@/types/api.types'

type TablePaginationProps = {
  page: PagedResult<unknown> | undefined
  onPageChange: (pageIndex: number) => void
  itemLabel: string
}

export function TablePagination({ page, onPageChange, itemLabel }: TablePaginationProps) {
  // A delete can leave the current page empty; fall back to the last page that still has rows.
  useEffect(() => {
    if (page && page.items.length === 0 && page.pageIndex > 1) {
      onPageChange(Math.max(page.totalPages, 1))
    }
  }, [page, onPageChange])

  if (!page || page.totalCount === 0) return null

  const from = (page.pageIndex - 1) * page.pageSize + 1
  const to = from + page.items.length - 1

  return (
    <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
      <span>
        {from}–{to} / {page.totalCount} {itemLabel}
      </span>
      {page.totalPages > 1 && (
        <div className="flex items-center gap-2">
          <span>
            Sayfa {page.pageIndex} / {page.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page.pageIndex - 1)}
            disabled={!page.hasPreviousPage}
            aria-label="Önceki sayfa"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page.pageIndex + 1)}
            disabled={!page.hasNextPage}
            aria-label="Sonraki sayfa"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
