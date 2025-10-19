"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { auth, db } from "@/lib/firebase"
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { Send, ArrowLeft } from "lucide-react"
import { useTypingIndicator } from "@/hooks/use-typing-indicator"
import TypingIndicator from "./typing-indicator"

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: any
  read: boolean
}

interface ChatWindowProps {
  conversationId: string
  onBack?: () => void
}

export default function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUser, setOtherUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Typing indicator hook
  const { typingUsers, userNames, handleTyping, stopTyping } = useTypingIndicator(conversationId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Subscribe to conversation details and other user info for real-time updates
  useEffect(() => {
    const setupRealTimeListener = async () => {
      try {
        const convDoc = await getDoc(doc(db, "conversations", conversationId))
        if (convDoc.exists()) {
          const data = convDoc.data()
          const otherUserId = data.participants.find((id: string) => id !== auth.currentUser?.uid)

          if (otherUserId) {
            // Set up real-time listener for user data
            const userDocRef = doc(db, "users", otherUserId)
            const unsubscribeUser = onSnapshot(userDocRef, (userDoc) => {
              if (userDoc.exists()) {
                setOtherUser(userDoc.data())
              }
            }, (error) => {
              console.error("Error listening to user updates:", error)
            })

            // Return cleanup function
            return unsubscribeUser
          }
        }
      } catch (error) {
        console.error("Error setting up real-time listener:", error)
      }
    }

    let unsubscribe: (() => void) | undefined

    setupRealTimeListener().then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [conversationId])

  // Subscribe to messages
  useEffect(() => {
    const q = query(collection(db, "conversations", conversationId, "messages"), orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = []
      snapshot.forEach((docSnap) => {
        msgs.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as Message)
      })
      setMessages(msgs)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [conversationId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !auth.currentUser) return

    setSending(true)
    stopTyping() // Stop typing indicator immediately
    
    try {
      // Add message to subcollection
      await addDoc(collection(db, "conversations", conversationId, "messages"), {
        senderId: auth.currentUser.uid,
        text: inputValue.trim(),
        timestamp: serverTimestamp(),
        read: false,
        edited: false,
      })

      // Update conversation last message
      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: inputValue.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
      })

      setInputValue("")
      
      // Focus back to input on mobile
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error("Error sending message:", error)
      // Show user-friendly error on mobile
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        alert('Failed to send message. Please check your connection and try again.')
      }
    } finally {
      setSending(false)
    }
  }

  // Handle input changes with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    
    // Trigger typing indicator if user is typing
    if (e.target.value.trim() && otherUser?.displayName) {
      handleTyping(auth.currentUser?.displayName || 'User')
    }
  }

  // Handle input blur (stop typing) - mobile optimized
  const handleInputBlur = () => {
    // Only stop typing if not on mobile or if user actually left the input
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setTimeout(() => {
        stopTyping()
      }, 1000)
    } else {
      // On mobile, longer delay to handle virtual keyboard behavior
      setTimeout(() => {
        if (document.activeElement !== inputRef.current) {
          stopTyping()
        }
      }, 2000)
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate?.() || new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-800 via-blue-900/20 to-slate-800">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-sky-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen md:h-full bg-gradient-to-br from-white via-blue-50/30 to-white mobile-chat-window md:overflow-visible overflow-hidden">
      {/* Header - Mobile optimized */}
      <div className="flex-shrink-0 p-3 md:p-4 border-b border-blue-200 bg-gradient-to-r from-white via-blue-50 to-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            {onBack && (
              <button 
                onClick={onBack} 
                className="md:hidden p-2 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
                title="Go back"
                aria-label="Go back to conversation list"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
            )}
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              {otherUser?.photoURL ? (
                <img
                  src={otherUser.photoURL || "/placeholder.svg"}
                  alt={otherUser?.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-background font-bold text-xs md:text-sm">{getInitials(otherUser?.displayName || "U")}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 text-sm md:text-base truncate">{otherUser?.displayName || "Loading..."}</h2>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-600">{otherUser?.status === "online" ? "Active now" : "Offline"}</p>
                {typingUsers.length > 0 && (
                  <TypingIndicator 
                    typingUsers={typingUsers} 
                    userNames={userNames}
                    variant="inline"
                  />
                )}
              </div>
            </div>
          </div>
          

        </div>
        
        {/* Typing indicator for mobile */}
        <div className="md:hidden">
          <TypingIndicator 
            typingUsers={typingUsers} 
            userNames={userNames}
            variant="mobile"
            className="!px-0 !py-1"
          />
        </div>
      </div>

      {/* Messages - Responsive scrolling container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4 space-y-3 md:space-y-4 mobile-messages chat-messages-container messages-scroll-container">
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-sm md:text-base">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.02 }}
                className={`flex ${msg.senderId === auth.currentUser?.uid ? "justify-end" : "justify-start"}`}
              >
                <div className="flex flex-col gap-1 max-w-[85%] md:max-w-xs">
                  <div
                    className={`px-3 md:px-4 py-2 md:py-3 rounded-2xl text-sm md:text-base ${
                      msg.senderId === auth.currentUser?.uid
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md shadow-lg shadow-blue-500/30"
                        : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 rounded-bl-md shadow-lg border border-gray-300"
                    }`}
                  >
                    <p className="break-words">{msg.text}</p>
                  </div>
                  <span
                    className={`text-xs text-gray-600 px-1 ${msg.senderId === auth.currentUser?.uid ? "text-right" : "text-left"}`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        
        {/* Desktop typing indicator */}
        <div className="hidden md:block">
          <TypingIndicator 
            typingUsers={typingUsers} 
            userNames={userNames}
            variant="desktop" 
          />
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Mobile optimized with fixed positioning */}
      <div className="flex-shrink-0 fixed md:sticky bottom-0 left-0 right-0 md:bottom-0 p-3 md:p-4 border-t border-blue-200 bg-gradient-to-r from-white to-blue-50 shadow-lg pb-safe z-20 chat-input-container mobile-input-wrapper">
        <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3 items-end w-full max-w-none">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="Type a message..."
              className="w-full px-4 py-3 md:py-2 bg-gray-50 border-2 border-gray-200 rounded-full text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base touch-manipulation pr-12 md:pr-4 mobile-input-field"
              disabled={sending}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
            />
            {/* Mobile send button inside input for larger touch target */}
            <div className="md:hidden absolute right-2 top-1/2 transform -translate-y-1/2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={sending || !inputValue.trim()}
                className="p-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 touch-manipulation"
                title="Send message"
                aria-label="Send message"
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>
          
          {/* Desktop send button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={sending || !inputValue.trim()}
            className="hidden md:flex p-3 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 items-center justify-center"
            title="Send message"
            aria-label="Send message"
          >
            <Send size={20} />
          </motion.button>
        </form>
      </div>
    </div>
  )
}
