"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/shared/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer } from "lucide-react"
import { useTimer } from "@/contexts/timer-context"

interface StudyTimer {
  id: string
  user_id: string
  name: string
  duration: number
  created_at: string
}

export function TimerList() {
  const [timers, setTimers] = useState<StudyTimer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const { selectedTimer, setSelectedTimer, savedTimers, setSavedTimers } =
    useTimer()

  const fetchTimers = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("timers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setTimers(data)
      setSavedTimers(data)
    } catch (error) {
      console.error("Error fetching timers:", error)
      toast({
        title: "Error loading timers",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTimers()

    // Subscribe to realtime changes
    const channel = supabase
      .channel("timers_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "timers",
        },
        () => {
          fetchTimers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, toast])

  const deleteTimer = async (id: string) => {
    try {
      const { error } = await supabase
        .from("timers")
        .delete()
        .eq("id", id)

      if (error) throw error

      setTimers(prev => prev.filter(timer => timer.id !== id))
      setSavedTimers(prev => prev.filter(timer => timer.id !== id))
      toast({
        title: "Timer deleted",
        description: "Your timer has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting timer:", error)
      toast({
        title: "Error deleting timer",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading timers...</div>
  }

  if (timers.length === 0) {
    return (
      <div className="text-center">
        <p>No timers found. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {timers.map((timer) => (
        <Card
          key={timer.id}
          className={`cursor-pointer transition-colors hover:bg-accent ${
            selectedTimer?.id === timer.id ? "border-primary" : ""
          }`}
          onClick={() => setSelectedTimer(timer)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {timer.name}
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timer.duration} min</div>
            <Button
              variant="destructive"
              size="sm"
              className="mt-4"
              onClick={() => deleteTimer(timer.id)}
            >
              Delete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
