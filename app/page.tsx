"use client"

import { useAuth } from "@/components/providers/auth-provider"
import AuthPage from "@/components/auth/auth-page"
import ChatLayout from "@/components/chat/chat-layout"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-surface-light border-t-primary rounded-full animate-spin" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <ChatLayout /> : <AuthPage />
}
