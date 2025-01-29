"use client"

import { Play, Pause, RotateCcw } from "lucide-react"
import { useTimer } from "@/contexts/timer-context"
import { Button } from "@/components/ui/button"

export function TimerControls() {
  const { isRunning, startTimer, pauseTimer, resetTimer, selectedTimer } =
    useTimer()

  return (
    <div className="mt-8 flex justify-center space-x-4">
      {!isRunning ? (
        <Button
          onClick={startTimer}
          disabled={!selectedTimer}
          className="h-12 w-12 rounded-full p-0"
        >
          <Play className="h-6 w-6" />
          <span className="sr-only">Start Timer</span>
        </Button>
      ) : (
        <Button
          onClick={pauseTimer}
          variant="outline"
          className="h-12 w-12 rounded-full p-0"
        >
          <Pause className="h-6 w-6" />
          <span className="sr-only">Pause Timer</span>
        </Button>
      )}
      <Button
        onClick={resetTimer}
        variant="outline"
        className="h-12 w-12 rounded-full p-0"
        disabled={!selectedTimer}
      >
        <RotateCcw className="h-6 w-6" />
        <span className="sr-only">Reset Timer</span>
      </Button>
    </div>
  )
}
