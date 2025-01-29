"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { useToast } from "@/components/ui/use-toast"

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface Stats {
  totalStudyTime: number
  completedTasks: number
  activeGroups: number
  currentStreak: number
  longestStreak: number
  averageSessionTime: number
}

interface ProfileContextType {
  profile: Profile | null
  stats: Stats
  loading: boolean
  error: Error | null
  refreshProfile: () => Promise<void>
}

const defaultStats: Stats = {
  totalStudyTime: 0,
  completedTasks: 0,
  activeGroups: 0,
  currentStreak: 0,
  longestStreak: 0,
  averageSessionTime: 0,
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  stats: defaultStats,
  loading: true,
  error: null,
  refreshProfile: async () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats>(defaultStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const fetchStats = async (userId: string) => {
    try {
      // Fetch total study time
      const { data: studyData, error: studyError } = await supabase
        .from("study_sessions")
        .select("session_duration")
        .eq("user_id", userId)

      if (studyError) throw studyError

      const totalStudyTime = studyData?.reduce(
        (acc, session) => acc + (session.session_duration || 0),
        0
      ) || 0

      // Fetch completed tasks
      const { count: completedTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*", { count: true, head: true })
        .eq("user_id", userId)
        .eq("completed", true)

      if (tasksError) throw tasksError

      // Fetch active groups
      const { count: activeGroups, error: groupsError } = await supabase
        .from("study_group_members")
        .select("*", { count: true, head: true })
        .eq("user_id", userId)
        .eq("status", "active")

      if (groupsError) throw groupsError

      setStats({
        totalStudyTime,
        completedTasks: completedTasks || 0,
        activeGroups: activeGroups || 0,
        currentStreak: 0, // TODO: Implement streak calculation
        longestStreak: 0, // TODO: Implement streak calculation
        averageSessionTime:
          studyData && studyData.length > 0
            ? totalStudyTime / studyData.length
            : 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Error",
        description: "Failed to load study statistics",
        variant: "destructive",
      })
    }
  }

  const fetchProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setProfile(null)
        setLoading(false)
        return
      }

      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select()
        .eq("id", session.user.id)
        .maybeSingle()

      if (checkError) throw checkError

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata.full_name,
            avatar_url: session.user.user_metadata.avatar_url,
          })
          .select()
          .single()

        if (insertError) throw insertError
        setProfile(newProfile)
        await fetchStats(session.user.id)
      } else {
        setProfile(existingProfile)
        await fetchStats(session.user.id)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setError(error as Error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    setLoading(true)
    await fetchProfile()
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        stats,
        loading,
        error,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
