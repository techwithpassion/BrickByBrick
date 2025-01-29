"use client"

import { useState } from "react"
import { useCalendarContext } from "@/contexts/calendar-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarView } from "@/components/features/calendar/calendar-view"
import { TaskList } from "@/components/features/calendar/task-list"
import { NewTaskDialog } from "@/components/features/calendar/new-task-dialog"

function TaskDeadlineCount() {
  const { tasks } = useCalendarContext()
  const upcomingTasks = tasks.filter(
    (task) =>
      task.due_date &&
      !task.completed &&
      new Date(task.due_date) > new Date()
  )
  return upcomingTasks.length
}

function TaskCompletionCount() {
  const { tasks } = useCalendarContext()
  const completedTasks = tasks.filter((task) => task.completed)
  return completedTasks.length
}

export default function CalendarPage() {
  return (
    <div className="flex flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <NewTaskDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{TaskDeadlineCount()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{TaskCompletionCount()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <CalendarView />
        <TaskList />
      </div>
    </div>
  )
}
