"use client"

import { useProfile } from "@/contexts/profile-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { format, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

export function StudyStreak() {
  const { streaks = [], isLoading } = useProfile()

  const getLastSevenDays = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date)
    }
    return days
  }

  const hasStudySession = (date: Date) => {
    return streaks?.some((streak) =>
      isSameDay(new Date(streak.date), date)
    ) ?? false
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Streak</CardTitle>
          <CardDescription>Loading your streak data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Streak</CardTitle>
        <CardDescription>
          Keep your study streak going by studying every day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          {getLastSevenDays().map((date) => (
            <div
              key={date.toISOString()}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full",
                  hasStudySession(date)
                    ? "bg-primary"
                    : "bg-muted",
                )}
              />
              <span className="text-xs text-muted-foreground">
                {format(date, "EEE")}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {streaks.length > 0
              ? `Current streak: ${streaks.length} days`
              : "Start your study streak today!"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
