import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import ErrorBoundary from '@/app/ErrorBoundary'
import { api } from '@/lib/api'
import { errorStack } from '@/lib/errors'
import './styles.css'

// Error yang nggak ketangkep di renderer ikut masuk ke file log (<dataDir>/logs/main.log)
window.addEventListener('error', (e) => {
  api.log.error(`Uncaught: ${e.message}\n${errorStack(e.error)}`)
})
window.addEventListener('unhandledrejection', (e) => {
  api.log.error(`Unhandled rejection: ${errorStack(e.reason)}`)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
