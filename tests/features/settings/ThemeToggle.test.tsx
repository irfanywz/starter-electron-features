import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ThemeToggle from '@/features/settings/ThemeToggle'
import { useSettingsStore } from '@/features/settings/store'
import type { Settings } from '@shared/settings'

describe('ThemeToggle', () => {
  beforeEach(() => {
    useSettingsStore.setState({ settings: { theme: 'system' } as Settings })
  })

  it('menandai tema yang sedang aktif', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('mengirim perubahan tema ke main process', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
    expect(window.api.settings.set).toHaveBeenCalledWith({ theme: 'dark' })
  })
})
