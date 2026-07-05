import { useState } from 'react'
import { Map } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useProvincesQuery } from '@/features/locations/hooks/useProvinces'

export function AdminProvincesPage() {
  const [search, setSearch] = useState('')
  const { data: provinces, isLoading, isError } = useProvincesQuery()

  const filtered = provinces?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  ) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="İller"
        description="Sistemdeki tüm illeri görüntüleyin."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>İl Listesi</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Map className="size-4" />
              <span>{filtered.length} il</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="İl adında ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">İller yükleniyor...</div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-destructive">İller yüklenemedi.</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">İl Adı</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((province, index) => (
                    <tr key={province.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 text-muted-foreground">{index + 1}</td>
                      <td className="p-3">{province.name}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-6 text-center text-muted-foreground">
                        {search ? 'Eşleşen il bulunamadı.' : 'Henüz il bulunmuyor.'}
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