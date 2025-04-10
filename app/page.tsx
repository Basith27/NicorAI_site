'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sidebar, sidebarActions } from './components/sidebar'
import { ChatInput } from './components/chat-input'
import { ResponseModal } from './components/response-modal'
import { NeuralBackground } from './components/neural-background'

export default function Home() {
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [userMessage, setUserMessage] = useState('')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  // Set up reference to the sidebar's refresh function
  useEffect(() => {
    const refreshRecentChats = () => {
      if (sidebarRef.current) {
        // Force a refresh of the sidebar component
        const event = new CustomEvent('refreshRecentChats')
        sidebarRef.current.dispatchEvent(event)
      }
    }
    
    // Assign the function to the exported object for use elsewhere
    if (sidebarActions) {
      sidebarActions.refreshRecentChats = refreshRecentChats
    }
    
    return () => {
      // Clean up when component unmounts
      if (sidebarActions) {
        sidebarActions.refreshRecentChats = null
      }
    }
  }, [])
  
  const handleSendMessage = (message: string) => {
    setUserMessage(message)
    setCurrentSessionId(null) // New conversation
    setShowResponseModal(true)
  }
  
  const handleChatSelect = (sessionId: string, initialMessage: string) => {
    setCurrentSessionId(sessionId)
    setUserMessage(initialMessage)
    setShowResponseModal(true)
  }
  
  const handleCloseModal = () => {
    setShowResponseModal(false)
    // Refresh the sidebar to show new chats
    if (sidebarActions.refreshRecentChats) {
      sidebarActions.refreshRecentChats()
    }
  }
  
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-850 dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar onChatSelect={handleChatSelect} />
      </div>
      
      {/* Main Content Area */}
      <div className="pl-64 w-full min-h-screen">
        <NeuralBackground />
        
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-br from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              Welcome to NicorAI
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl">
              Building AI solutions to optimize your business
            </p>
          </motion.div>
          
          {/* Chat Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-lg"
          >
            <ChatInput
              onSend={handleSendMessage}
              placeholder="Ask us about our AI solutions..."
              className="bg-zinc-800 shadow-lg border-zinc-700"
            />
          </motion.div>
        </div>
      </div>
      
      {/* Response Modal */}
      {showResponseModal && (
        <ResponseModal
          isOpen={showResponseModal}
          onClose={handleCloseModal}
          initialMessage={userMessage}
          sessionId={currentSessionId}
        />
      )}
    </main>
  )
} 