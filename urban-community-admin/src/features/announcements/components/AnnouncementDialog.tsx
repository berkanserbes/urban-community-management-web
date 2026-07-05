import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProvincesQuery } from '@/features/locations/hooks/useProvinces'
import { useDistrictsQuery } from '@/features/locations/hooks/useDistricts'
import { useNeighborhoodsQuery } from '@/features/neighborhoods/hooks/useNeighborhoods'
import { useCurrentUserQuery } from '@/features/profile/hooks/useProfile'
import { useAuthStore } from '@/stores/auth.store'
import type { AnnouncementScope, AuthUser } from '@/types/api.types'

const announcementSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalı'),
  content: z.string().min(10, 'İçerik en az 10 karakter olmalı'),
  scope: z.enum(['All', 'Province', 'District', 'Neighborhood']),
  provinceId: z.string().optional(),
  districtId: z.string().optional(),
  neighborhoodId: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
}).superRefine((values, ctx) => {
  if (values.scope !== 'All' && !values.provinceId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['provinceId'],
      message: 'İl seçilmelidir.',
    })
  }

  if ((values.scope === 'District' || values.scope === 'Neighborhood') && !values.districtId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['districtId'],
      message: 'İlçe seçilmelidir.',
    })
  }

  if (values.scope === 'Neighborhood' && !values.neighborhoodId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['neighborhoodId'],
      message: 'Mahalle seçilmelidir.',
    })
  }
})

export type AnnouncementFormValues = z.infer<typeof announcementSchema>

export type AnnouncementEditData = {
  id: string
  title: string
  content: string
  scope: AnnouncementScope
  provinceId?: string | null
  districtId?: string | null
  neighborhoodId?: string | null
  expiresAt?: string | null
  isActive: boolean
}

type AnnouncementDialogProps = {
  triggerLabel?: string
  editing?: AnnouncementEditData | null
  open?: boolean
  isSaving?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit: (values: AnnouncementFormValues) => Promise<void> | void
}

function getOfficialLocationDefaults(user: AuthUser) {
  const scope = user.officialJurisdictionLevel ?? 'Neighborhood'

  return {
    scope,
    provinceId: user.officialProvinceId ?? (scope === 'Province' ? user.officialJurisdictionId : undefined) ?? undefined,
    districtId: user.officialDistrictId ?? (scope === 'District' ? user.officialJurisdictionId : undefined) ?? undefined,
    neighborhoodId: scope === 'Neighborhood' ? user.officialJurisdictionId ?? undefined : undefined,
  }
}

function hasOfficialLocation(user: AuthUser | null) {
  if (!user?.officialJurisdictionLevel) return false

  if (user.officialJurisdictionLevel === 'Province') {
    return Boolean(user.officialProvinceId ?? user.officialJurisdictionId)
  }

  if (user.officialJurisdictionLevel === 'District') {
    return Boolean(user.officialProvinceId && (user.officialDistrictId ?? user.officialJurisdictionId))
  }

  return Boolean(user.officialProvinceId && user.officialDistrictId && user.officialJurisdictionId)
}

function getDefaultFormValues(isOfficial: boolean, user: AuthUser | null, editing?: AnnouncementEditData | null): AnnouncementFormValues {
  if (editing) {
    return {
      title: editing.title,
      content: editing.content,
      scope: editing.scope,
      provinceId: editing.provinceId ?? undefined,
      districtId: editing.districtId ?? undefined,
      neighborhoodId: editing.neighborhoodId ?? undefined,
      expiresAt: editing.expiresAt ? editing.expiresAt.slice(0, 16) : '',
      isActive: editing.isActive,
    }
  }

  if (isOfficial && user) {
    const location = getOfficialLocationDefaults(user)

    return {
      title: '',
      content: '',
      scope: location.scope,
      provinceId: location.provinceId,
      districtId: location.districtId,
      neighborhoodId: location.neighborhoodId,
      expiresAt: '',
      isActive: true,
    }
  }

  return {
    title: '',
    content: '',
    scope: 'All',
    provinceId: '',
    districtId: '',
    neighborhoodId: '',
    expiresAt: '',
    isActive: true,
  }
}

export function AnnouncementDialog({
  triggerLabel,
  editing,
  open,
  isSaving,
  onOpenChange,
  onSubmit,
}: AnnouncementDialogProps) {
  const storedUser = useAuthStore((state) => state.user)
  const isOfficial = storedUser?.role === 'Official'
  const currentUserQuery = useCurrentUserQuery(isOfficial)
  const user = currentUserQuery.data ?? storedUser
  const officialLocationReady = !isOfficial || hasOfficialLocation(user)

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: getDefaultFormValues(isOfficial, user, editing),
  })

  const watchedScope = form.watch('scope')
  const watchedProvinceId = form.watch('provinceId')
  const watchedDistrictId = form.watch('districtId')

  const showLocationFields = watchedScope !== 'All' && !editing
  const isLocationReadOnly = isOfficial
  const showDistrictField = watchedScope === 'District' || watchedScope === 'Neighborhood'
  const showNeighborhoodField = watchedScope === 'Neighborhood'

  const provincesQuery = useProvincesQuery()
  const districtsQuery = useDistrictsQuery(watchedProvinceId)
  const neighborhoodsQuery = useNeighborhoodsQuery(
    watchedProvinceId && watchedDistrictId
      ? { provinceId: watchedProvinceId, districtId: watchedDistrictId }
      : undefined,
  )

  useEffect(() => {
    if (!open) {
      form.reset(getDefaultFormValues(isOfficial, user, editing ?? null))
    }
  }, [editing, form, isOfficial, open, user])

  useEffect(() => {
    if (!open) return
    form.reset(getDefaultFormValues(isOfficial, user, editing ?? null))
  }, [editing, form, isOfficial, open, user])

  useEffect(() => {
    if (watchedScope !== 'All' && !showDistrictField && watchedProvinceId) {
      form.setValue('districtId', '')
    }
    if (showDistrictField && !showNeighborhoodField && watchedDistrictId) {
      form.setValue('neighborhoodId', '')
    }
    if (watchedScope === 'All') {
      form.setValue('provinceId', '')
      form.setValue('districtId', '')
      form.setValue('neighborhoodId', '')
    }
  }, [watchedScope, showDistrictField, showNeighborhoodField, watchedProvinceId, watchedDistrictId, form])

  const handleScopeChange = (value: string) => {
    form.setValue('scope', value as AnnouncementScope)
    form.setValue('provinceId', '')
    form.setValue('districtId', '')
    form.setValue('neighborhoodId', '')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerLabel && !open ? (
        <DialogTrigger asChild>
          <Button>{triggerLabel}</Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Duyuruyu Düzenle' : 'Duyuru Formu'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Duyuru başlığını, içeriğini ve son tarihini güncelleyin.'
              : 'Duyuruyu oluşturun, kapsamını belirleyin ve yayın durumunu ayarlayın.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values)
            })}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Başlık</FormLabel>
                  <FormControl>
                    <Input placeholder="Duyuru başlığı" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İçerik</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Duyuru metni" className="min-h-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              {!editing && (
                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kapsam</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={handleScopeChange}
                        disabled={isOfficial}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kapsam seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="All">Tümü</SelectItem>
                          <SelectItem value="Province">İl</SelectItem>
                          <SelectItem value="District">İlçe</SelectItem>
                          <SelectItem value="Neighborhood">Mahalle</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Son Tarih</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {showLocationFields && !editing && (
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="provinceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İl</FormLabel>
                      <Select value={field.value || ''} disabled={isLocationReadOnly} onValueChange={(v) => {
                        field.onChange(v)
                        form.setValue('districtId', '')
                        form.setValue('neighborhoodId', '')
                      }}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="İl seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {provincesQuery.data?.map((province) => (
                            <SelectItem key={province.id} value={province.id}>
                              {province.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showDistrictField && (
                  <FormField
                    control={form.control}
                    name="districtId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İlçe</FormLabel>
                        <Select value={field.value || ''} disabled={isLocationReadOnly} onValueChange={(v) => {
                          field.onChange(v)
                          form.setValue('neighborhoodId', '')
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="İlçe seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districtsQuery.data?.map((district) => (
                              <SelectItem key={district.id} value={district.id}>
                                {district.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {showNeighborhoodField && (
                  <FormField
                    control={form.control}
                    name="neighborhoodId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mahalle</FormLabel>
                        <Select value={field.value || ''} disabled={isLocationReadOnly} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Mahalle seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {neighborhoodsQuery.data?.map((neighborhood) => (
                              <SelectItem key={neighborhood.id} value={neighborhood.id}>
                                {neighborhood.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    className="size-4 rounded border border-input"
                  />
                  Aktif yayınla
                </label>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSaving || !officialLocationReady}>
                {isSaving ? 'Kaydediliyor…' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
