"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
      >
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent mb-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            ChitChat
          </motion.h1>
          <p className="text-gray-600">Friendly messaging made simple</p>
        </div>

        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {isLogin ? <LoginForm /> : <SignupForm />}
        </motion.div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`font-semibold transition-all hover:scale-105 ${
                isLogin ? "btn-purple px-3 py-1 rounded-lg text-white" : "btn-primary px-3 py-1 rounded-lg text-white"
              }`}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
