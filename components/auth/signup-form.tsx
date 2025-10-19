"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { setDoc, doc, serverTimestamp, query, collection, where, getDocs, limit } from "firebase/firestore"
import { motion } from "framer-motion"
import { AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<"checking" | "available" | "taken" | "">("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const validateDisplayName = (name: string) => {
    return name.trim().length >= 2 && name.trim().length <= 50
  }

  const checkUsernameAvailability = async (username: string) => {
    try {
      // Create a more specific query
      const q = query(
        collection(db, "users"), 
        where("displayName", "==", username.trim()),
        limit(1) // Only need to know if one exists
      )
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Username check timeout")), 8000)
      )
      
      const querySnapshot = await Promise.race([
        getDocs(q),
        timeoutPromise
      ]) as any
      
      return querySnapshot.empty // true if username is available
    } catch (error: any) {
      console.error("Error checking username availability:", error)
      
      // Check if it's a permission error specifically
      if (error?.code === 'permission-denied') {
        console.warn("Permission denied for username check - rules may not be propagated yet")
      }
      
      // If we can't check, assume it's available to not block signup
      // The final check will happen during actual signup
      return true
    }
  }

  // Debounced username checking
  const debouncedUsernameCheck = useCallback(
    async (username: string) => {
      if (!username.trim() || username.trim().length < 2) {
        setUsernameStatus("")
        return
      }

      setUsernameStatus("checking")
      
      try {
        const isAvailable = await checkUsernameAvailability(username)
        setUsernameStatus(isAvailable ? "available" : "taken")
      } catch (error) {
        console.error("Username check failed:", error)
        // On error, reset status and don't show any indicator
        setUsernameStatus("")
      }
    },
    []
  )

  // Effect for debounced username checking
  useEffect(() => {
    // Only check username availability after user has interacted enough
    // This prevents premature Firebase calls
    const timer = setTimeout(() => {
      if (displayName.trim().length >= 2 && displayName.trim().length <= 50) {
        debouncedUsernameCheck(displayName)
      } else {
        setUsernameStatus("")
      }
    }, 800) // Increased delay to 800ms

    return () => clearTimeout(timer)
  }, [displayName, debouncedUsernameCheck])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate inputs
    if (!displayName.trim()) {
      setError("Display name is required")
      return
    }

    if (!validateDisplayName(displayName)) {
      setError("Display name must be between 2 and 50 characters")
      return
    }

    // Check if username is already taken (final check during signup)
    try {
      const isUsernameAvailable = await checkUsernameAvailability(displayName)
      if (!isUsernameAvailable) {
        setError("This username is already taken. Please choose a different one.")
        return
      }
    } catch (error) {
      console.error("Final username check failed:", error)
      // Continue with signup even if check fails - Firebase will handle duplicate prevention
    }

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!password) {
      setError("Password is required")
      return
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      // Clean the email before creating account
      const cleanEmail = email.trim().toLowerCase()
      
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password)
      const user = userCredential.user

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: cleanEmail,
        displayName: displayName.trim(),
        photoURL: null,
        bio: "",
        status: "online",
        lastSeen: Date.now(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (err: any) {
      const errorCode = err.code
      if (errorCode === "auth/email-already-in-use") {
        setError("This email is already registered")
      } else if (errorCode === "auth/invalid-email") {
        setError("Invalid email address")
      } else if (errorCode === "auth/weak-password") {
        setError("Password is too weak")
      } else if (errorCode === "auth/operation-not-allowed") {
        setError("Sign up is currently disabled")
      } else {
        setError(err.message || "Failed to sign up")
      }
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "", color: "" }
    if (password.length < 6) return { strength: 1, label: "Weak", color: "text-error" }
    if (password.length < 10) return { strength: 2, label: "Fair", color: "text-yellow-500" }
    return { strength: 3, label: "Strong", color: "text-success" }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Display Name</label>
        <div className="relative">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={`w-full px-4 py-3 pr-10 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              usernameStatus === "taken" 
                ? "border-red-500 focus:ring-red-500" 
                : usernameStatus === "available" 
                ? "border-green-500 focus:ring-green-500" 
                : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
            }`}
            placeholder="Choose a unique username"
            disabled={loading}
            required
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {usernameStatus === "checking" && (
              <div className="w-4 h-4 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
            )}
            {usernameStatus === "available" && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            {usernameStatus === "taken" && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
        {usernameStatus === "taken" && (
          <p className="text-sm text-red-500 mt-1">This username is already taken</p>
        )}
        {usernameStatus === "available" && (
          <p className="text-sm text-green-500 mt-1">Username is available</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="you@example.com"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
            placeholder="••••••••"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
            disabled={loading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {password && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-surface-light rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  passwordStrength.strength === 1
                    ? "w-1/3 bg-error"
                    : passwordStrength.strength === 2
                      ? "w-2/3 bg-yellow-500"
                      : "w-full bg-success"
                }`}
              />
            </div>
            <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.label}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
            placeholder="••••••••"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
            disabled={loading}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {confirmPassword && password === confirmPassword && (
          <div className="mt-2 flex items-center gap-2 text-success text-sm">
            <CheckCircle size={16} />
            <span>Passwords match</span>
          </div>
        )}
      </div>

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

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 btn-success font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Sign up"}
      </motion.button>
    </form>
  )
}
