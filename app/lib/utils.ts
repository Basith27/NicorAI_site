import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique ID for chat sessions
export function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Local storage operations for chat history
export function saveToLocalStorage(key: string, value: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export function getFromLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  }
  return null
}

export function getAllSessions() {
  if (typeof window !== 'undefined') {
    const sessions = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('session-')) {
        const session = getFromLocalStorage(key)
        if (session) {
          sessions.push({
            id: key,
            lastMessage: session.messages[session.messages.length - 1]?.content || '',
            timestamp: key.split('-')[1],
          })
        }
      }
    }
    return sessions.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
  }
  return []
} 