"use client"

import { useSubjects } from "@/contexts/subjects-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function SubjectProgress() {
  const { selectedSubject } = useSubjects()

  if (!selectedSubject) {
    return null
  }

  const totalTopics = selectedSubject.topics.length
  const completedTopics = selectedSubject.topics.filter(
    (topic) => topic.completed
  ).length
  const progressPercentage = totalTopics > 0
    ? Math.round((completedTopics / totalTopics) * 100)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Progress</CardTitle>
        <CardDescription>
          Your progress in {selectedSubject.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-1">
            <p className="text-sm font-medium">Topics Completed</p>
            <p className="text-2xl font-bold">
              {completedTopics} <span className="text-sm text-muted-foreground">/ {totalTopics}</span>
            </p>
          </div>
          <div className="grid gap-1 text-right">
            <p className="text-sm font-medium">Completion</p>
            <p className="text-2xl font-bold">{progressPercentage}%</p>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </CardContent>
    </Card>
  )
}
