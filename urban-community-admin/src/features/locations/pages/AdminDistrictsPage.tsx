import { useState } from 'react'
import { Building } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useProvincesQuery } from '@/features/locations/hooks/useProvinces'
import { useDistrictsQuery } from '@/features/locations/hooks/useDistricts'

export function AdminDistrictsPage() {
  const [search, setSearch] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const { data: provinces } = useProvincesQuery()
  const { data: districts, isLoading, isError } = useDistrictsQuery(selectedProvince || undefined)

  const filtered = districts?.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  ) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="İlçeler"
        description="Sistemdeki tüm ilçeleri ile bağlı olarak görüntüleyin."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>İlçe Listesi</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="size-4" />
              <span>{selectedProvince ? `${filtered.length} ilçe` : 'İl seçin'}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedProvince}
              onChange={(e) => { setSelectedProvince(e.target.value); setSearch('') }}
            >
              <option value="">İl seçin</option>
              {provinces?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Input
              placeholder="İlçe adında ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {!selectedProvince ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Lütfen bir il seçin.
            </div>
          ) : isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">İlçeler yükleniyor...</div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-destructive">İlçeler yüklenemedi.</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">İlçe Adı</th>
                    <th className="text-left p-3 font-medium">Bağlı Olduğu İl</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((district, index) => (
                    <tr key={district.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 text-muted-foreground">{index + 1}</td>
                      <td className="p-3">{district.name}</td>
                      <td className="p-3">
                        {provinces?.find((p) => p.id === district.provinceId)?.name ?? '-'}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-muted-foreground">
                        {search ? 'Eşleşen ilçe bulunamadı.' : 'Bu ile bağlı ilçe bulunmuyor.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}