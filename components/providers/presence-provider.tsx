"use client"

import { useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "./auth-provider"

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading || !user) return

    const updateUserPresence = async (status: "online" | "offline" | "away") => {
      try {
        if (user) {
          await updateDoc(doc(db, "users", user.uid), {
            status,
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        }
      } catch (error) {
        console.error("Error updating presence:", error)
      }
    }

    // Set user online when app loads
    updateUserPresence("online")

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (!user) return
      
      if (document.hidden) {
        updateUserPresence("away")
      } else {
        updateUserPresence("online")
      }
    }

    // Handle page unload (user leaving)
    const handleBeforeUnload = () => {
      if (user) {
        // Fallback to regular update
        updateUserPresence("offline")
      }
    }

    // Handle online/offline events
    const handleOnline = () => {
      if (user) {
        updateUserPresence("online")
      }
    }

    const handleOffline = () => {
      if (user) {
        updateUserPresence("offline")
      }
    }

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      
      // Set user offline when component unmounts
      if (user) {
        updateUserPresence("offline")
      }
    }
  }, [user, loading])

  return <>{children}</>
}