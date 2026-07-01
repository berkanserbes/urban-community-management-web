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
import type { CategoryDto } from '@/types/api.types'

const schema = z.object({
  name: z.string().min(2, 'Kategori adı en az 2 karakter olmalı'),
  description: z.string().optional(),
  iconUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
})

export type CategoryFormValues = z.infer<typeof schema>

type CategoryFormDialogProps = {
  open: boolean
  editing: CategoryDto | null
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CategoryFormValues) => void
}

export function CategoryFormDialog({
  open,
  editing,
  isSaving,
  onOpenChange,
  onSubmit,
}: CategoryFormDialogProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', iconUrl: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: editing?.name ?? '',
        description: editing?.description ?? '',
        iconUrl: editing?.iconUrl ?? '',
      })
    }
  }, [open, editing, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="örn. Yol Hasarı" {...field} />
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
                    <Textarea placeholder="Kategori açıklaması (isteğe bağlı)" className="min-h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="iconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İkon URL (isteğe bağlı)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
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
