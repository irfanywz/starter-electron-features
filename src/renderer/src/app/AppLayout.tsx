import { Outlet } from 'react-router'
import TitleBar from './TitleBar'
import NavItem from './NavItem'
import { routes } from './routes'
import { ToastHost } from '@/features/toast'

// Menu diambil dari routes.tsx. Tidak perlu diedit saat nambah halaman.
export default function AppLayout() {
  const startRoutes = routes.filter((r) => r.placement === 'start')
  const endRoutes = routes.filter((r) => r.placement === 'end')

  return (
    <div className="flex h-full flex-col">
      <TitleBar
        start={startRoutes.map((route) => (
          <NavItem key={route.to} route={route} />
        ))}
        end={endRoutes.map((route) => (
          <NavItem key={route.to} route={route} iconOnly />
        ))}
      />

      <main className="min-h-0 flex-1 overflow-auto p-6">
        <Outlet />
      </main>

      <ToastHost />
    </div>
  )
}
