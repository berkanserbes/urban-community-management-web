import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router'
import { AuthLayout } from './layouts/AuthLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { OfficialLayout } from './layouts/OfficialLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { RouteFallback } from '@/components/shared/RouteFallback'
import type { NotificationDto } from '@/types/api.types'

const LoginPage = lazy(async () => {
  const module = await import('./pages/auth/LoginPage')
  return { default: module.LoginPage }
})

const RequiredPasswordChangePage = lazy(async () => {
  const module = await import('./pages/auth/RequiredPasswordChangePage')
  return { default: module.RequiredPasswordChangePage }
})

const AdminDashboardPage = lazy(async () => {
  const module = await import('./pages/admin/DashboardPage')
  return { default: module.AdminDashboardPage }
})

const OfficialDashboardPage = lazy(async () => {
  const module = await import('./pages/official/DashboardPage')
  return { default: module.OfficialDashboardPage }
})

const AdminReportsPage = lazy(async () => {
  const module = await import('@/features/reports/pages/AdminReportsPage')
  return { default: module.AdminReportsPage }
})

const OfficialReportsPage = lazy(async () => {
  const module = await import('@/features/reports/pages/OfficialReportsPage')
  return { default: module.OfficialReportsPage }
})

const AdminAnnouncementsPage = lazy(async () => {
  const module = await import('@/features/announcements/pages/AdminAnnouncementsPage')
  return { default: module.AdminAnnouncementsPage }
})

const OfficialAnnouncementsPage = lazy(async () => {
  const module = await import('@/features/announcements/pages/OfficialAnnouncementsPage')
  return { default: module.OfficialAnnouncementsPage }
})

const ProfilePage = lazy(async () => {
  const module = await import('@/features/profile/pages/ProfilePage')
  return { default: module.ProfilePage }
})

const AdminUsersPage = lazy(async () => {
  const module = await import('@/features/users/pages/AdminUsersPage')
  return { default: module.AdminUsersPage }
})

const AdminCategoriesPage = lazy(async () => {
  const module = await import('@/features/categories/pages/AdminCategoriesPage')
  return { default: module.AdminCategoriesPage }
})

const AdminDepartmentsPage = lazy(async () => {
  const module = await import('@/features/departments/pages/AdminDepartmentsPage')
  return { default: module.AdminDepartmentsPage }
})

const AdminOrganizationsPage = lazy(async () => {
  const module = await import('@/features/organizations/pages/AdminOrganizationsPage')
  return { default: module.AdminOrganizationsPage }
})

const AdminProvincesPage = lazy(async () => {
  const module = await import('@/features/locations/pages/AdminProvincesPage')
  return { default: module.AdminProvincesPage }
})

const AdminDistrictsPage = lazy(async () => {
  const module = await import('@/features/locations/pages/AdminDistrictsPage')
  return { default: module.AdminDistrictsPage }
})

const AdminNeighborhoodsPage = lazy(async () => {
  const module = await import('@/features/locations/pages/AdminNeighborhoodsPage')
  return { default: module.AdminNeighborhoodsPage }
})

const ReportDetailPage = lazy(async () => {
  const module = await import('@/features/reports/pages/ReportDetailPage')
  return { default: module.ReportDetailPage }
})

const NotificationsPage = lazy(async () => {
  const module = await import('@/features/notifications/pages/NotificationsPage')
  return { default: module.NotificationsPage }
})

const AdminSuggestionsPage = lazy(async () => {
  const module = await import('@/features/suggestions/pages/AdminSuggestionsPage')
  return { default: module.AdminSuggestionsPage }
})

const OfficialSuggestionsPage = lazy(async () => {
  const module = await import('@/features/suggestions/pages/OfficialSuggestionsPage')
  return { default: module.OfficialSuggestionsPage }
})

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

function NotificationsRoutePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const basePath = location.pathname.startsWith('/official') ? '/official' : '/admin'

  const navigateToRelated = (notification: NotificationDto) => {
    const id = notification.relatedEntityId
    if (!id) return

    switch (notification.relatedEntityType) {
      case 'Report':
        navigate(`${basePath}/reports/${id}`)
        break
      case 'Suggestion':
        navigate(`${basePath}/suggestions?detail=${id}`)
        break
      case 'Announcement':
        navigate(`${basePath}/announcements`)
        break
      default:
        break
    }
  }

  return <NotificationsPage navigateToRelated={navigateToRelated} />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LazyPage><LoginPage /></LazyPage>} />
          <Route
            path="/change-required-password"
            element={<LazyPage><RequiredPasswordChangePage /></LazyPage>}
          />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<LazyPage><AdminDashboardPage /></LazyPage>} />
            <Route path="/admin/profile" element={<LazyPage><ProfilePage /></LazyPage>} />
            <Route path="/admin/reports" element={<LazyPage><AdminReportsPage /></LazyPage>} />
            <Route path="/admin/users" element={<LazyPage><AdminUsersPage /></LazyPage>} />
            <Route path="/admin/categories" element={<LazyPage><AdminCategoriesPage /></LazyPage>} />
            <Route path="/admin/provinces" element={<LazyPage><AdminProvincesPage /></LazyPage>} />
            <Route path="/admin/districts" element={<LazyPage><AdminDistrictsPage /></LazyPage>} />
            <Route path="/admin/neighborhoods" element={<LazyPage><AdminNeighborhoodsPage /></LazyPage>} />
            <Route path="/admin/departments" element={<LazyPage><AdminDepartmentsPage /></LazyPage>} />
            <Route path="/admin/organizations" element={<LazyPage><AdminOrganizationsPage /></LazyPage>} />
            <Route path="/admin/reports/:id" element={<LazyPage><ReportDetailPage /></LazyPage>} />
            <Route path="/admin/notifications" element={<LazyPage><NotificationsRoutePage /></LazyPage>} />
            <Route path="/admin/announcements" element={<LazyPage><AdminAnnouncementsPage /></LazyPage>} />
            <Route path="/admin/suggestions" element={<LazyPage><AdminSuggestionsPage /></LazyPage>} />
          </Route>
        </Route>

        {/* Official */}
        <Route element={<ProtectedRoute allowedRoles={['Official']} />}>
          <Route element={<OfficialLayout />}>
            <Route path="/official" element={<LazyPage><OfficialDashboardPage /></LazyPage>} />
            <Route path="/official/profile" element={<LazyPage><ProfilePage /></LazyPage>} />
            <Route path="/official/reports" element={<LazyPage><OfficialReportsPage /></LazyPage>} />
            <Route path="/official/reports/:id" element={<LazyPage><ReportDetailPage /></LazyPage>} />
            <Route path="/official/notifications" element={<LazyPage><NotificationsRoutePage /></LazyPage>} />
            <Route path="/official/announcements" element={<LazyPage><OfficialAnnouncementsPage /></LazyPage>} />
            <Route path="/official/suggestions" element={<LazyPage><OfficialSuggestionsPage /></LazyPage>} />
          </Route>
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={
          <div className="min-h-screen flex items-center justify-center text-muted-foreground">
            Bu sayfaya erişim yetkiniz yok.
          </div>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
