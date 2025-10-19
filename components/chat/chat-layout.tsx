"use client"

import { useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import ConversationList from "./conversation-list"
import ChatWindow from "./chat-window"
import FriendRequests from "./friend-requests"
import FriendSearch from "./friend-search"
import UserProfile from "./user-profile"
import { Menu, X } from "lucide-react"

export default function ChatLayout() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"chats" | "requests" | "search" | "profile">("chats")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchUserData = async (user: any) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data())
          } else {
            // Create user document if it doesn't exist
            const newUserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              photoURL: user.photoURL,
              status: 'online',
              createdAt: new Date(),
            }
            setCurrentUser(newUserData)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          // Fallback user data
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'User',
            photoURL: user.photoURL,
          })
        }
      }
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user)
      } else {
        setCurrentUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-blue-50/30 to-white overflow-hidden relative">
      {/* Sidebar - Enhanced mobile responsive */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed md:relative w-full md:w-80 lg:w-96 bg-gradient-to-br from-white via-blue-50 to-white border-r border-blue-200 flex flex-col h-full z-40 shadow-2xl ${
          sidebarOpen ? "block" : "hidden md:flex"
        }`}
      >
        {/* Header - Mobile optimized */}
        <div className="p-3 md:p-4 border-b border-blue-200 bg-gradient-to-r from-white to-blue-50 shadow-sm">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent"
            >
              ChitChat
            </motion.h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
              title="Close menu"
              aria-label="Close navigation menu"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>

          {/* Tabs with enhanced mobile layout and colorful buttons */}
          <div className="flex gap-1 md:gap-2 flex-wrap">
            {(["chats", "search", "requests", "profile"] as const).map((tab, idx) => {
              const colors = {
                chats: "bg-gradient-to-r from-blue-500 to-blue-600",
                search: "bg-gradient-to-r from-green-500 to-green-600", 
                requests: "bg-gradient-to-r from-purple-500 to-purple-600",
                profile: "bg-gradient-to-r from-pink-500 to-pink-600"
              }
              return (
                <motion.button
                  key={tab}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-2 md:px-3 rounded-xl font-semibold text-xs md:text-sm transition-all touch-manipulation shadow-lg ${
                    activeTab === tab
                      ? `${colors[tab]} text-white transform scale-105 shadow-xl`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Content with smooth transitions and mobile scroll */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "chats" && (
              <ConversationList selectedId={selectedConversation} onSelect={handleSelectConversation} />
            )}
            {activeTab === "search" && <FriendSearch />}
            {activeTab === "requests" && <FriendRequests />}
            {activeTab === "profile" && currentUser && <UserProfile user={currentUser} />}
          </motion.div>
        </div>
      </motion.div>

      {/* Chat Window - Enhanced responsive design */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Mobile header - improved touch targets */}
            <div className="md:hidden p-3 border-b border-blue-200 flex items-center gap-3 bg-gradient-to-r from-white to-blue-50 shadow-sm sticky top-0 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(true)}
                className="p-2 btn-primary rounded-lg transition-colors touch-manipulation"
                title="Open menu"
                aria-label="Open navigation menu"
              >
                <Menu size={20} className="text-white" />
              </motion.button>
              <h2 className="text-base font-semibold text-gray-900">Chat</h2>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <ChatWindow conversationId={selectedConversation} onBack={() => setSelectedConversation(null)} />
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex items-center justify-center bg-background p-4"
          >
            <div className="text-center max-w-sm">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-16 h-16 md:w-20 md:h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl font-semibold text-gray-900 mb-2"
              >
                Select a conversation
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm md:text-base text-gray-600"
              >
                Choose a friend to start messaging
              </motion.p>
              
              {/* Mobile-specific call to action */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => setSidebarOpen(true)}
                className="md:hidden mt-4 px-4 py-2 bg-primary text-background rounded-lg font-medium touch-manipulation"
              >
                Browse Conversations
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile overlay - Enhanced */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 md:hidden z-30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
