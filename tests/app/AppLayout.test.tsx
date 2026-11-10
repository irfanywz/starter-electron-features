import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import AppLayout from '@/app/AppLayout'
import { routes } from '@/app/routes'

// Versi memory router supaya test tidak bergantung pada hash di jsdom
function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: routes.map((r) =>
          r.to === '/'
            ? { index: true, element: <div>isi halaman</div> }
            : { path: r.to.slice(1), element: <div>isi halaman</div> }
        )
      }
    ],
    { initialEntries: [path] }
  )
  return render(<RouterProvider router={router} />)
}

describe('AppLayout', () => {
  it('menu Home ada di titlebar, bukan sidebar', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(document.querySelector('nav')).toBeNull()
  })

  it('Settings tampil sebagai ikon di kanan (label hanya di aria)', () => {
    renderAt('/')
    const settings = screen.getByRole('link', { name: 'Settings' })
    expect(settings).toHaveAttribute('href', '/settings')
    expect(settings).not.toHaveTextContent('Settings')
  })
})
