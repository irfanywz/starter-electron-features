import { beforeEach, describe, expect, it } from 'vitest'
import { useToastStore } from '@/features/toast/store'

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it('menambah toast dengan tipe default info', () => {
    useToastStore.getState().show('halo', { duration: 0 })
    const [toast] = useToastStore.getState().toasts
    expect(toast).toMatchObject({ message: 'halo', type: 'info' })
  })

  it('dismiss menghapus toast berdasarkan id', () => {
    const id = useToastStore.getState().show('a', { duration: 0 })
    useToastStore.getState().dismiss(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('hanya menyimpan 4 toast terakhir', () => {
    for (let i = 1; i <= 6; i++) {
      useToastStore.getState().show(`pesan ${i}`, { duration: 0 })
    }
    const messages = useToastStore.getState().toasts.map((t) => t.message)
    expect(messages).toEqual(['pesan 3', 'pesan 4', 'pesan 5', 'pesan 6'])
  })
})
