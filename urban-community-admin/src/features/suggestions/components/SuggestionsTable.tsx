import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { MoreHorizontal, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SuggestionDto, SuggestionStatus } from '@/types/api.types'

const STATUS_LABELS: Record<SuggestionStatus, string> = {
  Active: 'Aktif',
  Reviewing: 'İncelemede',
  Implementation: 'Uygulamada',
  Closed: 'Kapatıldı',
}

const STATUS_VARIANTS: Record<SuggestionStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Active: 'default',
  Reviewing: 'secondary',
  Implementation: 'outline',
  Closed: 'destructive',
}

export function SuggestionStatusBadge({ status }: { status: SuggestionStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}

type SuggestionsTableProps = {
  suggestions: SuggestionDto[]
  canChangeStatus?: boolean
  canDelete?: boolean
  onChangeStatus?: (id: string, status: SuggestionStatus) => void
  onDelete?: (suggestion: SuggestionDto) => void
  onDetail?: (id: string) => void
}

const col = createColumnHelper<SuggestionDto>()

const ALLOWED_STATUS_TRANSITIONS: Record<SuggestionStatus, SuggestionStatus[]> = {
  Active: ['Reviewing'],
  Reviewing: ['Active', 'Implementation', 'Closed'],
  Implementation: ['Reviewing', 'Closed'],
  Closed: [],
}

function buildColumns(
  canChangeStatus: boolean,
  canDelete: boolean,
  onChangeStatus?: (id: string, status: SuggestionStatus) => void,
  onDelete?: (s: SuggestionDto) => void,
  onDetail?: (id: string) => void,
) {
  return [
    col.accessor('title', {
      header: 'Başlık',
      cell: (info) => (
        <div className="max-w-[260px]">
          <button
            className="text-left font-medium leading-snug hover:text-primary transition-colors"
            onClick={() => onDetail?.(info.row.original.id)}
          >
            {info.getValue()}
          </button>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {info.row.original.content}
          </p>
        </div>
      ),
    }),
    col.accessor('userFullName', {
      header: 'Kullanıcı',
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    col.accessor('status', {
      header: 'Durum',
      cell: (info) => <SuggestionStatusBadge status={info.getValue()} />,
    }),
    col.accessor('voteScore', {
      header: 'Oy',
      cell: (info) => {
        const row = info.row.original
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-emerald-600">
              <ThumbsUp className="size-3" />{row.upVotes}
            </span>
            <span className="flex items-center gap-1 text-rose-500">
              <ThumbsDown className="size-3" />{row.downVotes}
            </span>
          </div>
        )
      },
    }),
    col.accessor('createdAt', {
      header: 'Tarih',
      cell: (info) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(info.getValue()), 'dd MMM yyyy', { locale: tr })}
        </span>
      ),
    }),
    col.display({
      id: 'actions',
      header: () => <span className="sr-only">İşlemler</span>,
      cell: ({ row }) => {
        const suggestion = row.original
        const allowedStatuses = ALLOWED_STATUS_TRANSITIONS[suggestion.status]
        if (!canChangeStatus && !canDelete) return null
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canChangeStatus && (
                  <>
                    <DropdownMenuLabel>Durumu Değiştir</DropdownMenuLabel>
                    {allowedStatuses.length > 0 ? allowedStatuses.map((status) => (
                      <DropdownMenuItem key={status} onClick={() => onChangeStatus?.(suggestion.id, status)}>
                        {STATUS_LABELS[status]}
                      </DropdownMenuItem>
                    )) : (
                      <DropdownMenuItem disabled>Geçiş yok</DropdownMenuItem>
                    )}
                  </>
                )}
                {canChangeStatus && canDelete && <DropdownMenuSeparator />}
                {canDelete && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete?.(suggestion)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Sil
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ]
}

export function SuggestionsTable({
  suggestions,
  canChangeStatus = false,
  canDelete = false,
  onChangeStatus,
  onDelete,
  onDetail,
}: SuggestionsTableProps) {
  const table = useReactTable({
    data: suggestions,
    columns: buildColumns(canChangeStatus, canDelete, onChangeStatus, onDelete, onDetail),
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                Henüz öneri bulunmuyor.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
