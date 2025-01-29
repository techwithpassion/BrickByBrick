"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Task, Event } from "@/types"

interface CalendarContextType {
  tasks: Task[]
  events: Event[]
  refreshTasks: () => Promise<void>
  refreshEvents: () => Promise<void>
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const refreshTasks = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      })
    }
  }

  const refreshEvents = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", session.user.id)
        .order("start_time", { ascending: true })

      if (error) throw error

      setEvents(data || [])
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    refreshTasks()
    refreshEvents()

    // Subscribe to realtime changes
    const tasksChannel = supabase
      .channel("tasks_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          refreshTasks()
        }
      )
      .subscribe()

    const eventsChannel = supabase
      .channel("events_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        () => {
          refreshEvents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(eventsChannel)
    }
  }, [supabase, toast])

  return (
    <CalendarContext.Provider
      value={{
        tasks,
        events,
        refreshTasks,
        refreshEvents,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export const useCalendarContext = () => {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error("useCalendarContext must be used within CalendarProvider")
  }
  return context
}
