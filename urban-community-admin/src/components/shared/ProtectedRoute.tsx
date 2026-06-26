import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import type { UserRole } from '@/types/api.types'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated())
  const { isAuthenticated, user, accessToken } = useAuthStore()

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    return () => unsub()
  }, [])

  if (!hydrated) {
    return null
  }

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace />
  }

  if (user?.mustChangePassword) {
    return <Navigate to="/change-required-password" replace />
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
