"use client"

import { useTimer } from "@/contexts/timer-context"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

export function TimerControls() {
  const { isRunning, startTimer, pauseTimer, resetTimer } = useTimer()

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="lg"
        className="h-12 w-12 rounded-full border-white/10 bg-white/5 p-0 hover:bg-white/10"
        onClick={resetTimer}
      >
        <RotateCcw className="h-5 w-5" />
        <span className="sr-only">Reset Timer</span>
      </Button>

      <Button
        size="lg"
        className="h-12 w-28 rounded-full bg-white text-black hover:bg-white/90"
        onClick={isRunning ? pauseTimer : startTimer}
      >
        {isRunning ? (
          <>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start
          </>
        )}
      </Button>
    </div>
  )
}
