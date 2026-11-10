import { Navigate, createHashRouter, type RouteObject } from 'react-router'
import AppLayout from './AppLayout'
import RouteError from './RouteError'
import { routes } from './routes'

// Hash router (#/settings) karena di production app dimuat dari file://, bukan server.
// Error di halaman ditangkap errorElement di level child, jadi sidebar + titlebar tetap hidup.
// Error di AppLayout sendiri ditangkap errorElement di root (fullscreen).
const pageRoutes = routes.map(({ to, Page }): RouteObject =>
  to === '/' ? { index: true, element: <Page /> } : { path: to.slice(1), element: <Page /> }
)

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError fullscreen />,
    children: [
      {
        errorElement: <RouteError />,
        children: [...pageRoutes, { path: '*', element: <Navigate to="/" replace /> }]
      }
    ]
  }
])
