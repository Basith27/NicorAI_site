'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Pencil } from 'lucide-react'
import { Button } from './ui/button'
import { ChatInput } from './chat-input'
import { NeuralBackground } from './neural-background'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { cn, generateSessionId, saveToLocalStorage, getFromLocalStorage } from '../lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ResponseModalProps {
  isOpen: boolean
  onClose: () => void
  initialMessage: string
  sessionId?: string | null
}

export function ResponseModal({ isOpen, onClose, initialMessage, sessionId }: ResponseModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [isTyping, setIsTyping] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationTimeout, setGenerationTimeout] = useState<NodeJS.Timeout | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [currentInputValue, setCurrentInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Initialize messages with the initial message or load existing session
  useEffect(() => {
    if (isOpen) {
      // If sessionId is provided, load that session from localStorage
      if (sessionId) {
        const existingSession = getFromLocalStorage(sessionId)
        if (existingSession && existingSession.messages) {
          setMessages(existingSession.messages)
          setCurrentSessionId(sessionId)
          return // Exit early, don't create a new session
        }
      }
      
      // Otherwise create a new session
      if (initialMessage) {
        const newSessionId = generateSessionId()
        setCurrentSessionId(newSessionId)
        
        const initialMessages: Message[] = [
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            role: 'user',
            content: initialMessage,
            timestamp: Date.now()
          }
        ]
        
        setMessages(initialMessages)
        
        // Save to localStorage
        saveToLocalStorage(newSessionId, {
          messages: initialMessages,
          createdAt: Date.now()
        })
        
        // Only simulate response if this is a new session
        simulateResponse(initialMessage)
      }
    }
  }, [initialMessage, isOpen, sessionId])
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (generationTimeout) {
        clearTimeout(generationTimeout)
      }
    }
  }, [generationTimeout])
  
  const simulateResponse = (userMessage: string) => {
    setIsTyping(true)
    setIsGenerating(true)
    
    // Simulate typing delay
    const timeout = setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage)
      
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      }
      
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage]
        
        // Save to localStorage
        if (currentSessionId) {
          saveToLocalStorage(currentSessionId, {
            messages: updatedMessages,
            updatedAt: Date.now()
          })
        }
        
        return updatedMessages
      })
      
      setIsTyping(false)
      setIsGenerating(false)
      setGenerationTimeout(null)
    }, 1500)
    
    setGenerationTimeout(timeout)
  }
  
  const stopGeneration = () => {
    if (generationTimeout) {
      clearTimeout(generationTimeout)
      setGenerationTimeout(null)
    }
    setIsTyping(false)
    setIsGenerating(false)
  }
  
  const generateAIResponse = (message: string): string => {
    // Simple mock response generator
    const responses = [
      "Thank you for your inquiry. Our AI team can help optimize your business processes through custom solutions.",
      "We specialize in creating tailored AI solutions for businesses like yours. Would you like to know more about our specific services?",
      "NicorAI has extensive experience in implementing ML/AI technologies. Our experts would be happy to schedule a consultation.",
      "Our machine learning models can analyze your data to identify patterns and provide insights that drive business growth.",
      "We can integrate our AI solutions with your existing systems to enhance productivity and reduce operational costs."
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  const handleSendMessage = (message: string) => {
    if (editingMessageId) {
      handleSaveEdit(message)
      return
    }
    
    const newUserMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      role: 'user',
      content: message,
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, newUserMessage])
    
    // Save to localStorage
    if (currentSessionId) {
      const updatedMessages = [...messages, newUserMessage]
      saveToLocalStorage(currentSessionId, {
        messages: updatedMessages,
        updatedAt: Date.now()
      })
    }
    
    // Simulate AI response
    simulateResponse(message)
  }
  
  const handleEditMessage = (messageId: string) => {
    const messageToEdit = messages.find(msg => msg.id === messageId)
    if (messageToEdit) {
      setEditingMessageId(messageId)
      setCurrentInputValue(messageToEdit.content)
    }
  }
  
  const handleSaveEdit = (editedContent: string) => {
    if (!editingMessageId || !editedContent.trim()) {
      setEditingMessageId(null)
      setCurrentInputValue("")
      return
    }
    
    // Find the index of the message being edited
    const messageIndex = messages.findIndex(msg => msg.id === editingMessageId)
    if (messageIndex === -1) {
      setEditingMessageId(null)
      setCurrentInputValue("")
      return
    }
    
    // Create a new array with the edited message
    const updatedMessages = [...messages]
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: editedContent
    }
    
    // Find the index of the first assistant message after the edited message
    const nextAssistantIndex = messages.findIndex(
      (msg, index) => index > messageIndex && msg.role === 'assistant'
    )
    
    // If there's an assistant message after the edited message, remove it and all subsequent messages
    if (nextAssistantIndex !== -1) {
      updatedMessages.splice(nextAssistantIndex)
    }
    
    // Update messages state
    setMessages(updatedMessages)
    
    // Save to localStorage
    if (currentSessionId) {
      saveToLocalStorage(currentSessionId, {
        messages: updatedMessages,
        updatedAt: Date.now()
      })
    }
    
    // Clear editing state
    setEditingMessageId(null)
    setCurrentInputValue("")
    
    // Generate a new response based on the edited message
    simulateResponse(editedContent)
  }
  
  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setCurrentInputValue("")
  }
  
  const handleInputChange = (value: string) => {
    setCurrentInputValue(value)
  }
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Only allow modal to close via the close button, not by clicking outside
        if (!open) {
          onClose()
        }
      }}
      modal={true} // Ensure it's modal
    >
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 rounded-2xl border-0 shadow-2xl overflow-hidden bg-zinc-900/80 backdrop-blur-sm max-h-[80vh]" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="relative flex flex-col h-[80vh]">
          <NeuralBackground className="opacity-5" />
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50">
            <DialogTitle className="text-lg font-medium text-white">NicorAI Assistant</DialogTitle>
            <button 
              onClick={onClose} 
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex group",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 relative group",
                      message.role === 'user'
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-800 text-zinc-200"
                    )}
                  >
                    {message.content}
                    {message.role === 'user' && (
                      <button
                        onClick={() => handleEditMessage(message.id)}
                        className="absolute -left-10 top-1/2 transform -translate-y-1/2 rounded-full p-1.5 bg-zinc-700 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-600 hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit message</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] rounded-2xl px-6 py-3 bg-zinc-800 text-zinc-400">
                    <span className="inline-flex space-x-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
            {editingMessageId && (
              <div className="mb-2 flex items-center">
                <span className="text-indigo-400 text-sm">Editing message</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleCancelEdit}
                  className="text-zinc-400 hover:text-white text-xs ml-auto hover:bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            )}
            
            <ChatInput
              onSend={handleSendMessage}
              disabled={isTyping && !isGenerating}
              placeholder={editingMessageId ? "Edit your message..." : "Continue the conversation..."}
              className="bg-zinc-800 border-zinc-700"
              isGenerating={isGenerating}
              onStopGeneration={stopGeneration}
              initialValue={currentInputValue}
              onInputChange={handleInputChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
