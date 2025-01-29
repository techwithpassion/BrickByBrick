"use client"

import { useTimer } from "@/contexts/timer-context"
import { cn } from "@/lib/utils"

export function TimerDisplay() {
  const { currentTime, selectedTimer } = useTimer()

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const calculateProgress = () => {
    if (!selectedTimer) return 0
    return (currentTime / (selectedTimer.duration * 60)) * 100
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex h-52 w-52 items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute -rotate-90" viewBox="0 0 100 100">
          {/* Background Ring */}
          <circle
            className="stroke-white/5"
            fill="none"
            strokeWidth="2"
            cx="50"
            cy="50"
            r="48"
          />
          {/* Progress Ring */}
          <circle
            className="stroke-white transition-all duration-500"
            fill="none"
            strokeWidth="2"
            strokeDasharray={`${calculateProgress() * 3.02} 302`}
            cx="50"
            cy="50"
            r="48"
          />
        </svg>

        {/* Time Display */}
        <div className="text-center">
          <div className="text-6xl font-light tracking-tight tabular-nums">
            {formatTime(currentTime)}
          </div>
          {selectedTimer && (
            <div className="mt-2 text-sm text-white/60">
              {selectedTimer.name}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
