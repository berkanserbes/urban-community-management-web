import { Outlet, Navigate, useLocation } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'

export function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (location.pathname === '/change-required-password') {
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />
    }

    if (!user.mustChangePassword) {
      return <Navigate to={user.role === 'Admin' ? '/admin' : '/official'} replace />
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Outlet />
      </div>
    )
  }

  if (isAuthenticated && user) {
    if (user.mustChangePassword) {
      return <Navigate to="/change-required-password" replace />
    }
    const redirect = user.role === 'Admin' ? '/admin' : '/official'
    return <Navigate to={redirect} replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <Outlet />
    </div>
  )
}
