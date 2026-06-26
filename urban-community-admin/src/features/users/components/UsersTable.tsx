import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Eye, MoreVertical, Pencil, Shield, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { UserRoleBadge, UserStatusBadge } from '@/features/users/components/UserBadges'
import type { UserDto } from '@/types/api.types'

const helper = createColumnHelper<UserDto>()
const columns = [
  helper.accessor('firstName', {
    header: 'Kullanıcı',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  }),
  helper.accessor('role', {
    header: 'Rol',
    cell: ({ getValue }) => <UserRoleBadge role={getValue()} />,
  }),
  helper.accessor('isActive', {
    header: 'Durum',
    cell: ({ getValue }) => <UserStatusBadge isActive={getValue()} />,
  }),
  helper.accessor('organizationName', {
    header: 'Kurum',
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() ?? 'Atanmamış'}</span>,
  }),
  helper.accessor('departmentName', {
    header: 'Yerel Birim',
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() ?? 'Atanmamış'}</span>,
  }),
  helper.accessor('createdAt', {
    header: 'Kayıt',
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(getValue()), 'dd MMM yyyy', { locale: tr })}
      </span>
    ),
  }),
]

type Props = {
  users: UserDto[]
  onView: (id: string) => void
  onToggleStatus: (user: UserDto) => void
  onEditAccess: (user: UserDto) => void
}

export function UsersTable({ users, onView, onToggleStatus, onEditAccess }: Props) {
  const table = useReactTable({ data: users, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
            <TableHead className="text-right">İşlem</TableHead>
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(row.original.id)}>
                    <Eye className="size-4" />Detay
                  </DropdownMenuItem>
                  {row.original.role === 'Official' ? (
                    <DropdownMenuItem onClick={() => onEditAccess(row.original)}>
                      <Pencil className="size-4" />Erişimi düzenle
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem onClick={() => onToggleStatus(row.original)}>
                    {row.original.isActive ? <ShieldOff className="size-4" /> : <Shield className="size-4" />}
                    {row.original.isActive ? 'Pasife al' : 'Aktifleştir'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        )) : (
          <TableRow><TableCell colSpan={columns.length + 1} className="py-8 text-center">Sonuç bulunamadı.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  )
}
