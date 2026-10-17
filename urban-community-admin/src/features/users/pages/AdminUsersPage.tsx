import { useState } from 'react'
import { ShieldCheck, ShieldOff, UserCog, Users as UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { TablePagination } from '@/components/shared/TablePagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { CreateOfficialPayload } from '@/features/users/api/usersApi'
import { CreateOfficialDialog } from '@/features/users/components/CreateOfficialDialog'
import { EditOfficialAccessDialog } from '@/features/users/components/EditOfficialAccessDialog'
import { UserDetailsSheet } from '@/features/users/components/UserDetailsSheet'
import { UsersFilters } from '@/features/users/components/UsersFilters'
import { UsersTable } from '@/features/users/components/UsersTable'
import {
  useActivateUserMutation,
  useAssignUserRoleMutation,
  useCreateOfficialMutation,
  useDeactivateUserMutation,
  useUserQuery,
  useUserStatsQuery,
  useUsersQuery,
} from '@/features/users/hooks/useUsers'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import type { UserDto, UserRole } from '@/types/api.types'

export function AdminUsersPage() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<'all' | UserRole>('all')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [pageIndex, setPageIndex] = useState(1)
  const search = useDebouncedValue(query.trim())
  const usersQuery = useUsersQuery({
    pageIndex,
    pageSize: DEFAULT_PAGE_SIZE,
    search: search || undefined,
    role: role === 'all' ? undefined : role,
    isActive: status === 'all' ? undefined : status === 'active',
  })
  const stats = useUserStatsQuery().data
  const createOfficialMutation = useCreateOfficialMutation()
  const deactivateMutation = useDeactivateUserMutation()
  const activateMutation = useActivateUserMutation()
  const accessMutation = useAssignUserRoleMutation()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [credential, setCredential] = useState<{ email: string; temporaryPassword: string } | null>(null)
  const [accessUser, setAccessUser] = useState<UserDto | null>(null)
  const selectedUserQuery = useUserQuery(selectedUserId, Boolean(selectedUserId))

  // Any filter change starts again from the first page.
  const withPageReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setPageIndex(1)
  }

  const createOfficial = async (payload: CreateOfficialPayload) => {
    try {
      const created = await createOfficialMutation.mutateAsync(payload)
      setCreateOpen(false)
      setCredential({ email: created.email, temporaryPassword: created.temporaryPassword })
      toast.success('Yetkili hesabı oluşturuldu')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Yetkili oluşturulamadı')
    }
  }

  const toggleStatus = async (user: UserDto) => {
    try {
      if (user.isActive) await deactivateMutation.mutateAsync(user.id)
      else await activateMutation.mutateAsync(user.id)
      toast.success(user.isActive ? 'Kullanıcı pasife alındı' : 'Kullanıcı aktifleştirildi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'İşlem tamamlanamadı')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kullanıcı Yönetimi"
        description="Vatandaş hesaplarını görüntüleyin ve yetkili hesaplarını güvenli biçimde yönetin."
        actions={<Button onClick={() => setCreateOpen(true)}>Yeni Yetkili</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Toplam" value={String(stats?.total ?? 0)} icon={UsersIcon} variant="blue" />
        <StatCard label="Aktif" value={String(stats?.active ?? 0)} icon={ShieldCheck} variant="emerald" />
        <StatCard label="Admin" value={String(stats?.admin ?? 0)} icon={UserCog} variant="purple" />
        <StatCard label="Yetkili" value={String(stats?.official ?? 0)} icon={ShieldOff} variant="amber" />
        <StatCard label="Vatandaş" value={String(stats?.citizen ?? 0)} icon={UsersIcon} variant="slate" />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Kullanıcı Listesi</CardTitle>
          <UsersFilters
            query={query}
            onQueryChange={withPageReset(setQuery)}
            role={role}
            onRoleChange={withPageReset(setRole)}
            status={status}
            onStatusChange={withPageReset(setStatus)}
            onReset={() => {
              setQuery('')
              setRole('all')
              setStatus('all')
              setPageIndex(1)
            }}
          />
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Kullanıcılar yükleniyor...</div>
          ) : usersQuery.isError ? (
            <div className="py-12 text-center text-sm text-destructive">Kullanıcılar yüklenemedi.</div>
          ) : (
            <>
              <UsersTable
                users={usersQuery.data?.items ?? []}
                onView={setSelectedUserId}
                onToggleStatus={toggleStatus}
                onEditAccess={setAccessUser}
              />
              <TablePagination page={usersQuery.data} onPageChange={setPageIndex} itemLabel="kullanıcı" />
            </>
          )}
        </CardContent>
      </Card>

      <UserDetailsSheet
        user={selectedUserQuery.data ?? null}
        open={selectedUserId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedUserId(null)
        }}
      />
      <CreateOfficialDialog
        open={createOpen}
        isSaving={createOfficialMutation.isPending}
        onOpenChange={setCreateOpen}
        onSubmit={createOfficial}
      />
      {accessUser ? (
        <EditOfficialAccessDialog
          key={accessUser.id}
          user={accessUser}
          isSaving={accessMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setAccessUser(null)
          }}
          onSubmit={async (payload) => {
            try {
              await accessMutation.mutateAsync(payload)
              setAccessUser(null)
              toast.success('Yetkili erişimi güncellendi')
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Erişim güncellenemedi')
            }
          }}
        />
      ) : null}

      <Dialog open={credential !== null} onOpenChange={(open) => {
        if (!open) setCredential(null)
      }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yetkili Hesabı Oluşturuldu</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bu geçici şifre tekrar gösterilmeyecektir. Güvenli bir kanaldan kullanıcıya iletin.
            </p>
            <div className="rounded-md border bg-muted/40 p-4">
              <p className="text-sm"><strong>E-posta:</strong> {credential?.email}</p>
              <p className="mt-2 break-all font-mono text-sm"><strong>Geçici şifre:</strong> {credential?.temporaryPassword}</p>
            </div>
            <Button className="w-full" onClick={async () => {
              if (credential) {
                await navigator.clipboard.writeText(credential.temporaryPassword)
                toast.success('Geçici şifre kopyalandı')
              }
            }}>Şifreyi Kopyala</Button>
            <Button className="w-full" variant="outline" onClick={() => setCredential(null)}>Bilgiyi Teslim Ettim</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
