import { useState } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserRoleBadge, UserStatusBadge } from '@/features/users/components/UserBadges'
import { UserEditForm, type UserEditFormValues } from '@/features/users/components/UserEditForm'
import { useAdminUpdateUserMutation } from '@/features/users/hooks/useUsers'
import { toAbsoluteUrl } from '@/lib/utils'
import type { UserDto } from '@/types/api.types'

type UserDetailsSheetProps = {
  user: UserDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailsSheet({ user, open, onOpenChange }: UserDetailsSheetProps) {
  const [tab, setTab] = useState<'detail' | 'edit'>('detail')
  const updateMutation = useAdminUpdateUserMutation()

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'UC'
  const profileImageSrc = toAbsoluteUrl(user?.profileImageUrl)

  const handleEdit = async (values: UserEditFormValues) => {
    if (!user) return
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        firstName: values.firstName,
        lastName: values.lastName,
        bio: values.bio ?? null,
        phoneNumber: values.phoneNumber ?? null,
        neighborhoodId: user.neighborhoodId ?? null,
      })
      toast.success('Kullanıcı bilgileri güncellendi')
      setTab('detail')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Güncelleme başarısız')
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        if (!open) setTab('detail')
        onOpenChange(open)
      }}
    >
      <SheetContent className="flex flex-col gap-0 overflow-y-auto sm:max-w-[520px]">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>Kullanıcı Detayı</SheetTitle>
          <SheetDescription>Kullanıcı bilgilerini görüntüleyin veya düzenleyin.</SheetDescription>
        </SheetHeader>

        {user ? (
          <>
            {/* Avatar + özet */}
            <div className="flex items-center gap-4 px-6 pb-4">
              <Avatar className="size-16">
                {profileImageSrc ? (
                  <AvatarImage src={profileImageSrc} alt={`${user.firstName} ${user.lastName}`} />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  <UserRoleBadge role={user.role} />
                  <UserStatusBadge isActive={user.isActive} />
                </div>
              </div>
            </div>

            {/* Sekmeler */}
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as 'detail' | 'edit')}
              className="flex flex-1 flex-col px-6 pb-6"
            >
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="detail" className="flex-1">Bilgiler</TabsTrigger>
                <TabsTrigger value="edit" className="flex-1">Düzenle</TabsTrigger>
              </TabsList>

              <TabsContent value="detail" className="mt-0 grid gap-2 text-sm">
                <InfoRow label="Mahalle" value={user.neighborhoodName ?? user.neighborhoodId ?? 'Atanmamış'} />
                <InfoRow label="Kurum" value={user.organizationName ?? 'Atanmamış'} />
                <InfoRow label="Departman" value={user.departmentName ?? user.departmentId ?? 'Atanmamış'} />
                <InfoRow label="Yetki Alanı" value={user.officialJurisdictionName ?? 'Atanmamış'} />
                <InfoRow label="Telefon" value={user.phoneNumber ?? 'Yok'} />
                <InfoRow label="Biyografi" value={user.bio ?? 'Yok'} />
                <InfoRow
                  label="Kayıt Tarihi"
                  value={format(new Date(user.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                />
              </TabsContent>

              <TabsContent value="edit" className="mt-0">
                <UserEditForm
                  user={user}
                  isSaving={updateMutation.isPending}
                  onSubmit={handleEdit}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant="outline" className="max-w-[240px] truncate">{value}</Badge>
    </div>
  )
}
