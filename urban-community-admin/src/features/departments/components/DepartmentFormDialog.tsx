import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { DepartmentWithStatsDto } from '@/types/api.types'

const schema = z.object({
  name: z.string().min(2, 'Birim adı en az 2 karakter olmalı'),
  description: z.string().optional(),
})

export type DepartmentFormValues = z.infer<typeof schema>

type DepartmentFormDialogProps = {
  open: boolean
  editing: DepartmentWithStatsDto | null
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DepartmentFormValues) => void
}

export function DepartmentFormDialog({
  open,
  editing,
  isSaving,
  onOpenChange,
  onSubmit,
}: DepartmentFormDialogProps) {
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: editing?.name ?? '',
        description: editing?.description ?? '',
      })
    }
  }, [open, editing, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Birimi Düzenle' : 'Yeni Birim'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birim Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="örn. Yol ve Altyapı Müdürlüğü" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Birim açıklaması (isteğe bağlı)"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Kaydediliyor…' : editing ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
