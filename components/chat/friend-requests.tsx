"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

interface FriendRequest {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  status: "pending" | "accepted" | "rejected"
  createdAt: any
}

export default function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.currentUser) return

    const q = query(
      collection(db, "friendRequests"),
      where("receiverId", "==", auth.currentUser.uid),
      where("status", "==", "pending"),
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const reqs: FriendRequest[] = []
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        const senderDoc = await getDoc(doc(db, "users", data.senderId))
        const senderData = senderDoc.data()

        reqs.push({
          id: docSnap.id,
          senderId: data.senderId,
          senderName: senderData?.displayName || "Unknown",
          senderAvatar: senderData?.photoURL,
          status: data.status,
          createdAt: data.createdAt,
        })
      }
      setRequests(reqs)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleAccept = async (request: FriendRequest) => {
    if (!auth.currentUser) return

    setProcessingId(request.id)

    try {
      // Update request status
      await updateDoc(doc(db, "friendRequests", request.id), {
        status: "accepted",
        updatedAt: serverTimestamp(),
      })

      // Create friendship record
      const friendshipId = [auth.currentUser.uid, request.senderId].sort().join("_")
      await setDoc(doc(db, "friendships", friendshipId), {
        user1Id: auth.currentUser.uid,
        user2Id: request.senderId,
        createdAt: serverTimestamp(),
      })

      // Create conversation
      const conversationId = [auth.currentUser.uid, request.senderId].sort().join("_")
      const currentUserDoc = await getDoc(doc(db, "users", auth.currentUser.uid))

      await setDoc(
        doc(db, "conversations", conversationId),
        {
          participants: [auth.currentUser.uid, request.senderId],
          lastMessage: null,
          lastMessageTime: null,
          lastMessageSender: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    } catch (error) {
      console.error("Error accepting request:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId)

    try {
      await updateDoc(doc(db, "friendRequests", requestId), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error rejecting request:", error)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-surface-light rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-4">
      {requests.length === 0 ? (
        <div className="text-center text-text-secondary py-8">
          <p>No friend requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req, idx) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 bg-surface-light rounded-lg border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  {req.senderAvatar ? (
                    <img
                      src={req.senderAvatar || "/placeholder.svg"}
                      alt={req.senderName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-background font-bold text-sm">{req.senderName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text">{req.senderName}</h3>
                  <p className="text-xs text-text-secondary">Wants to chat</p>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAccept(req)}
                  disabled={processingId !== null}
                  className="flex-1 py-2 bg-primary hover:bg-primary-dark text-background font-medium rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Check size={16} />
                  Accept
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleReject(req.id)}
                  disabled={processingId !== null}
                  className="flex-1 py-2 bg-surface hover:bg-surface-light text-text font-medium rounded-lg transition-colors text-sm border border-border disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <X size={16} />
                  Reject
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
