"use client"

import { motion, AnimatePresence } from 'framer-motion'

interface TypingIndicatorProps {
  typingUsers: string[]
  userNames: Record<string, string>
  className?: string
}

export default function TypingIndicator({ typingUsers, userNames, className = '' }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${userNames[typingUsers[0]] || 'Someone'} is typing...`
    } else if (typingUsers.length === 2) {
      return `${userNames[typingUsers[0]] || 'Someone'} and ${userNames[typingUsers[1]] || 'someone'} are typing...`
    } else {
      return `${typingUsers.length} people are typing...`
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: 10, height: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 px-4 py-2 text-sm text-text-secondary ${className}`}
      >
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-text-secondary rounded-full"
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
          <span className="ml-2">{getTypingText()}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Mobile-optimized version with smaller size
export function MobileTypingIndicator({ typingUsers, userNames }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-1 px-2 py-1 bg-surface-light rounded-full"
      >
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-text-secondary rounded-full"
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
        <span className="text-xs text-text-secondary ml-1">
          {typingUsers.length === 1 ? 'typing...' : `${typingUsers.length} typing...`}
        </span>
      </motion.div>
    </AnimatePresence>
  )
}