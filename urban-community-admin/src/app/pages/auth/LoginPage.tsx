import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api/axios'
import { unwrapApiResult } from '@/lib/api/result'
import type { LoginResponse, AuthUser } from '@/types/api.types'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre gereklidir'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(() => {
    const authError = sessionStorage.getItem('auth_error')
    if (authError) {
      sessionStorage.removeItem('auth_error')
    }
    return authError
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError(null)
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', data)
      const payload = unwrapApiResult(response.data)
      if (payload.role === 'Citizen') {
        setServerError('Vatandaş hesapları mobil uygulamayı kullanmalıdır.')
        return
      }
      const user: AuthUser = {
        id: payload.userId,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
        neighborhoodId: payload.neighborhoodId ?? null,
        mustChangePassword: payload.mustChangePassword,
      }
      login(payload.accessToken, payload.refreshToken, user)
      navigate(
        user.mustChangePassword
          ? '/change-required-password'
          : user.role === 'Admin'
            ? '/admin'
            : '/official',
      )
    } catch (err) {
      console.error('[Login Error]', err)
      setServerError('E-posta veya şifre hatalı.')
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-xl border shadow-sm p-8 space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-lg">UC</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Urban Community</h1>
          <p className="text-sm text-muted-foreground">Yönetim Paneli</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ornek@belediye.gov.tr"
              className="w-full px-3 py-2 rounded-md border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-md border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}
