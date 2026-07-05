import { useState, useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNeighborhoodsQuery } from '@/features/neighborhoods/hooks/useNeighborhoods'
import { useProvincesQuery } from '@/features/locations/hooks/useProvinces'
import { useDistrictsQuery } from '@/features/locations/hooks/useDistricts'

export function AdminNeighborhoodsPage() {
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [nameSearch, setNameSearch] = useState('')

  const provincesQuery = useProvincesQuery()
  const districtsQuery = useDistrictsQuery(selectedProvinceId || undefined)

  const neighborhoodsQuery = useNeighborhoodsQuery({
    provinceId: selectedProvinceId || undefined,
    districtId: selectedDistrictId || undefined,
  })

  const neighborhoods = useMemo(() => neighborhoodsQuery.data ?? [], [neighborhoodsQuery.data])

  const filtered = useMemo(() => {
    if (!nameSearch.trim()) return neighborhoods
    const q = nameSearch.toLowerCase()
    return neighborhoods.filter((n) => n.name.toLowerCase().includes(q))
  }, [neighborhoods, nameSearch])

  const handleProvinceChange = (value: string) => {
    setSelectedProvinceId(value)
    setSelectedDistrictId('')
  }

  const handleDistrictChange = (value: string) => {
    setSelectedDistrictId(value)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mahalleler"
        description="Sistemdeki mahalleleri şehir ve ilçe bazında görüntüleyin."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mahalle Listesi</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              <span>{filtered.length} mahalle</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr]">
            <Select value={selectedProvinceId} onValueChange={handleProvinceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Şehir seçin" />
              </SelectTrigger>
              <SelectContent>
                {provincesQuery.data?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDistrictId}
              onValueChange={handleDistrictChange}
              disabled={!selectedProvinceId}
            >
              <SelectTrigger>
                <SelectValue placeholder="İlçe seçin" />
              </SelectTrigger>
              <SelectContent>
                {districtsQuery.data?.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Mahalle adında ara..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>

          {!selectedProvinceId || !selectedDistrictId ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Mahalleleri görüntülemek için şehir ve ilçe seçin.
            </div>
          ) : neighborhoodsQuery.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Mahalleler yükleniyor...
            </div>
          ) : neighborhoodsQuery.isError ? (
            <div className="py-12 text-center text-sm text-destructive">
              Mahalleler yüklenemedi.
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">Mahalle Adı</th>
                    <th className="text-left p-3 font-medium">İlçe</th>
                    <th className="text-left p-3 font-medium">Şehir</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((n, index) => (
                    <tr key={n.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 text-muted-foreground">{index + 1}</td>
                      <td className="p-3">{n.name}</td>
                      <td className="p-3">{n.districtName ?? '-'}</td>
                      <td className="p-3">{n.provinceName ?? '-'}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground">
                        {nameSearch ? 'Eşleşen mahalle bulunamadı.' : 'Henüz mahalle bulunmuyor.'}
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
