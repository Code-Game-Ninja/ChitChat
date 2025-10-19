"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from "firebase/firestore"
import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"
import TypingIndicator from "./typing-indicator"
import { useTypingIndicator } from "@/hooks/use-typing-indicator"
import { usePresence } from "@/hooks/use-presence"

interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar?: string
  lastMessage: string
  lastMessageTime: any
  lastMessageSender?: string
  unread: number
}

// Individual conversation item component
function ConversationItem({ 
  conv, 
  isSelected, 
  onSelect, 
  index 
}: { 
  conv: Conversation
  isSelected: boolean
  onSelect: (id: string) => void
  index: number
}) {
  const { typingUsers, userNames } = useTypingIndicator(conv.id)
  const { isUserActive } = usePresence(conv.participantId)
  
  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate?.() || new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "now"
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelect(conv.id)}
      className={`w-full p-3 md:p-3 rounded-xl transition-all text-left touch-manipulation ${
        isSelected
          ? "bg-blue-100 border-2 border-blue-500 shadow-lg shadow-blue-500/20"
          : "hover:bg-gray-50 border-2 border-transparent active:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            {conv.participantAvatar ? (
              <img
                src={conv.participantAvatar || "/placeholder.svg"}
                alt={conv.participantName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xs md:text-sm">{getInitials(conv.participantName)}</span>
            )}
          </div>
          {/* Online status indicator */}
          {isUserActive && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">{conv.participantName}</h3>
            <span className="text-xs text-blue-600 flex-shrink-0 font-medium">
              {formatTime(conv.lastMessageTime)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              {typingUsers.length > 0 ? (
                <TypingIndicator 
                  typingUsers={typingUsers} 
                  userNames={userNames}
                  variant="mobile"
                />
              ) : (
                <p className="text-xs md:text-sm text-gray-600 truncate">{conv.lastMessage}</p>
              )}
            </div>
            {conv.unread > 0 && (
              <div className="w-5 h-5 md:w-6 md:h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">{conv.unread > 99 ? '99+' : conv.unread}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

export default function ConversationList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for authentication to be ready
    const unsubscribeAuth = auth.onAuthStateChanged((user: any) => {
      if (!user) {
        setLoading(false)
        setConversations([])
        return
      }

      // User is authenticated, now query conversations
      try {
        const q = query(
          collection(db, "conversations"),
          where("participants", "array-contains", user.uid),
          orderBy("updatedAt", "desc"),
        )

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          try {
            const convs: Conversation[] = []

            for (const docSnap of snapshot.docs) {
              const data = docSnap.data()
              const otherUserId = data.participants?.find((id: string) => id !== user.uid)

              if (otherUserId) {
                try {
                  // Fetch other user's data
                  const userDoc = await getDoc(doc(db, "users", otherUserId))
                  const userData = userDoc.data()

                  convs.push({
                    id: docSnap.id,
                    participantId: otherUserId,
                    participantName: userData?.displayName || userData?.name || "Unknown User",
                    participantAvatar: userData?.photoURL || userData?.avatar,
                    lastMessage: data.lastMessage || "No messages yet",
                    lastMessageTime: data.lastMessageTime || data.updatedAt,
                    lastMessageSender: data.lastMessageSender,
                    unread: data.unread?.[user.uid] || 0,
                  })
                } catch (userError) {
                  console.warn(`Failed to fetch user data for ${otherUserId}:`, userError)
                  // Add conversation even if user data fails
                  convs.push({
                    id: docSnap.id,
                    participantId: otherUserId,
                    participantName: "Unknown User",
                    participantAvatar: undefined,
                    lastMessage: data.lastMessage || "No messages yet",
                    lastMessageTime: data.lastMessageTime || data.updatedAt,
                    lastMessageSender: data.lastMessageSender,
                    unread: data.unread?.[user.uid] || 0,
                  })
                }
              }
            }

            setConversations(convs)
            setLoading(false)
          } catch (snapshotError) {
            console.error("Error processing conversations snapshot:", snapshotError)
            setLoading(false)
          }
        }, (error) => {
          console.error("Error in conversations listener:", {
            code: error.code,
            message: error.message,
            userId: user?.uid,
            error: error
          })
          setLoading(false)
        })

        return unsubscribe
      } catch (queryError) {
        console.error("Error setting up conversations query:", queryError)
        setLoading(false)
      }
    })

    return () => unsubscribeAuth()
  }, [])

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate?.() || new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "now"
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
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
      <div className="p-3 md:p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 md:h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-2">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-600">
          <MessageCircle size={32} className="mx-auto mb-2 text-blue-500" />
          <p className="text-sm md:text-base font-semibold">No conversations yet</p>
          <p className="text-xs md:text-sm mt-2">Add friends to start chatting</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv, idx) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isSelected={selectedId === conv.id}
              onSelect={onSelect}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  )
}
