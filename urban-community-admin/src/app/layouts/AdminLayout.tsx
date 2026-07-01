import { Outlet, NavLink, useNavigate, useLocation } from 'react-router'
import {
  LayoutDashboard,
  FileText,
  Users,
  Tag,
  Globe,
  Building2,
  Megaphone,
  Lightbulb,
  UserCircle2,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Map,
  MapPin,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/reports', icon: FileText, label: 'Raporlar' },
  { to: '/admin/users', icon: Users, label: 'Kullanıcılar' },
  { to: '/admin/categories', icon: Tag, label: 'Kategoriler' },
  { to: '/admin/departments', icon: Building2, label: 'Birimler' },
  { to: '/admin/organizations', icon: Building2, label: 'Kurumlar' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Duyurular' },
  { to: '/admin/suggestions', icon: Lightbulb, label: 'Öneriler' },
  { to: '/admin/profile', icon: UserCircle2, label: 'Profil' },
]

const locationSubItems = [
  { to: '/admin/provinces', icon: Map, label: 'İller' },
  { to: '/admin/districts', icon: Building2, label: 'İlçeler' },
  { to: '/admin/neighborhoods', icon: MapPin, label: 'Mahalleler' },
]

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [locationsOpen, setLocationsOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const isLocationsActive = location.pathname.startsWith('/admin/provinces') || 
                           location.pathname.startsWith('/admin/districts') || 
                           location.pathname.startsWith('/admin/neighborhoods')

  const handleLogout = async () => {
    try {
      const { logoutApi } = await import('@/lib/api/auth')
      await logoutApi()
    } catch {
      // logout API call is best-effort
    }
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
          sidebarOpen ? 'w-60' : 'w-16',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-xs font-bold">UC</span>
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-sidebar-foreground text-sm truncate">
              Urban Community
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}

          {/* Şehir Yönetimi Dropdown */}
          {sidebarOpen && (
            <div>
              <button
                onClick={() => setLocationsOpen(!locationsOpen)}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isLocationsActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <span className="flex items-center gap-3">
                  <Globe className="size-4 shrink-0" />
                  <span>Şehir Yönetimi</span>
                </span>
                <ChevronDown
                  className={cn('size-4 transition-transform', locationsOpen && 'rotate-180')}
                />
              </button>
              {locationsOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2">
                  {locationSubItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-primary'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )
                      }
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User */}
        <div className="p-2 border-t border-sidebar-border">
          {sidebarOpen && (
            <div className="px-3 py-2 text-xs text-sidebar-foreground/60 truncate">
              {user?.firstName} {user?.lastName}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="size-4 shrink-0" />
            {sidebarOpen && <span>Çıkış</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <div className="flex-1" />
          <NotificationBadge onClick={() => navigate('/admin/notifications')} />
          <ThemeToggle />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            {' · '}
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
