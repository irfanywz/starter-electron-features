import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['out', 'release', 'dist', 'node_modules', '.dev-data', '.electron-cache'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Main process + preload + config + scripts: Node
    files: [
      'src/main/**/*.ts',
      'src/preload/**/*.ts',
      'electron.vite.config.ts',
      'vitest.config.ts',
      'scripts/**/*.mjs',
      'eslint.config.mjs'
    ],
    languageOptions: { globals: globals.node }
  },
  {
    // Renderer: browser + React hooks rules
    files: ['src/renderer/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules }
  },
  {
    // Fitur tidak boleh impor fitur lain lewat file dalamnya (pakai index.ts),
    // dan tidak boleh impor app/. Kalau perlu berbagi, pindahkan ke lib/ atau components/ui/.
    files: ['src/renderer/src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/**', '@/features/*/*'],
              message: 'Fitur hanya boleh impor dari index.ts fitur lain, dan tidak boleh dari app/.'
            }
          ]
        }
      ]
    }
  },
  {
    // components/ui dan lib tidak boleh tahu soal fitur atau app
    files: ['src/renderer/src/components/**/*.{ts,tsx}', 'src/renderer/src/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/**', '@/features/**'],
              message: 'components/ dan lib/ tidak boleh impor dari app/ atau features/.'
            }
          ]
        }
      ]
    }
  },
  {
    // Tests: browser (jsdom) + konfigurasi vitest itu sendiri
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser }
  },
  // Taruh paling akhir: matiin rule yang bentrok sama Prettier
  prettier
)
