import { useMemo, useState } from 'react'
import { ShieldCheck, ShieldOff, UserCog, Users as UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
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
  useUsersQuery,
} from '@/features/users/hooks/useUsers'
import type { UserDto, UserRole } from '@/types/api.types'

export function AdminUsersPage() {
  const usersQuery = useUsersQuery()
  const createOfficialMutation = useCreateOfficialMutation()
  const deactivateMutation = useDeactivateUserMutation()
  const activateMutation = useActivateUserMutation()
  const accessMutation = useAssignUserRoleMutation()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<'all' | UserRole>('all')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [credential, setCredential] = useState<{ email: string; temporaryPassword: string } | null>(null)
  const [accessUser, setAccessUser] = useState<UserDto | null>(null)
  const selectedUserQuery = useUserQuery(selectedUserId, Boolean(selectedUserId))

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data])
  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesQuery = [user.firstName, user.lastName, user.email].join(' ').toLowerCase().includes(query.toLowerCase())
    const matchesRole = role === 'all' || user.role === role
    const matchesStatus = status === 'all' || (status === 'active' ? user.isActive : !user.isActive)
    return matchesQuery && matchesRole && matchesStatus
  }), [query, role, status, users])

  const stats = {
    activeCount: users.filter((user) => user.isActive).length,
    adminCount: users.filter((user) => user.role === 'Admin').length,
    officialCount: users.filter((user) => user.role === 'Official').length,
  }

  const createOfficial = async (payload: CreateOfficialPayload) => {
    try {
      const created = await createOfficialMutation.mutateAsync(payload)
      setCreateOpen(false)
      setCredential({ email: created.email, temporaryPassword: created.temporaryPassword })
      toast.success('Official hesabı oluşturuldu')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Official oluşturulamadı')
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
        description="Citizen hesaplarını görüntüleyin ve Official hesaplarını güvenli biçimde yönetin."
        actions={<Button onClick={() => setCreateOpen(true)}>Yeni Official</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam" value={String(users.length)} icon={UsersIcon} variant="blue" />
        <StatCard label="Aktif" value={String(stats.activeCount)} icon={ShieldCheck} variant="emerald" />
        <StatCard label="Admin" value={String(stats.adminCount)} icon={UserCog} variant="purple" />
        <StatCard label="Official" value={String(stats.officialCount)} icon={ShieldOff} variant="amber" />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Kullanıcı Listesi</CardTitle>
          <UsersFilters
            query={query}
            onQueryChange={setQuery}
            role={role}
            onRoleChange={setRole}
            status={status}
            onStatusChange={setStatus}
            onReset={() => {
              setQuery('')
              setRole('all')
              setStatus('all')
            }}
          />
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Kullanıcılar yükleniyor...</div>
          ) : usersQuery.isError ? (
            <div className="py-12 text-center text-sm text-destructive">Kullanıcılar yüklenemedi.</div>
          ) : (
            <UsersTable
              users={filteredUsers}
              onView={setSelectedUserId}
              onToggleStatus={toggleStatus}
              onEditAccess={setAccessUser}
            />
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
              toast.success('Official erişimi güncellendi')
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
          <DialogHeader><DialogTitle>Official Hesabı Oluşturuldu</DialogTitle></DialogHeader>
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
