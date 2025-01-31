import useSWR from 'swr'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { startOfMonth, endOfMonth } from "date-fns"

const fetcher = async (userId: string) => {
  const supabase = createClientComponentClient()
  const startDate = startOfMonth(new Date())
  const endDate = endOfMonth(new Date())

  const [profileResponse, sessionsResponse, tasksResponse, recentSessionsResponse] = await Promise.all([
    // Profile data
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single(),
    
    // Study sessions for current month
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("session_start_time", startDate.toISOString())
      .lte("session_start_time", endDate.toISOString())
      .order("session_start_time", { ascending: true }),
    
    // All tasks
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    
    // Recent study sessions
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)
  ])

  return {
    profile: profileResponse.data,
    sessions: sessionsResponse.data || [],
    tasks: tasksResponse.data || [],
    recentSessions: recentSessionsResponse.data || []
  }
}

export function useDashboardData(userId: string | undefined) {
  return useSWR(
    userId ? ['dashboard', userId] : null,
    () => userId ? fetcher(userId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
    }
  )
}
