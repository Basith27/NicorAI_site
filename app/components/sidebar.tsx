'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Home, MessageSquare, Layers, Phone, ChevronRight, Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { getFromLocalStorage, getAllSessions } from '../lib/utils'

interface NavItem {
  name: string
  icon: React.ReactNode
  href: string
}

interface RecentChat {
  id: string
  lastMessage: string
  timestamp: string
}

// Define props interface with optional onChatSelect
interface SidebarProps {
  onChatSelect?: (sessionId: string, initialMessage: string) => void
}

export function Sidebar({ onChatSelect }: SidebarProps) {
  const [navItems] = useState<NavItem[]>([
    { name: 'Home', icon: <Home className="h-5 w-5" />, href: '/' },
    { name: 'Services', icon: <Layers className="h-5 w-5" />, href: '/services' },
    { name: 'Solutions', icon: <MessageSquare className="h-5 w-5" />, href: '/solutions' },
    { name: 'Contact Us', icon: <Phone className="h-5 w-5" />, href: '/contact' },
  ])
  
  const [recentChats, setRecentChats] = useState<RecentChat[]>([])
  const [activeNav, setActiveNav] = useState('Home')
  
  // Function to refresh recent chats
  const refreshRecentChats = () => {
    const sessions = getAllSessions()
    setRecentChats(sessions)
  }
  
  useEffect(() => {
    // Get recent sessions from localStorage
    refreshRecentChats()
  }, [])
  
  const handleNavClick = (navName: string) => {
    setActiveNav(navName)
  }
  
  const handleChatClick = (chatId: string) => {
    if (onChatSelect) {
      const session = getFromLocalStorage(chatId)
      if (session && session.messages && session.messages.length > 0) {
        // Find the first user message to use as initial message
        const firstUserMessage = session.messages.find((msg: any) => msg.role === 'user')
        if (firstUserMessage) {
          onChatSelect(chatId, firstUserMessage.content)
        }
      }
    }
  }
  
  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the parent button click
    
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(chatId)
      
      // Update state to remove the deleted chat
      setRecentChats(prevChats => prevChats.filter(chat => chat.id !== chatId))
    }
  }
  
  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 z-30 h-full w-64 bg-zinc-900 text-white flex flex-col shadow-xl border-r border-zinc-700/40"
    >
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-br from-blue-400 to-indigo-600 bg-clip-text text-transparent">
          NicorAI
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Button
                variant="ghost"
                onClick={() => handleNavClick(item.name)}
                className={cn(
                  "w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl",
                  activeNav === item.name && "bg-zinc-800/60 text-white"
                )}
              >
                <span className="flex items-center">
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </span>
                {activeNav === item.name && (
                  <motion.span
                    layoutId="activeNav"
                    className="ml-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.span>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Recent Chats */}
      <div className="p-4 border-t border-zinc-800">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Recent Chats
        </h3>
        
        {recentChats.length > 0 ? (
          <ul className="space-y-1">
            {recentChats.map((chat) => (
              <li key={chat.id} className="relative group">
                <Button
                  variant="ghost"
                  onClick={() => handleChatClick(chat.id)}
                  className="w-full justify-start text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl truncate pr-8"
                >
                  <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="truncate">{chat.lastMessage.substring(0, 25)}{chat.lastMessage.length > 25 ? '...' : ''}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="absolute right-1 top-1/2 -mt-3 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent hover:bg-zinc-800 rounded-full"
                >
                  <Trash2 className="h-3 w-3 text-zinc-500 hover:text-red-400" />
                  <span className="sr-only">Delete chat</span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-500 italic">No recent chats</p>
        )}
      </div>
    </motion.div>
  )
}

// Export a reference to the refreshRecentChats function
export const sidebarActions = {
  refreshRecentChats: null as null | (() => void)
} 