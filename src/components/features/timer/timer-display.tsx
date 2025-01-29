"use client"

import { useTimer } from "@/contexts/timer-context"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2 } from "lucide-react"

export function TimerDisplay() {
  const { currentTime, selectedTimer, isFullscreen, toggleFullscreen, timerStats } = useTimer()

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = timeInSeconds % 60

    const format = (num: number) => num.toString().padStart(2, "0")

    if (hours > 0) {
      return `${format(hours)}:${format(minutes)}:${format(seconds)}`
    }
    return `${format(minutes)}:${format(seconds)}`
  }

  const calculateProgress = () => {
    if (!selectedTimer) return 0
    return (currentTime / (selectedTimer.duration * 60)) * 100
  }

  const getStats = () => {
    if (!selectedTimer?.id) return null
    const stats = timerStats[selectedTimer.id]
    if (!stats) return null
    return {
      sessions: stats.totalSessions,
      hours: Math.floor(stats.totalMinutes / 60),
      lastUsed: stats.lastUsed ? new Date(stats.lastUsed).toLocaleDateString() : 'Never'
    }
  }

  const stats = getStats()

  return (
    <div className={cn(
      "transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-50 flex items-center justify-center bg-background" : "relative"
    )}>
      <Card className={cn(
        "flex flex-col items-center justify-center p-8 space-y-6",
        isFullscreen ? "w-full h-full rounded-none" : "w-auto"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

        <div className="relative flex items-center justify-center">
          <div className={cn(
            "relative flex items-center justify-center rounded-full border-4",
            isFullscreen ? "h-96 w-96" : "h-48 w-48"
          )}>
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                className="text-primary/20"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="47%"
                cx="50%"
                cy="50%"
              />
              <circle
                className="text-primary transition-all duration-500 ease-in-out"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="47%"
                cx="50%"
                cy="50%"
                strokeDasharray={`${calculateProgress() * 2.95} 300`}
              />
            </svg>
            <div className={cn(
              "z-10 font-bold",
              isFullscreen ? "text-7xl" : "text-4xl"
            )}>
              {formatTime(currentTime)}
            </div>
          </div>
        </div>

        {selectedTimer && (
          <div className="text-center space-y-4">
            <h2 className={cn(
              "font-semibold",
              isFullscreen ? "text-3xl" : "text-xl"
            )}>
              {selectedTimer.name}
            </h2>
            
            {stats && (
              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <div className="font-medium">{stats.sessions}</div>
                  <div>Sessions</div>
                </div>
                <div>
                  <div className="font-medium">{stats.hours}</div>
                  <div>Hours</div>
                </div>
                <div>
                  <div className="font-medium">Last Used</div>
                  <div>{stats.lastUsed}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
