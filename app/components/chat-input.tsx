'use client'

import { useState, FormEvent, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Square } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { cn } from '../lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  isGenerating?: boolean
  onStopGeneration?: () => void
  initialValue?: string
  onInputChange?: (value: string) => void
}

export function ChatInput({ 
  onSend,
  disabled = false,
  className,
  placeholder = "Type your message here...",
  isGenerating = false,
  onStopGeneration,
  initialValue = "",
  onInputChange
}: ChatInputProps) {
  const [message, setMessage] = useState(initialValue)
  const [isSending, setIsSending] = useState(false)
  
  // Update message when initialValue changes
  useEffect(() => {
    setMessage(initialValue)
  }, [initialValue])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)
    if (onInputChange) {
      onInputChange(value)
    }
  }
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || disabled) return
    
    setIsSending(true)
    onSend(message)
    
    // Clear input after a short delay for better UX
    setTimeout(() => {
      setMessage('')
      setIsSending(false)
    }, 200)
  }
  
  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center rounded-2xl border border-input bg-background shadow-sm focus-within:ring-0 p-1",
        className
      )}
    >
      <div className="flex items-center justify-center ml-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <Input
        value={message}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled || isSending}
        className="border-0 pl-2 pr-12 focus-visible:ring-0 focus:ring-0 ring-0 outline-none rounded-2xl bg-transparent shadow-none text-white placeholder:text-zinc-400"
      />
      
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="stop-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-3 flex items-center"
          >
            <Button 
              type="button" 
              size="icon" 
              onClick={onStopGeneration}
              className="h-9 w-9 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            >
              <Square className="h-4 w-4" fill="currentColor" />
              <span className="sr-only">Stop generation</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="send-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-3 flex items-center"
          >
            <Button 
              type="submit" 
              size="icon" 
              disabled={!message.trim() || disabled || isSending} 
              className="h-9 w-9"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  )
}
