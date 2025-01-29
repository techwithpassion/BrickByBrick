"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStreak } from "@/hooks/use-streak"
import { Flame, Star, Zap, Sprout, Calendar, Trophy, Clock } from "lucide-react"
import { format } from "date-fns"

export function StreakStats() {
  const { streak, todayActivity, loading } = useStreak()

  const getStreakIcon = (streakCount: number) => {
    if (streakCount >= 30) return <Flame className="h-5 w-5 text-orange-500" />
    if (streakCount >= 14) return <Zap className="h-5 w-5 text-yellow-500" />
    if (streakCount >= 7) return <Star className="h-5 w-5 text-blue-500" />
    return <Sprout className="h-5 w-5 text-green-500" />
  }

  const getStreakMessage = (streakCount: number) => {
    if (streakCount >= 30) return "You're on fire! 🔥"
    if (streakCount >= 14) return "Lightning streak! ⚡"
    if (streakCount >= 7) return "Sparkling progress! ✨"
    return "Growing strong! 🌱"
  }

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Study Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-pulse flex space-x-4">
              <div className="h-12 w-12 bg-zinc-800 rounded-full"></div>
              <div className="space-y-3">
                <div className="h-4 w-[200px] bg-zinc-800 rounded"></div>
                <div className="h-4 w-[150px] bg-zinc-800 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-white">Study Streak</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Current Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                {streak ? getStreakIcon(streak.current_streak) : <Sprout className="h-5 w-5 text-green-500" />}
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {streak?.current_streak || 0} {streak?.current_streak === 1 ? "Day" : "Days"}
                </div>
                <div className="text-sm text-zinc-400">
                  {streak ? getStreakMessage(streak.current_streak) : "Start your streak today!"}
                </div>
              </div>
            </div>
            {todayActivity && (
              <div className="text-right">
                <div className="text-sm font-medium text-white">Today</div>
                <div className="text-2xl font-bold text-green-500">
                  {Math.round(todayActivity.total_minutes / 60 * 10) / 10}h
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
              <div className="h-9 w-9 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Longest Streak</div>
                <div className="text-lg font-semibold text-white">
                  {streak?.longest_streak || 0} Days
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
              <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Total Study Days</div>
                <div className="text-lg font-semibold text-white">
                  {streak?.total_study_days || 0} Days
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
              <div className="h-9 w-9 rounded-full bg-green-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Today's Tasks</div>
                <div className="text-lg font-semibold text-white">
                  {todayActivity?.tasks_completed || 0} Completed
                </div>
              </div>
            </div>
          </div>

          {/* Streak Start */}
          {streak?.streak_start_date && (
            <div className="text-center text-sm text-zinc-400">
              Streak started on {format(new Date(streak.streak_start_date), "MMMM d, yyyy")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
