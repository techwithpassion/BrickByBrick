"use client"

import { Timer } from "@/components/features/timer/timer"

export default function TimerPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto flex max-w-screen-lg flex-col gap-8 p-6">
        <Timer />
      </div>
    </div>
  )
}
