'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface NeuralBackgroundProps {
  className?: string
}

export function NeuralBackground({ className }: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    
    // Initial resize
    resizeCanvas()
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas)
    
    // Neural network parameters
    const nodes: { x: number; y: number; size: number; speed: number }[] = []
    const nodeCount = 80
    
    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 1.5,
        speed: Math.random() * 0.5 + 0.1
      })
    }
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connections between nearby nodes
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.25)'
      ctx.lineWidth = 0.8
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 120) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }
      
      // Draw and update nodes
      ctx.fillStyle = 'rgba(120, 170, 255, 0.65)'
      
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        
        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Update position
        node.y += node.speed
        
        // Reset if off-screen
        if (node.y > canvas.height) {
          node.y = 0
          node.x = Math.random() * canvas.width
        }
      }
      
      requestAnimationFrame(animate)
    }
    
    // Start animation
    animate()
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])
  
  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 2 }}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className || ''}`}
    />
  )
} 