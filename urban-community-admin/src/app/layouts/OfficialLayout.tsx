import { Outlet, NavLink, useNavigate } from 'react-router'
import { LayoutDashboard, FileText, Megaphone, Lightbulb, UserCircle2, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge'

const navItems = [
  { to: '/official', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/official/reports', icon: FileText, label: 'Raporlarım' },
  { to: '/official/announcements', icon: Megaphone, label: 'Duyurular' },
  { to: '/official/suggestions', icon: Lightbulb, label: 'Öneriler' },
  { to: '/official/profile', icon: UserCircle2, label: 'Profil' },
]

export function OfficialLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

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
      <aside
        className={cn(
          'flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
          sidebarOpen ? 'w-60' : 'w-16',
        )}
      >
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
        </nav>

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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <div className="flex-1" />
          <NotificationBadge onClick={() => navigate('/official/notifications')} />
          <ThemeToggle />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            {' · '}
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full border">
              Yetkili
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
