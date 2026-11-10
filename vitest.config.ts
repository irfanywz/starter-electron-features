import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Alias sama dengan electron.vite.config.ts (renderer)
const shared = resolve(__dirname, 'src/shared')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': shared,
      '@': resolve(__dirname, 'src/renderer/src')
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}']
  }
})
