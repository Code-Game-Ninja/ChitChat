"use client"

import { useEffect, useRef, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore'

export function useTypingIndicator(conversationId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [userNames, setUserNames] = useState<Record<string, string>>({})
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)

  // Listen for typing indicators from other users
  useEffect(() => {
    if (!conversationId || !auth?.currentUser) return

    try {
      const typingRef = collection(db, 'typing', conversationId, 'users')
      
      const unsubscribe = onSnapshot(
        typingRef, 
        (snapshot) => {
          const typing: string[] = []
          const names: Record<string, string> = {}
          
          snapshot.docs.forEach((doc) => {
            const data = doc.data()
            if (doc.id !== auth.currentUser?.uid && data?.isTyping) {
              typing.push(doc.id)
              names[doc.id] = data.userName || 'Someone'
            }
          })
          
          setTypingUsers(typing)
          setUserNames(names)
        },
        (error) => {
          console.warn('Typing indicator listener error:', error)
          // Reset typing state on error
          setTypingUsers([])
          setUserNames({})
        }
      )

      return () => unsubscribe()
    } catch (error) {
      console.warn('Failed to set up typing indicator listener:', error)
      return () => {}
    }
  }, [conversationId])

  // Set typing indicator
  const setTyping = async (isTyping: boolean, userName?: string) => {
    if (!conversationId || !auth?.currentUser || !db) return

    try {
      const typingDocRef = doc(db, 'typing', conversationId, 'users', auth.currentUser.uid)

      if (isTyping) {
        await setDoc(typingDocRef, {
          isTyping: true,
          userName: userName || auth.currentUser.displayName || 'User',
          timestamp: serverTimestamp(),
        }, { merge: true })
        isTypingRef.current = true
      } else {
        await deleteDoc(typingDocRef)
        isTypingRef.current = false
      }
    } catch (error) {
      console.warn('Failed to update typing indicator:', error)
      // Don't throw error, just log it - typing indicators are not critical
    }
  }

  // Handle typing with auto-cleanup
  const handleTyping = (userName?: string) => {
    if (!isTypingRef.current) {
      setTyping(true, userName)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false)
    }, 3000)
  }

  // Stop typing immediately
  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    setTyping(false)
  }

  // Cleanup on unmount and page visibility changes (mobile optimization)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clean up typing indicator when app goes to background
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        setTyping(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      setTyping(false)
    }
  }, [])

  return {
    typingUsers,
    userNames,
    handleTyping,
    stopTyping,
    isTyping: isTypingRef.current,
  }
}