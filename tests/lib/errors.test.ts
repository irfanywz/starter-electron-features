import { describe, expect, it } from 'vitest'
import { errorMessage } from '@/lib/errors'

describe('errorMessage', () => {
  it('mengambil message dari Error', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom')
  })

  it('mengembalikan string apa adanya', () => {
    expect(errorMessage('gagal')).toBe('gagal')
  })

  it('membaca statusText dari error react-router', () => {
    expect(errorMessage({ status: 404, statusText: 'Not Found' })).toBe('Not Found')
  })

  it('fallback untuk nilai lain', () => {
    expect(errorMessage(42)).toBe('Unknown error')
  })
})
