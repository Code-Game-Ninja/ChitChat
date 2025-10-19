'use client'

import { AuthProvider } from './auth-provider'
import { ErrorBoundary } from '../error-boundary'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ErrorBoundary>
  )
}