import { Metadata } from "next"
import { TimerProvider } from "@/contexts/timer-context"
import { TimerDisplay } from "@/components/features/timer/timer-display"
import { TimerControls } from "@/components/features/timer/timer-controls"
import { TimerList } from "@/components/features/timer/timer-list"
import { NewTimerDialog } from "@/components/features/timer/new-timer-dialog"

export const metadata: Metadata = {
  title: "Study Timer - Brick By Brick",
  description: "Track and manage your study sessions",
}

export default function DashboardPage() {
  return (
    <TimerProvider>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Study Timer</h1>
          <NewTimerDialog />
        </div>
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <div className="rounded-lg border bg-card p-8">
              <TimerDisplay />
              <TimerControls />
            </div>
          </div>
          <div>
            <TimerList />
          </div>
        </div>
      </div>
    </TimerProvider>
  )
}
