"use client"

import { Calendar } from "@/components/ui/calendar"
import { useCalendarContext } from "@/contexts/calendar-context"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function CalendarView() {
  const { tasks, events } = useCalendarContext()
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-lg border"
      components={{
        DayContent: ({ date, ...props }) => {
          const hasTask = tasks.some(
            (task) =>
              task.due_date &&
              new Date(task.due_date).toDateString() === date.toDateString()
          )
          const hasEvent = events.some(
            (event) =>
              new Date(event.start_time).toDateString() === date.toDateString()
          )

          return (
            <div
              {...props}
              className={cn(
                "relative",
                hasTask && "font-bold text-primary",
                hasEvent && "underline"
              )}
            >
              {date.getDate()}
              {(hasTask || hasEvent) && (
                <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </div>
          )
        },
      }}
    />
  )
}
