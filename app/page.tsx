"use client"

import { useAuth } from "@/components/providers/auth-provider"
import AuthPage from "@/components/auth/auth-page"
import ChatLayout from "@/components/chat/chat-layout"
import Link from "next/link"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-surface-light border-t-primary rounded-full animate-spin" />
          <p className="text-text-secondary">Loading...</p>
          <Link 
            href="/debug" 
            className="text-xs text-blue-500 hover:underline"
          >
            Debug Auth Issues
          </Link>
        </div>
      </div>
    )
  }

  return user ? <ChatLayout /> : <AuthPage />
}
