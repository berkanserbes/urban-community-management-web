import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'

type ComingSoonPageProps = {
  title: string
  description: string
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle>Yakinda</CardTitle>
          <CardDescription>Bu modulu bir sonraki adimda dolduracagiz.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Sayfa iskeleti hazir. Veri entegrasyonu ve formlar siradaki iterasyonda eklenecek.
        </CardContent>
      </Card>
    </div>
  )
}
