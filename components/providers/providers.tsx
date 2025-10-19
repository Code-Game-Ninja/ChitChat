'use client'

import { AuthProvider } from './auth-provider'
import { PresenceProvider } from './presence-provider'
import { ErrorBoundary } from '../error-boundary'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PresenceProvider>
          {children}
        </PresenceProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}