import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (/^(https?:|blob:|data:)/i.test(url)) return url

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
  if (!baseUrl) return url

  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`
}
