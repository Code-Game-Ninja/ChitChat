"use client"

import { usePresence } from "@/hooks/use-presence"

interface PresenceIndicatorProps {
  userId: string
  showText?: boolean
  showDot?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PresenceIndicator({ 
  userId, 
  showText = false, 
  showDot = true, 
  size = "sm",
  className = "" 
}: PresenceIndicatorProps) {
  const { isUserActive, lastSeenText, status } = usePresence(userId)

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3", 
    lg: "w-4 h-4"
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showDot && (
        <div 
          className={`${dotSizes[size]} rounded-full ${
            isUserActive ? 'bg-green-500' : 'bg-gray-400'
          }`} 
        />
      )}
      {showText && (
        <span className={`${textSizes[size]} text-gray-600`}>
          {isUserActive ? "Active now" : lastSeenText}
        </span>
      )}
    </div>
  )
}

export default PresenceIndicator