"use client"

import type React from "react"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { motion } from "framer-motion"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate inputs
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

    setLoading(true)

    try {
      // Clean the email and password before sending
      const cleanEmail = email.trim().toLowerCase()
      const cleanPassword = password.trim()
      
      console.log("Attempting login with email:", cleanEmail)
      console.log("Password length:", cleanPassword.length)
      
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword)
      console.log("Login successful:", userCredential.user?.uid)
    } catch (err: any) {
      console.error("Login error details:", {
        code: err.code,
        message: err.message,
        email: email,
        error: err
      })
      
      const errorCode = err.code
      
      if (errorCode === "auth/user-not-found") {
        setError("No account found with this email")
      } else if (errorCode === "auth/wrong-password") {
        setError("Incorrect password")
      } else if (errorCode === "auth/invalid-email") {
        setError("Invalid email address")
      } else if (errorCode === "auth/user-disabled") {
        setError("This account has been disabled")
      } else if (errorCode === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.")
      } else if (errorCode === "auth/network-request-failed") {
        setError("Network error. Please check your connection.")
      } else if (errorCode === "auth/invalid-credential") {
        setError("Invalid email or password. Please check your credentials.")
      } else {
        setError(err.message || "Failed to login. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
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
        className="w-full py-3 px-6 btn-primary font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Logging in..." : "Log in"}
      </motion.button>
    </form>
  )
}
