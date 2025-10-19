// Firestore Schema Documentation and Type Definitions
// This file documents the structure of all Firestore collections

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  bio?: string
  status: "online" | "offline" | "away"
  lastSeen: number
  createdAt: number
  updatedAt: number
}

export interface Conversation {
  id: string
  participants: string[] // Array of user UIDs
  lastMessage?: string
  lastMessageTime?: number
  lastMessageSender?: string
  createdAt: number
  updatedAt: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  timestamp: number
  read: boolean
  readAt?: number
  edited: boolean
  editedAt?: number
}

export interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: number
  updatedAt: number
}

export interface Friendship {
  id: string
  user1Id: string
  user2Id: string
  createdAt: number
}

// Collection paths
export const COLLECTIONS = {
  USERS: "users",
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  FRIEND_REQUESTS: "friendRequests",
  FRIENDSHIPS: "friendships",
} as const
