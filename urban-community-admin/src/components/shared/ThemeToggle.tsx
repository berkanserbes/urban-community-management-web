import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç'}
      className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
