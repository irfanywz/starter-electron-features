import type { ReactNode } from 'react'
import { Minus, Square, X } from 'lucide-react'
import logo from '@/assets/logo.png'
import { api } from '@/lib/api'

interface Props {
  /** Konten setelah nama app, di kiri (mis. menu navigasi) */
  start?: ReactNode
  /** Konten sebelum tombol window, di kanan (mis. ikon Settings) */
  end?: ReactNode
}

/**
 * Titlebar sekaligus navigasi utama. Area kosong di tengahnya bisa di-drag.
 * Dipakai juga di ErrorFallback yang berada di luar router, jadi tanpa slot pun harus tetap jalan.
 */
export default function TitleBar({ start, end }: Props) {
  const isMac = api.platform === 'darwin'

  return (
    <header className="drag flex h-9 shrink-0 items-center border-b border-border bg-surface">
      <div className="flex items-center gap-2 pl-3">
        <img src={logo} alt="" draggable={false} className="h-4 w-4" />
        <span className="text-xs font-medium text-muted">Starter Minimal</span>
      </div>

      <div className="no-drag ml-3 flex h-full items-center gap-1">{start}</div>

      <div className="flex-1" />

      <div className="no-drag flex h-full items-center">
        {end}

        {!isMac && (
          <>
            <button
              className="grid h-full w-11 place-items-center text-muted hover:bg-fg/10"
              onClick={() => api.window.minimize()}
              aria-label="Minimize"
            >
              <Minus size={14} />
            </button>
            <button
              className="grid h-full w-11 place-items-center text-muted hover:bg-fg/10"
              onClick={() => api.window.toggleMaximize()}
              aria-label="Maximize"
            >
              <Square size={12} />
            </button>
            {/* Hide ke tray atau quit: setting closeToTray */}
            <button
              className="grid h-full w-11 place-items-center text-muted hover:bg-red-500 hover:text-white"
              onClick={() => api.window.close()}
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
