import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { User, onAuthStateChanged } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(
        auth, 
        (user) => {
          console.log('AuthProvider: Auth state changed', user?.uid || 'null')
          setUser(user)
          setLoading(false)
          setError(null)
        },
        (error) => {
          console.error('AuthProvider: Auth state change error', error)
          setUser(null)
          setLoading(false)
          setError('Authentication error. Please refresh the page.')
        }
      )

      return unsubscribe
    } catch (err) {
      console.error('AuthProvider: Failed to initialize auth listener', err)
      setError('Failed to initialize authentication. Please check your internet connection.')
      setLoading(false)
      return () => {}
    }
  }, [])

  // Show error state if Firebase failed to initialize
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-yellow-200">
          <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Issue</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}