import { useEffect } from 'react'
import { useNavigate, useRouteError } from 'react-router'
import ErrorFallback from './ErrorFallback'
import { api } from '@/lib/api'
import { errorStack } from '@/lib/errors'

/** errorElement buat route. `fullscreen` = dipakai di level root (AppLayout ikut diganti). */
export default function RouteError({ fullscreen }: { fullscreen?: boolean }) {
  const error = useRouteError()
  const navigate = useNavigate()

  useEffect(() => {
    api.log.error(`Route error: ${errorStack(error)}`)
  }, [error])

  return (
    <ErrorFallback
      error={error}
      fullscreen={fullscreen}
      onReset={() => navigate('/', { replace: true })}
      resetLabel="Go home"
    />
  )
}
