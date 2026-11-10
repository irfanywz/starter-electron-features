import type { ComponentType } from 'react'
import { Home, Settings, type LucideIcon } from 'lucide-react'
import { HomePage } from '@/features/home'
import { SettingsPage } from '@/features/settings'

export interface AppRoute {
  /** Path absolut, mis. '/' atau '/settings' */
  to: string
  /** Label menu, juga dipakai sebagai aria-label kalau cuma ikon */
  label: string
  Icon: LucideIcon
  Page: ComponentType
  /** Menu hanya aktif kalau path persis sama (dipakai untuk '/') */
  end: boolean
  /**
   * Letak di titlebar:
   * - 'start': menu dengan label, di sebelah kiri
   * - 'end': cuma ikon, di sebelah kanan (sebelum tombol window)
   */
  placement: 'start' | 'end'
}

/**
 * SATU-SATUNYA daftar halaman. Dipakai router (route) dan titlebar (menu).
 * Tambah halaman = tambah satu objek di sini.
 */
export const routes: AppRoute[] = [
  { to: '/', label: 'Home', Icon: Home, Page: HomePage, end: true, placement: 'start' },
  {
    to: '/settings',
    label: 'Settings',
    Icon: Settings,
    Page: SettingsPage,
    end: false,
    placement: 'end'
  }
]
