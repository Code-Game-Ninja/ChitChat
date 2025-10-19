"use client"

import type React from "react"

import { useState, useRef } from "react"
import { auth, db } from "@/lib/firebase"
import { updateDoc, doc } from "firebase/firestore"
import { motion } from "framer-motion"
import { LogOut, Camera, AlertCircle, CheckCircle } from "lucide-react"
import { uploadAvatar, getAvatarInitials, compressImage } from "@/lib/storage-utils"

export default function UserProfile({ user }: { user: any }) {
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !auth.currentUser) return

    setUploading(true)
    setError("")

    try {
      // Compress image before upload
      const compressedBlob = await compressImage(file, 0.8)
      const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" })

      // Upload avatar
      const downloadURL = await uploadAvatar(auth.currentUser.uid, compressedFile)

      // Update user document
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        photoURL: downloadURL,
        updatedAt: new Date(),
      })

      setSuccess("Avatar updated successfully")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("Error uploading avatar:", err)
      setError(err.message || "Failed to upload avatar")
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleProfileUpdate = async () => {
    if (!auth.currentUser) return

    if (!displayName.trim()) {
      setError("Display name is required")
      return
    }

    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters")
      return
    }

    setSaving(true)
    setError("")

    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        displayName: displayName.trim(),
        bio: bio.trim(),
        updatedAt: new Date(),
      })

      setSuccess("Profile updated successfully")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
    } catch (err) {
      console.error("Error logging out:", err)
      setError("Failed to logout")
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL || "/placeholder.svg"}
              alt={user?.displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-background">{getAvatarInitials(user?.displayName || "U")}</span>
          )}
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera size={24} className="text-white" />
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
          disabled={uploading}
        />
        <h2 className="mt-4 text-xl font-bold text-text">{user?.displayName}</h2>
        <p className="text-sm text-text-secondary">{user?.email}</p>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your display name"
          className="w-full px-4 py-2 bg-surface-light border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          disabled={saving}
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          className="w-full px-4 py-2 bg-surface-light border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={3}
          disabled={saving}
          maxLength={150}
        />
        <p className="text-xs text-text-secondary mt-1">{bio.length}/150</p>
      </div>

      {/* Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-error/10 border border-error rounded-lg flex items-start gap-2"
        >
          <AlertCircle size={18} className="text-error flex-shrink-0 mt-0.5" />
          <p className="text-error text-sm">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-success/10 border border-success rounded-lg flex items-start gap-2"
        >
          <CheckCircle size={18} className="text-success flex-shrink-0 mt-0.5" />
          <p className="text-success text-sm">{success}</p>
        </motion.div>
      )}

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleProfileUpdate}
        disabled={saving || uploading}
        className="w-full py-2 bg-primary hover:bg-primary-dark text-background font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Saving..." : "Save Changes"}
      </motion.button>

      {/* Account Info */}
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Member since</span>
          <span className="text-text font-medium">
            {user?.createdAt?.toDate?.().toLocaleDateString() || "Recently"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Status</span>
          <span className="text-success font-medium">{user?.status || "Online"}</span>
        </div>
      </div>

      {/* Logout Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="w-full py-2 bg-error/10 hover:bg-error/20 text-error font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        Logout
      </motion.button>
    </div>
  )
}
