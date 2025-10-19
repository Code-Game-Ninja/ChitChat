"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc, serverTimestamp, onSnapshot, collection, query, where } from "firebase/firestore"

interface UserPresence {
  uid: string
  status: "online" | "offline" | "away"
  lastSeen: number
}

// Utility function to safely convert Firestore timestamps to milliseconds
function convertFirestoreTimestamp(timestamp: any): number {
  if (!timestamp) return Date.now()
  
  if (typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis()
  } else if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().getTime()
  } else if (typeof timestamp === 'number') {
    return timestamp
  } else if (timestamp.seconds) {
    // Handle Firestore timestamp object format
    return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
  }
  
  return Date.now()
}

export function usePresence(targetUserId?: string) {
  const [userPresence, setUserPresence] = useState<UserPresence | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(false)

  // Update current user's presence status
  useEffect(() => {
    if (!auth.currentUser) return

    const updateUserPresence = async (status: "online" | "offline" | "away") => {
      try {
        await updateDoc(doc(db, "users", auth.currentUser!.uid), {
          status,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } catch (error) {
        console.error("Error updating presence:", error)
      }
    }

    // Set user online when component mounts
    updateUserPresence("online")

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateUserPresence("away")
      } else {
        updateUserPresence("online")
      }
    }

    // Handle page unload (user leaving)
    const handleBeforeUnload = () => {
      updateUserPresence("offline")
    }

    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      updateUserPresence("online")
    }

    const handleOffline = () => {
      setIsOnline(false)
      updateUserPresence("offline")
    }

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set initial online status
    setIsOnline(navigator.onLine)

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      
      // Set user offline when unmounting
      updateUserPresence("offline")
    }
  }, [auth.currentUser])

  // Listen to target user's presence if specified
  useEffect(() => {
    if (!targetUserId) return

    const userDocRef = doc(db, "users", targetUserId)
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setUserPresence({
          uid: targetUserId,
          status: data.status || "offline",
          lastSeen: convertFirestoreTimestamp(data.lastSeen),
        })
      }
    }, (error) => {
      console.error("Error listening to user presence:", error)
    })

    return () => unsubscribe()
  }, [targetUserId])

  // Helper function to get formatted last seen
  const getLastSeenText = (lastSeen: number) => {
    const now = Date.now()
    const diffMs = now - lastSeen
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Active now"
    if (diffMins < 60) return `Active ${diffMins}m ago`
    if (diffHours < 24) return `Active ${diffHours}h ago`
    if (diffDays === 1) return "Active yesterday"
    if (diffDays < 7) return `Active ${diffDays}d ago`
    return `Active ${Math.floor(diffDays / 7)}w ago`
  }

  // Helper function to determine if user is currently active
  const isUserActive = (presence: UserPresence | null) => {
    if (!presence) return false
    if (presence.status === "online") return true
    
    // Consider user active if last seen within 5 minutes
    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000
    return presence.lastSeen > fiveMinutesAgo
  }

  return {
    userPresence,
    isOnline,
    isUserActive: isUserActive(userPresence),
    lastSeenText: userPresence ? getLastSeenText(userPresence.lastSeen) : "Unknown",
    status: userPresence?.status || "offline",
  }
}

// Hook for monitoring multiple users' presence
export function useMultiplePresence(userIds: string[]) {
  const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(new Map())

  useEffect(() => {
    if (userIds.length === 0) return

    const unsubscribes: (() => void)[] = []

    userIds.forEach((userId) => {
      const userDocRef = doc(db, "users", userId)
      
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          
          setPresenceMap((prev) => {
            const newMap = new Map(prev)
            newMap.set(userId, {
              uid: userId,
              status: data.status || "offline",
              lastSeen: convertFirestoreTimestamp(data.lastSeen),
            })
            return newMap
          })
        }
      }, (error) => {
        console.error(`Error listening to user ${userId} presence:`, error)
      })

      unsubscribes.push(unsubscribe)
    })

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [userIds])

  return presenceMap
}