import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useUser } from "./use-user"
import { useToast } from "@/components/ui/use-toast"

interface UserStreak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_study_date: string
  streak_start_date: string
  total_study_days: number
}

interface DailyActivity {
  id: string
  user_id: string
  date: string
  total_minutes: number
  tasks_completed: number
}

export function useStreak() {
  const [streak, setStreak] = useState<UserStreak | null>(null)
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { user } = useUser()
  const { toast } = useToast()

  // Load streak data
  useEffect(() => {
    if (!user) return
    loadStreakData()
  }, [user])

  const loadStreakData = async () => {
    try {
      // Get streak data
      const { data: streakData, error: streakError } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user?.id)
        .single()

      if (streakError && streakError.code !== "PGRST116") {
        throw streakError
      }

      // Get today's activity
      const today = new Date().toISOString().split("T")[0]
      const { data: activityData, error: activityError } = await supabase
        .from("daily_activity")
        .select("*")
        .eq("user_id", user?.id)
        .eq("date", today)
        .single()

      if (activityError && activityError.code !== "PGRST116") {
        throw activityError
      }

      setStreak(streakData)
      setTodayActivity(activityData)
    } catch (error) {
      console.error("Error loading streak data:", error)
      toast({
        title: "Error",
        description: "Failed to load streak data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateDailyActivity = async (minutes: number, tasksCompleted: number = 0) => {
    if (!user) return

    try {
      const today = new Date().toISOString().split("T")[0]
      
      if (todayActivity) {
        // Update existing activity
        const { error } = await supabase
          .from("daily_activity")
          .update({
            total_minutes: todayActivity.total_minutes + minutes,
            tasks_completed: todayActivity.tasks_completed + tasksCompleted,
            updated_at: new Date().toISOString()
          })
          .eq("id", todayActivity.id)

        if (error) throw error
      } else {
        // Create new activity
        const { error } = await supabase
          .from("daily_activity")
          .insert({
            user_id: user.id,
            date: today,
            total_minutes: minutes,
            tasks_completed: tasksCompleted
          })

        if (error) throw error
      }

      // Reload streak data
      await loadStreakData()
    } catch (error) {
      console.error("Error updating daily activity:", error)
      toast({
        title: "Error",
        description: "Failed to update daily activity",
        variant: "destructive",
      })
    }
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🔥"
    if (streak >= 14) return "⚡"
    if (streak >= 7) return "✨"
    return "🌱"
  }

  return {
    streak,
    todayActivity,
    loading,
    updateDailyActivity,
    getStreakEmoji
  }
}
