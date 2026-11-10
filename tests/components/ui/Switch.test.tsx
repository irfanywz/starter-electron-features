import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Switch from '@/components/ui/Switch'

describe('Switch', () => {
  it('mengirim nilai kebalikan saat diklik', () => {
    const onChange = vi.fn()
    render(<Switch label="Dark mode" checked={false} onChange={onChange} />)

    fireEvent.click(screen.getByRole('switch', { name: 'Dark mode' }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('tidak bereaksi saat disabled', () => {
    const onChange = vi.fn()
    render(<Switch label="Dark mode" checked disabled onChange={onChange} />)

    expect(screen.getByRole('switch')).toBeDisabled()
  })
})
