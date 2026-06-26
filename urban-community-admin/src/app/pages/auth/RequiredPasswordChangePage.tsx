import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api/axios'
import { unwrapApiResult } from '@/lib/api/result'
import { useAuthStore } from '@/stores/auth.store'
import type { ApiResult } from '@/types/api.types'

const schema = z.object({
  currentPassword: z.string().min(1, 'Geçici şifre zorunludur'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır'),
  confirmNewPassword: z.string(),
}).refine((value) => value.newPassword === value.confirmNewPassword, {
  path: ['confirmNewPassword'],
  message: 'Şifreler eşleşmiyor',
}).refine((value) => value.currentPassword !== value.newPassword, {
  path: ['newPassword'],
  message: 'Yeni şifre geçici şifreden farklı olmalıdır',
})

type FormValues = z.infer<typeof schema>
type Response = ApiResult<{ userId: string; message: string }>

export function RequiredPasswordChangePage() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const submit = async (values: FormValues) => {
    try {
      const response = await api.put<Response>('/api/users/me/required-password', values)
      unwrapApiResult(response.data)
      logout()
      sessionStorage.setItem('auth_error', 'Şifreniz güncellendi. Yeni şifrenizle giriş yapın.')
      navigate('/login', { replace: true })
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Şifre değiştirilemedi.',
      })
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
      <div className="mb-6 space-y-2">
        <h1 className="text-xl font-semibold">Geçici Şifreyi Değiştir</h1>
        <p className="text-sm text-muted-foreground">
          Yönetim panelini kullanmadan önce size verilen geçici şifreyi değiştirin.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(submit)}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="currentPassword">Geçici şifre</label>
          <Input id="currentPassword" type="password" {...register('currentPassword')} />
          {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="newPassword">Yeni şifre</label>
          <Input id="newPassword" type="password" {...register('newPassword')} />
          {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="confirmNewPassword">Yeni şifre tekrarı</label>
          <Input id="confirmNewPassword" type="password" {...register('confirmNewPassword')} />
          {errors.confirmNewPassword && <p className="text-xs text-destructive">{errors.confirmNewPassword.message}</p>}
        </div>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
        >
          Çıkış Yap
        </Button>
      </form>
    </div>
  )
}
