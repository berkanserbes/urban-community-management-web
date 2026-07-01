import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { DepartmentWithStatsDto } from '@/types/api.types'

type DepartmentsTableProps = {
  departments: DepartmentWithStatsDto[]
  onEdit: (department: DepartmentWithStatsDto) => void
  onDelete: (department: DepartmentWithStatsDto) => void
}

const col = createColumnHelper<DepartmentWithStatsDto>()

const columns = (
  onEdit: (d: DepartmentWithStatsDto) => void,
  onDelete: (d: DepartmentWithStatsDto) => void,
) => [
  col.accessor('name', {
    header: 'Birim Adı',
    cell: (info) => (
      <div>
        <p className="font-medium">{info.getValue()}</p>
        {info.row.original.description ? (
          <p className="max-w-[260px] truncate text-xs text-muted-foreground">
            {info.row.original.description}
          </p>
        ) : null}
      </div>
    ),
  }),
  col.accessor('officialCount', {
    header: 'Yetkili',
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),
  col.accessor('assignedReportCount', {
    header: 'Atanan Rapor',
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),
  col.display({
    id: 'actions',
    header: () => <span className="sr-only">İşlemler</span>,
    cell: ({ row }) => {
      const dept = row.original
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Menü</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(dept)}>
                <Pencil className="mr-2 size-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(dept)}
              >
                <Trash2 className="mr-2 size-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  }),
]

export function DepartmentsTable({ departments, onEdit, onDelete }: DepartmentsTableProps) {
  const table = useReactTable({
    data: departments,
    columns: columns(onEdit, onDelete),
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
              <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                Henüz birim bulunmuyor.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
