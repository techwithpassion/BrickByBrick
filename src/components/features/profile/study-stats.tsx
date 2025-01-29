"use client"

import { useProfile } from "@/contexts/profile-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Clock,
  CheckCircle2,
  Users,
  Flame,
  Trophy,
  BarChart3,
} from "lucide-react"

export function StudyStats() {
  const { stats, isLoading } = useProfile()

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours === 0) {
      return `${remainingMinutes}m`
    }

    return `${hours}h ${remainingMinutes}m`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Statistics</CardTitle>
          <CardDescription>Loading your study data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Study Statistics</CardTitle>
          <CardDescription>
            Track your progress and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Study Time
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {formatTime(stats.totalStudyTime)}
                    </h3>
                  </div>
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tasks Completed
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {stats.completedTasks}
                    </h3>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Groups
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {stats.activeGroups}
                    </h3>
                  </div>
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Current Streak
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {stats.currentStreak} days
                    </h3>
                  </div>
                  <Flame className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Longest Streak
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {stats.longestStreak} days
                    </h3>
                  </div>
                  <Trophy className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Study Progress</CardTitle>
          <CardDescription>
            Your study time distribution over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <div className="flex flex-col items-center space-y-2 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Study progress visualization coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
