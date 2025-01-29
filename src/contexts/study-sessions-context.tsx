"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

interface StudySession {
  id: string
  userId: string
  subjectId: string | null
  sessionStartTime: string
  sessionEndTime: string | null
  sessionDuration: number | null
  sessionNotes: string | null
  createdAt: string
  updatedAt: string
}

interface StudySessionContextType {
  sessions: StudySession[]
  isLoading: boolean
  createSession: (data: {
    subjectId?: string
    startTime: string
    endTime?: string
    duration?: number
    notes?: string
  }) => Promise<void>
  updateSession: (
    sessionId: string,
    data: {
      subjectId?: string
      startTime?: string
      endTime?: string
      duration?: number
      notes?: string
    }
  ) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined)

export function StudySessionProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data, error } = await supabase
          .from("study_sessions")
          .select("*")
          .eq("user_id", session.user.id)
          .order("session_start_time", { ascending: false })

        if (error) {
          // If the table doesn't exist, just set empty sessions
          if (error.code === "42P01") {
            setSessions([])
            return
          }
          throw error
        }

        setSessions(data || [])
      } catch (error) {
        console.error("Error fetching study sessions:", error)
        toast({
          title: "Error",
          description: "Failed to fetch study sessions",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()

    // Subscribe to session changes
    const channel = supabase
      .channel("study_sessions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "study_sessions",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSessions((prev) => [payload.new as StudySession, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setSessions((prev) =>
              prev.map((session) =>
                session.id === payload.new.id
                  ? (payload.new as StudySession)
                  : session
              )
            )
          } else if (payload.eventType === "DELETE") {
            setSessions((prev) =>
              prev.filter((session) => session.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, toast])

  const createSession = async (data: {
    subjectId?: string
    startTime: string
    endTime?: string
    duration?: number
    notes?: string
  }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { data: studySession, error } = await supabase
        .from("study_sessions")
        .insert([
          {
            subject_id: data.subjectId,
            session_start_time: data.startTime,
            session_end_time: data.endTime,
            session_duration: data.duration,
            session_notes: data.notes,
            user_id: session.user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setSessions((prev) => [studySession, ...prev])
      toast({
        title: "Success",
        description: "Study session created successfully",
      })
    } catch (error) {
      console.error("Error creating study session:", error)
      toast({
        title: "Error",
        description: "Failed to create study session",
        variant: "destructive",
      })
    }
  }

  const updateSession = async (
    sessionId: string,
    data: {
      subjectId?: string
      startTime?: string
      endTime?: string
      duration?: number
      notes?: string
    }
  ) => {
    try {
      const { data: studySession, error } = await supabase
        .from("study_sessions")
        .update({
          subject_id: data.subjectId,
          session_start_time: data.startTime,
          session_end_time: data.endTime,
          session_duration: data.duration,
          session_notes: data.notes,
        })
        .eq("id", sessionId)
        .select()
        .single()

      if (error) throw error

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? studySession : s))
      )
      toast({
        title: "Success",
        description: "Study session updated successfully",
      })
    } catch (error) {
      console.error("Error updating study session:", error)
      toast({
        title: "Error",
        description: "Failed to update study session",
        variant: "destructive",
      })
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("study_sessions")
        .delete()
        .eq("id", sessionId)

      if (error) throw error

      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      toast({
        title: "Success",
        description: "Study session deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting study session:", error)
      toast({
        title: "Error",
        description: "Failed to delete study session",
        variant: "destructive",
      })
    }
  }

  return (
    <StudySessionContext.Provider
      value={{
        sessions,
        isLoading,
        createSession,
        updateSession,
        deleteSession,
      }}
    >
      {children}
    </StudySessionContext.Provider>
  )
}

export function useStudySession() {
  const context = useContext(StudySessionContext)
  if (context === undefined) {
    throw new Error("useStudySession must be used within a StudySessionProvider")
  }
  return context
}
