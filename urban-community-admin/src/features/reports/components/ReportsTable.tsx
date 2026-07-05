import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useNavigate } from 'react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ReportPriorityBadge, ReportStatusBadge } from '@/features/reports/components/ReportBadges'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ReportDto } from '@/types/api.types'

const columnHelper = createColumnHelper<ReportDto>()

const columns = (onAssign?: (report: ReportDto) => void) => [
  columnHelper.accessor('title', {
    header: 'Baslik',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.title}</p>
        <p className="text-xs text-muted-foreground">{row.original.categoryName}</p>
      </div>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Durum',
    cell: ({ getValue }) => <ReportStatusBadge status={getValue()} />,
  }),
  columnHelper.accessor('priority', {
    header: 'Oncelik',
    cell: ({ getValue }) => <ReportPriorityBadge priority={getValue()} />,
  }),
  columnHelper.accessor('similarReportCount', {
    header: 'Benzer',
    cell: ({ getValue }) => {
      const count = getValue() ?? 0
      return count > 0 ? (
        <Badge variant="outline">{count} rapor</Badge>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    },
  }),
  columnHelper.accessor('neighborhoodName', {
    header: 'Mahalle',
    cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
  }),
  columnHelper.accessor('reporterName', {
    header: 'Bildirimi Yapan',
    cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
  }),
  columnHelper.accessor('assignedOrganizationName', {
    header: 'Atanan Birim',
    cell: ({ row }) => (
      <div className="max-w-[220px] text-sm">
        <p>{row.original.assignedOrganizationName ?? 'Atanmamış'}</p>
        {row.original.assignedOrganizationName ? (
          <p className="text-xs text-muted-foreground">
            {row.original.assignedDepartmentName ?? '—'}
          </p>
        ) : null}
        {row.original.assignmentNeedsReview ? (
          <Badge variant="destructive" className="mt-1">İnceleme gerekli</Badge>
        ) : null}
      </div>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Tarih',
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(getValue()), 'dd MMM yyyy', { locale: tr })}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) =>
      onAssign ? (
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onAssign(row.original); }}>
          Ata
        </Button>
      ) : null,
  }),
]

type ReportsTableProps = {
  reports: ReportDto[]
  onAssign?: (report: ReportDto) => void
}

export function ReportsTable({ reports, onAssign }: ReportsTableProps) {
  const navigate = useNavigate()
  const basePath = window.location.pathname.includes('/official') ? '/official' : '/admin'
  const table = useReactTable({
    data: reports,
    columns: columns(onAssign),
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
            <TableRow
              key={row.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`${basePath}/reports/${row.original.id}`)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns(onAssign).length} className="py-8 text-center text-sm text-muted-foreground">
              Filtreye uygun rapor bulunamadi.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
