"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Timer } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"

interface TimerStats {
  totalSessions: number
  totalMinutes: number
  lastUsed: Date | null
}

interface TimerContextType {
  duration: number
  setDuration: (duration: number) => void
  isRunning: boolean
  setIsRunning: (isRunning: boolean) => void
  timeLeft: number
  setTimeLeft: (timeLeft: number) => void
  selectedTimer: Timer | null
  savedTimers: Timer[]
  isFullscreen: boolean
  timerStats: Record<string, TimerStats>
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  setSelectedTimer: (timer: Timer | null) => void
  setSavedTimers: (timers: Timer[]) => void
  toggleFullscreen: () => void
  updateTimerStats: (timerId: string) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

const timerCompleteSound = typeof window !== 'undefined' 
  ? new Audio("/sounds/timer-complete.mp3") 
  : null

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [duration, setDuration] = useState(25) // Default to 25 minutes
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration * 60) // Convert to seconds
  const [selectedTimer, setSelectedTimer] = useState<Timer | null>(null)
  const [savedTimers, setSavedTimers] = useState<Timer[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [timerStats, setTimerStats] = useState<Record<string, TimerStats>>({})
  const { toast } = useToast()

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && selectedTimer) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime >= selectedTimer.duration * 60) {
            setIsRunning(false)
            // Play sound
            if (timerCompleteSound) {
              timerCompleteSound.play().catch(console.error)
            }
            // Show notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Timer Complete!", {
                body: `${selectedTimer.name} has finished.`,
                icon: "/icons/timer-icon.png"
              })
            }
            toast({
              title: "Timer Complete!",
              description: `${selectedTimer.name} has finished.`,
            })
            // Update stats
            if (selectedTimer.id) {
              updateTimerStats(selectedTimer.id)
            }
            return selectedTimer.duration * 60
          }
          return prevTime + 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, selectedTimer, toast])

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const startTimer = () => {
    if (selectedTimer) {
      setIsRunning(true)
    } else {
      toast({
        title: "No Timer Selected",
        description: "Please select or create a timer first.",
        variant: "destructive",
      })
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(duration * 60)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev)
  }

  const updateTimerStats = (timerId: string) => {
    setTimerStats(prev => {
      const currentStats = prev[timerId] || {
        totalSessions: 0,
        totalMinutes: 0,
        lastUsed: null
      }

      return {
        ...prev,
        [timerId]: {
          totalSessions: currentStats.totalSessions + 1,
          totalMinutes: currentStats.totalMinutes + (selectedTimer?.duration || 0),
          lastUsed: new Date()
        }
      }
    })
  }

  return (
    <TimerContext.Provider
      value={{
        duration,
        setDuration,
        isRunning,
        setIsRunning,
        timeLeft,
        setTimeLeft,
        selectedTimer,
        savedTimers,
        isFullscreen,
        timerStats,
        startTimer,
        pauseTimer,
        resetTimer,
        setSelectedTimer,
        setSavedTimers,
        toggleFullscreen,
        updateTimerStats
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
