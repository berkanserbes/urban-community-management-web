import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Pencil, Trash2, ToggleLeft, ToggleRight, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AnnouncementScopeBadge, AnnouncementStatusBadge } from '@/features/announcements/components/AnnouncementBadges'
import type { AnnouncementDto } from '@/types/api.types'

const columnHelper = createColumnHelper<AnnouncementDto>()

type AnnouncementTableProps = {
  announcements: AnnouncementDto[]
  showActions?: boolean
  canDelete?: boolean
  onEdit?: (announcement: AnnouncementDto) => void
  onDelete?: (announcement: AnnouncementDto) => void
  onActivate?: (announcement: AnnouncementDto) => void
  onDeactivate?: (announcement: AnnouncementDto) => void
}

export function AnnouncementTable({
  announcements,
  showActions,
  canDelete,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}: AnnouncementTableProps) {
  const columns = [
    columnHelper.accessor('title', {
      header: 'Duyuru',
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{row.original.title}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{row.original.content}</p>
        </div>
      ),
    }),
    columnHelper.accessor('scope', {
      header: 'Kapsam',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <AnnouncementScopeBadge scope={row.original.scope} />
          {row.original.scope !== 'All' && row.original.provinceName && (
            <span className="text-xs text-muted-foreground">
              {row.original.neighborhoodName ?? row.original.districtName ?? row.original.provinceName}
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('isActive', {
      header: 'Durum',
      cell: ({ getValue }) => <AnnouncementStatusBadge isActive={getValue()} />,
    }),
    columnHelper.accessor('userFullName', {
      header: 'Oluşturan',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{getValue()}</span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Oluşturma',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(getValue()), 'dd MMM yyyy', { locale: tr })}
        </span>
      ),
    }),
    columnHelper.accessor('expiresAt', {
      header: 'Son Tarih',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {getValue() ? format(new Date(getValue()!), 'dd MMM yyyy', { locale: tr }) : 'Belirtilmedi'}
        </span>
      ),
    }),
    ...(showActions
      ? [
          columnHelper.display({
            id: 'actions',
            cell: ({ row }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="size-8 p-0">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
                    <Pencil className="mr-2 size-4" />
                    Düzenle
                  </DropdownMenuItem>
                  {row.original.isActive ? (
                    <DropdownMenuItem onClick={() => onDeactivate?.(row.original)}>
                      <ToggleLeft className="mr-2 size-4" />
                      Pasifleştir
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onActivate?.(row.original)}>
                      <ToggleRight className="mr-2 size-4" />
                      Aktifleştir
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete?.(row.original)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Sil
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          }),
        ]
      : []),
  ]

  const table = useReactTable({
    data: announcements,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
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
        {table.getRowModel().rows.length ? (
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
            <TableCell colSpan={columns.length} className="py-8 text-center text-sm text-muted-foreground">
              Sonuç bulunamadı.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
