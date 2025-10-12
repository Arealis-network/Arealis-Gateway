"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { audioEngine } from '@/lib/audio-engine'

interface CinematicLogoLoaderProps {
  onComplete?: () => void
  duration?: number
}

export function CinematicLogoLoader({ onComplete, duration = 5000 }: CinematicLogoLoaderProps) {
  const [phase, setPhase] = useState<'particles' | 'circuit' | 'logo' | 'text' | 'complete'>('particles')
  const [showLoader, setShowLoader] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Start audio sequence
    audioEngine.playLogoRevealSequence()

    const phases = [
      { phase: 'particles', delay: 0 },
      { phase: 'circuit', delay: 1000 },
      { phase: 'logo', delay: 2000 },
      { phase: 'text', delay: 3000 },
      { phase: 'complete', delay: 4000 }
    ]

    phases.forEach(({ phase, delay }) => {
      setTimeout(() => setPhase(phase), delay)
    })

    // Complete the animation
    setTimeout(() => {
      setShowLoader(false)
      onComplete?.()
    }, duration)
  }, [duration, onComplete])

  // Particle system for data streams
  const ParticleField = () => (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-quantum-blue/30 rounded-full"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  )

  // Circuit lines animation
  const CircuitLines = () => (
    <div className="absolute inset-0">
      <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#007BFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#007BFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFD166" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        
        {/* Main circuit path */}
        <motion.path
          d="M 100 500 Q 300 200 500 500 T 900 500"
          stroke="url(#circuitGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Secondary circuit branches */}
        <motion.path
          d="M 200 500 L 200 300 L 400 300 L 400 500"
          stroke="url(#circuitGradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
        />
        
        <motion.path
          d="M 600 500 L 600 700 L 800 700 L 800 500"
          stroke="url(#circuitGradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
        />
      </svg>
    </div>
  )

  // Neural network connections
  const NeuralNetwork = () => (
    <div className="absolute inset-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          <div className="w-2 h-2 bg-quantum-blue/40 rounded-full" />
          <motion.div
            className="absolute w-1 h-1 bg-gold-ember/60 rounded-full"
            animate={{
              x: [0, 20, -20, 0],
              y: [0, -20, 20, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        </motion.div>
      ))}
    </div>
  )

  // Main logo animation
  const LogoAnimation = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          duration: 1.5 
        }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 w-32 h-32 rounded-full border-2 border-quantum-blue/30"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main A logo */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <motion.div
            className="text-6xl font-bold text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg, #007BFF 0%, #FFD166 50%, #007BFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            animate={{
              textShadow: [
                '0 0 20px #007BFF',
                '0 0 40px #007BFF, 0 0 20px #FFD166',
                '0 0 20px #007BFF'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            A
          </motion.div>
          
          {/* Quantum sparks */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gold-ember rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: '0 0'
              }}
              animate={{
                x: [0, Math.cos(i * 45 * Math.PI / 180) * 60],
                y: [0, Math.sin(i * 45 * Math.PI / 180) * 60],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )

  // Text reveal animation
  const TextReveal = () => (
    <motion.div
      className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 1 }}
    >
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text mb-4"
        style={{
          backgroundImage: 'linear-gradient(135deg, #F8F9FA 0%, #007BFF 50%, #FFD166 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
        animate={{
          textShadow: [
            '0 0 20px rgba(0, 123, 255, 0.3)',
            '0 0 40px rgba(0, 123, 255, 0.6)',
            '0 0 20px rgba(0, 123, 255, 0.3)'
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        AREALIS MAGNUS
      </motion.h1>
      
      <motion.p
        className="text-lg md:text-xl text-quantum-blue/80 font-light tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        🜂 The Intelligent Orchestration Network
      </motion.p>
    </motion.div>
  )

  // Heartbeat pulse effect
  const HeartbeatPulse = () => (
    <motion.div
      className="absolute inset-0 bg-quantum-blue/5"
      animate={{
        opacity: [0, 0.3, 0],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: 1.5,
        delay: 3.5,
        ease: "easeInOut"
      }}
    />
  )

  if (!showLoader) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-deep-space-black flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Background particles */}
        {phase === 'particles' && <ParticleField />}
        
        {/* Circuit lines */}
        {phase === 'circuit' && <CircuitLines />}
        
        {/* Neural network */}
        {phase === 'circuit' && <NeuralNetwork />}
        
        {/* Main logo */}
        {phase === 'logo' && <LogoAnimation />}
        
        {/* Text reveal */}
        {phase === 'text' && <TextReveal />}
        
        {/* Heartbeat pulse */}
        {phase === 'complete' && <HeartbeatPulse />}
        
        {/* Audio element for sound effects */}
        <audio ref={audioRef} preload="auto">
          <source src="/sounds/logo-reveal.mp3" type="audio/mpeg" />
        </audio>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook for using the cinematic loader
export function useCinematicLoader() {
  const [isLoading, setIsLoading] = useState(false)

  const startLoader = (duration?: number) => {
    setIsLoading(true)
  }

  const stopLoader = () => {
    setIsLoading(false)
  }

  return {
    isLoading,
    startLoader,
    stopLoader,
    CinematicLoaderComponent: isLoading ? (
      <CinematicLogoLoader 
        onComplete={stopLoader}
        duration={duration}
      />
    ) : null
  }
}
