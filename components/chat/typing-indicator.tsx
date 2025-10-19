"use client"

import { motion, AnimatePresence } from 'framer-motion'

interface TypingIndicatorProps {
  typingUsers: string[]
  userNames: Record<string, string>
  className?: string
  variant?: 'desktop' | 'mobile' | 'inline'
}

export default function TypingIndicator({ 
  typingUsers, 
  userNames, 
  className = '',
  variant = 'desktop'
}: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const getTypingText = () => {
    if (variant === 'inline') {
      return 'typing...'
    }
    
    if (typingUsers.length === 1) {
      const name = userNames[typingUsers[0]] || 'Someone'
      return variant === 'mobile' ? `${name} is typing...` : `${name} is typing...`
    } else if (typingUsers.length === 2) {
      const name1 = userNames[typingUsers[0]] || 'Someone'
      const name2 = userNames[typingUsers[1]] || 'someone'
      return `${name1} and ${name2} are typing...`
    } else {
      return `${typingUsers.length} people are typing...`
    }
  }

  // Inline version for header
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-blue-500 rounded-full"
              animate={{
                y: [0, -2, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span className="text-xs text-blue-600 font-medium ml-1">
          {getTypingText()}
        </span>
      </div>
    )
  }

  // Mobile version - shown in header area
  if (variant === 'mobile') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-2 px-2 py-1 text-xs text-blue-600 ${className}`}
        >
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-blue-500 rounded-full"
                animate={{
                  y: [0, -2, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <span className="font-medium">{getTypingText()}</span>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Desktop version - shown in message area
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: 10, height: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 px-4 py-2 text-sm text-gray-600 ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                animate={{
                  y: [0, -4, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <span className="ml-1">{getTypingText()}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}