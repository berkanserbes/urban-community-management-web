import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const profileSecuritySchema = z
  .object({
    currentPassword: z.string().min(6, 'Mevcut şifre gerekli'),
    newPassword: z.string().min(8, 'Yeni şifre en az 8 karakter olmalı'),
    confirmPassword: z.string().min(8, 'Yeni şifre tekrar gerekli'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })

export type ProfileSecurityFormValues = z.infer<typeof profileSecuritySchema>

type ProfileSecurityFormProps = {
  onSubmit: (values: ProfileSecurityFormValues) => void
  isPending?: boolean
}

export function ProfileSecurityForm({ onSubmit, isPending }: ProfileSecurityFormProps) {
  const form = useForm<ProfileSecurityFormValues>({
    resolver: zodResolver(profileSecuritySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Şifre Değiştir</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mevcut şifre</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mevcut şifre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yeni şifre</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Yeni şifre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yeni şifre tekrar</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Yeni şifre tekrar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={isPending}>
                {isPending ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
