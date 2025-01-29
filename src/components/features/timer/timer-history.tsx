"use client"

import { useTimer } from "@/contexts/timer-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { Clock, CheckCircle2 } from "lucide-react"

export function TimerHistory() {
  const { timerHistory } = useTimer()

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours === 0) {
      return `${remainingMinutes}m`
    }

    return `${hours}h ${remainingMinutes}m`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study History</CardTitle>
        <CardDescription>Your recent study sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {timerHistory.length === 0 ? (
            <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                No study sessions yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timerHistory.map((timer) => (
                <div
                  key={timer.id}
                  className="flex items-start space-x-4 rounded-md border p-4"
                >
                  <div className="mt-1">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {timer.subject?.name || "General Study"}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(timer.duration)}
                      </p>
                      <span className="text-sm text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(timer.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {timer.task && (
                      <div className="mt-2 flex items-center space-x-2 rounded-md bg-muted px-2 py-1">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{timer.task.title}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
