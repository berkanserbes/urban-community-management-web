import { useEffect, useMemo } from 'react'
import { Building2, Mail, RefreshCw, Shield, UserCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { ProfileDetailsForm, type ProfileDetailsFormValues } from '@/features/profile/components/ProfileDetailsForm'
import { ProfileImageCard } from '@/features/profile/components/ProfileImageCard'
import { ProfileSecurityForm, type ProfileSecurityFormValues } from '@/features/profile/components/ProfileSecurityForm'
import { ProfileSummaryCard } from '@/features/profile/components/ProfileSummaryCard'
import {
  useChangePasswordMutation,
  useCurrentUserQuery,
  useDeleteProfileImageMutation,
  useUpdateProfileImageMutation,
  useUpdateProfileMutation,
} from '@/features/profile/hooks/useProfile'
import type { ChangePasswordPayload, UpdateProfilePayload } from '@/features/profile/api/profileApi'

export function ProfilePage() {
  const authUser = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const currentUserQuery = useCurrentUserQuery(isAuthenticated)
  const updateProfileMutation = useUpdateProfileMutation()
  const changePasswordMutation = useChangePasswordMutation()
  const updateProfileImageMutation = useUpdateProfileImageMutation()
  const deleteProfileImageMutation = useDeleteProfileImageMutation()

  const user = currentUserQuery.data ?? authUser
  const ready = currentUserQuery.isFetched || !!user

  useEffect(() => {
    if (currentUserQuery.data) {
      updateUser(currentUserQuery.data)
    }
  }, [currentUserQuery.data, updateUser])

  const stats = useMemo(() => {
    const baseStats = [
      { label: 'Rol', value: user?.role === 'Admin' ? 'Yönetici' : user?.role === 'Official' ? 'Yetkili' : '—', icon: Shield, variant: 'blue' as const },
      { label: 'E-posta', value: user?.email ?? '—', icon: Mail, variant: 'emerald' as const },
      { label: 'Departman', value: user?.departmentName ?? '—', icon: Building2, variant: 'purple' as const },
      { label: 'Hesap', value: user?.isActive === false ? 'Pasif' : 'Aktif', icon: UserCircle2, variant: 'amber' as const },
    ]

    if (user?.role === 'Official') {
      baseStats.splice(3, 0, {
        label: 'Kurum',
        value: user?.organizationName ?? '—',
        icon: Building2,
        variant: 'purple' as const,
      })
    }

    return baseStats
  }, [user])

  if (currentUserQuery.isError && !user) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Profil" description="Hesap bilgilerinizi yönetin." />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12 text-sm text-muted-foreground">
            <p>Profil bilgileri yüklenemedi.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentUserQuery.refetch()}
              disabled={currentUserQuery.isFetching}
            >
              <RefreshCw className={`size-4 ${currentUserQuery.isFetching ? 'animate-spin' : ''}`} />
              {currentUserQuery.isFetching ? 'Yükleniyor...' : 'Yeniden Dene'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profil" description="Hesap bilgilerinizi yönetin ve güvenlik ayarlarınızı güncelleyin." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleProfileSubmit = async (values: ProfileDetailsFormValues) => {
    const payload: UpdateProfilePayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      bio: values.bio ?? null,
      phoneNumber: values.phoneNumber ?? null,
      neighborhoodId: user.neighborhoodId ?? null,
    }

    try {
      await updateProfileMutation.mutateAsync(payload)
      updateUser({
        firstName: payload.firstName,
        lastName: payload.lastName,
        bio: payload.bio ?? null,
        phoneNumber: payload.phoneNumber ?? null,
      })
      toast.success('Profil bilgileri güncellendi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Profil güncellenemedi')
    }
  }

  const handlePasswordSubmit = async (values: ProfileSecurityFormValues) => {
    if (!user.id) {
      toast.error('Kullanıcı bilgisi bulunamadı')
      return
    }

    const payload: ChangePasswordPayload = {
      userId: user.id,
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmPassword,
    }

    try {
      await changePasswordMutation.mutateAsync(payload)
      toast.success('Şifre güncellendi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Şifre güncellenemedi')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Profil"
        description="Hesap bilgilerinizi yönetin ve güvenlik ayarlarınızı güncelleyin."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon, variant }) => (
          <StatCard key={label} label={label} value={String(value)} icon={icon} variant={variant} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="grid gap-6">
          <ProfileSummaryCard
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
            role={user.role}
            profileImageUrl={user.profileImageUrl}
            neighborhoodName={user.neighborhoodName}
            departmentName={user.departmentName}
            organizationName={user.organizationName}
            officialJurisdictionLevel={user.officialJurisdictionLevel}
            officialJurisdictionName={user.officialJurisdictionName}
            provinceName={user.provinceName}
            districtName={user.districtName}
          />
          <ProfileImageCard
            firstName={user.firstName}
            lastName={user.lastName}
            profileImageUrl={user.profileImageUrl}
            onUpload={async (file) => {
              const updatedImage = await updateProfileImageMutation.mutateAsync(file)
              updateUser({ profileImageUrl: updatedImage.profileImageUrl })
            }}
            onDelete={async () => {
              await deleteProfileImageMutation.mutateAsync()
              window.location.reload()
            }}
          />
        </div>

        <div className="grid gap-6">
          <ProfileDetailsForm
            firstName={user.firstName}
            lastName={user.lastName}
            phoneNumber={user.phoneNumber}
            bio={user.bio}
            isPending={updateProfileMutation.isPending}
            onSubmit={handleProfileSubmit}
          />
          <ProfileSecurityForm
            onSubmit={handlePasswordSubmit}
            isPending={changePasswordMutation.isPending}
          />
        </div>
      </div>
    </div>
  )
}
