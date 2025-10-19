"use client"

import type React from "react"

import { useState } from "react"
import { auth, db } from "@/lib/firebase"
import { collection, query, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { motion } from "framer-motion"
import { Search, UserPlus, Clock } from "lucide-react"

interface SearchResult {
  uid: string
  displayName: string
  email: string
  photoURL?: string
}

export default function FriendSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !auth.currentUser) return

    setLoading(true)
    setError("")

    try {
      // Search by display name (case-insensitive)
      const q = query(collection(db, "users"))
      const snapshot = await getDocs(q)

      const searchResults: SearchResult[] = []
      const searchLower = searchQuery.toLowerCase()

      snapshot.forEach((doc) => {
        const data = doc.data()
        if (
          doc.id !== auth.currentUser?.uid &&
          (data.displayName?.toLowerCase().includes(searchLower) || data.email?.toLowerCase().includes(searchLower))
        ) {
          searchResults.push({
            uid: doc.id,
            displayName: data.displayName || "Unknown",
            email: data.email,
            photoURL: data.photoURL,
          })
        }
      })

      setResults(searchResults)
    } catch (err) {
      console.error("Error searching users:", err)
      setError("Failed to search users")
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (toUserId: string) => {
    if (!auth.currentUser) return

    try {
      await addDoc(collection(db, "friendRequests"), {
        senderId: auth.currentUser.uid,
        receiverId: toUserId,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setSentRequests((prev) => new Set([...prev, toUserId]))
    } catch (err) {
      console.error("Error sending friend request:", err)
      setError("Failed to send friend request")
    }
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
    <div className="p-4 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-surface-light border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-background font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "Search"}
        </motion.button>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm"
        >
          {error}
        </motion.div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user, idx) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 bg-surface-light rounded-lg border border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-background font-bold text-sm">{getInitials(user.displayName)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-text">{user.displayName}</h3>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendRequest(user.uid)}
                disabled={sentRequests.has(user.uid)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 ${
                  sentRequests.has(user.uid)
                    ? "bg-surface text-text-secondary cursor-not-allowed"
                    : "bg-primary hover:bg-primary-dark text-background"
                }`}
              >
                {sentRequests.has(user.uid) ? (
                  <>
                    <Clock size={16} />
                    Pending
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Add
                  </>
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {searchQuery && results.length === 0 && !loading && (
        <div className="text-center text-text-secondary py-8">
          <p>No users found</p>
        </div>
      )}
    </div>
  )
}
