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
    if (!conversationId || !auth.currentUser) return

    const typingRef = collection(db, 'typing', conversationId, 'users')
    
    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      const typing: string[] = []
      const names: Record<string, string> = {}
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (doc.id !== auth.currentUser?.uid && data.isTyping) {
          typing.push(doc.id)
          names[doc.id] = data.userName || 'Someone'
        }
      })
      
      setTypingUsers(typing)
      setUserNames(names)
    })

    return () => unsubscribe()
  }, [conversationId])

  // Set typing indicator
  const setTyping = async (isTyping: boolean, userName?: string) => {
    if (!conversationId || !auth.currentUser) return

    const typingDocRef = doc(db, 'typing', conversationId, 'users', auth.currentUser.uid)

    try {
      if (isTyping) {
        await setDoc(typingDocRef, {
          isTyping: true,
          userName: userName || 'User',
          timestamp: serverTimestamp(),
        }, { merge: true })
        isTypingRef.current = true
      } else {
        await deleteDoc(typingDocRef)
        isTypingRef.current = false
      }
    } catch (error) {
      console.warn('Failed to update typing indicator:', error)
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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