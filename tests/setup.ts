import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock window.api (preload) supaya renderer bisa dites tanpa Electron.
// lib/api.ts membaca window.api saat di-import, jadi mock ini harus sudah ada sebelum test jalan.
function createApiMock() {
  return {
    app: {
      getInfo: vi.fn().mockResolvedValue({ autoStartSupported: false }),
      openExternal: vi.fn(),
      openDataDir: vi.fn()
    },
    window: { minimize: vi.fn(), toggleMaximize: vi.fn(), close: vi.fn() },
    settings: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue({ settings: null, errors: {} }),
      onChange: vi.fn(() => () => {})
    },
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    platform: 'win32'
  }
}

Object.defineProperty(window, 'api', { value: createApiMock(), writable: true, configurable: true })

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
