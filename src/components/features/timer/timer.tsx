"use client"

import { useEffect, useState, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { TimerSettings } from "./timer-settings"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TimerPresets } from "@/components/ui/timer-presets"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Timer as TimerIcon, History, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { useStreak } from "@/hooks/use-streak"

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  due_date?: string
}

interface TaskTime {
  task_id: string
  time_spent: number
  completed: boolean
  completed_at?: string
}

interface TimerProps {
  initialDuration?: number
}

export function Timer({ initialDuration = 25 }: TimerProps = {}) {
  const [timeLeft, setTimeLeft] = useState(initialDuration * 60) // 25 minutes in seconds
  const [duration, setDuration] = useState(initialDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState<Date>()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const { updateDailyActivity, streak } = useStreak()

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      // Create audio element for timer completion sound
      audioRef.current = new Audio("/timer-complete.mp3")
      
      // Check notification permission
      if ("Notification" in window) {
        setNotificationPermission(Notification.permission)
        
        // Request permission if not granted
        if (Notification.permission === "default") {
          Notification.requestPermission().then(permission => {
            setNotificationPermission(permission)
          })
        }
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            saveSession()
            if (audioRef.current) {
              audioRef.current.play().catch(console.error)
            }
            // Only show notification if we're in the browser and permission is granted
            if (typeof window !== "undefined" && "Notification" in window && notificationPermission === "granted") {
              new Notification("Timer Complete!", {
                body: "Your study session has ended.",
                icon: "/favicon.ico"
              })
            }
            toast({
              title: "Time's up!",
              description: "Great job! Take a break.",
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, timeLeft])

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false)
        .order("due_date", { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error loading tasks:", error)
    }
  }

  const saveSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const startTime = new Date(now.getTime() - duration * 1000)
      const durationInMinutes = Math.round(duration / 60)

      const { error } = await supabase.from("study_sessions").insert({
        user_id: user.id,
        task_id: selectedTask || null,
        session_start_time: startTime.toISOString(),
        session_end_time: now.toISOString(),
        session_duration: durationInMinutes
      })

      if (error) throw error

      // Update daily activity and streak
      await updateDailyActivity(durationInMinutes, selectedTask ? 1 : 0)

      if (selectedTask) {
        handleTimerComplete()
      }

      toast({
        title: "Session saved",
        description: streak?.current_streak 
          ? `Session recorded! Current streak: ${streak.current_streak} days 🔥` 
          : "Session recorded successfully!",
      })
    } catch (error) {
      console.error("Error saving session:", error)
      toast({
        title: "Error",
        description: "Failed to save session",
        variant: "destructive",
      })
    }
  }

  const handleTimerComplete = async () => {
    if (!selectedTask) return

    setShowTaskDialog(true)
  }

  const handleTaskComplete = async (completed: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Save task time with rounded duration
      const { error: timeError } = await supabase.from("task_times").insert({
        task_id: selectedTask,
        user_id: user.id,
        time_spent: Math.round(duration / 60),
        completed: completed,
      })

      if (timeError) throw timeError

      if (completed) {
        // Update task as completed
        const { error: taskError } = await supabase
          .from("tasks")
          .update({ completed: true })
          .eq("id", selectedTask)

        if (taskError) throw taskError
      } else {
        setShowRescheduleDialog(true)
      }

      setShowTaskDialog(false)
      loadTasks()
    } catch (error) {
      console.error("Error handling task completion:", error)
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleDate || !selectedTask) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Ensure the reschedule date is not in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (rescheduleDate < today) {
        toast({
          title: "Invalid date",
          description: "Please select a future date",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("tasks")
        .update({ 
          due_date: format(rescheduleDate, 'yyyy-MM-dd'),
          completed: false 
        })
        .eq("id", selectedTask)

      if (error) throw error

      setShowRescheduleDialog(false)
      setRescheduleDate(undefined)
      loadTasks()

      toast({
        title: "Task rescheduled",
        description: `Task has been rescheduled to ${format(rescheduleDate, 'MMM dd, yyyy')}`,
      })
    } catch (error) {
      console.error("Error rescheduling task:", error)
      toast({
        title: "Error",
        description: "Failed to reschedule task",
        variant: "destructive",
      })
    }
  }

  // Format time to show hours if needed
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(duration)
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(duration)
  }

  const handlePresetSelect = (durationMinutes: number, presetName: string) => {
    const durationSeconds = durationMinutes * 60
    setDuration(durationSeconds)
    setTimeLeft(durationSeconds)
    setIsRunning(false)
    toast({
      title: "Preset Selected",
      description: `Timer set to ${presetName}`,
    })
    // Switch to timer tab
    const timerTab = document.querySelector('[value="timer"]') as HTMLButtonElement;
    if (timerTab) {
      timerTab.click();
    }
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {streak && streak.current_streak > 0 && (
          <div className="mb-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-2xl">
                  {streak.current_streak >= 30 ? "🔥" : 
                   streak.current_streak >= 14 ? "⚡" : 
                   streak.current_streak >= 7 ? "✨" : "🌱"}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {streak.current_streak} Day Streak!
                  </div>
                  <div className="text-xs text-zinc-400">
                    Longest streak: {streak.longest_streak} days
                  </div>
                </div>
              </div>
              <div className="text-xs text-zinc-400">
                Total study days: {streak.total_study_days}
              </div>
            </div>
          </div>
        )}
        
        <style jsx global>{`
          .custom-tabs [data-state='active'] {
            background: rgb(39 39 42) !important;
            color: white !important;
          }
          .custom-tabs [role='tab'] {
            background: transparent;
            color: rgb(161 161 170);
            border: 1px solid rgb(63 63 70);
            font-size: 14px;
            padding: 8px;
          }
          @media (max-width: 640px) {
            .custom-tabs [role='tab'] {
              padding: 8px 4px;
              font-size: 12px;
            }
          }
          .custom-tabs [role='tab']:hover {
            background: rgb(39 39 42);
            color: white;
          }
        `}</style>
        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-8 bg-zinc-900 p-1 custom-tabs">
            <TabsTrigger value="timer" className="flex items-center gap-1 sm:gap-2">
              <TimerIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="presets" className="flex items-center gap-1 sm:gap-2">
              <History className="w-3 h-3 sm:w-4 sm:h-4" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2">
              <Settings2 className="w-3 h-3 sm:w-4 sm:h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white">Focus Timer</CardTitle>
                <CardDescription className="text-sm sm:text-base text-zinc-400">
                  Stay focused and track your study sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {/* Timer Display */}
                <div className="text-6xl sm:text-[8rem] font-bold tracking-widest text-white text-center mb-6 sm:mb-8 font-mono">
                  {formatTime(timeLeft)}
                </div>

                {/* Custom Time Input */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="180"
                        placeholder="Min"
                        className="w-20 sm:w-24 bg-zinc-800 border-zinc-700 text-white text-sm sm:text-base"
                        onChange={(e) => {
                          const minutes = parseInt(e.target.value) || 0
                          const seconds = timeLeft % 60
                          if (minutes >= 0 && minutes <= 180) {
                            const newDuration = (minutes * 60) + seconds
                            setDuration(newDuration)
                            setTimeLeft(newDuration)
                            setIsRunning(false)
                          }
                        }}
                      />
                      <span className="text-zinc-400">m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="Sec"
                        className="w-20 sm:w-24 bg-zinc-800 border-zinc-700 text-white text-sm sm:text-base"
                        onChange={(e) => {
                          const seconds = parseInt(e.target.value) || 0
                          const minutes = Math.floor(timeLeft / 60)
                          if (seconds >= 0 && seconds <= 59) {
                            const newDuration = (minutes * 60) + seconds
                            setDuration(newDuration)
                            setTimeLeft(newDuration)
                            setIsRunning(false)
                          }
                        }}
                      />
                      <span className="text-zinc-400">s</span>
                    </div>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
                  {!isRunning ? (
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="w-28 sm:w-32 bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 text-sm sm:text-base"
                    >
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePause}
                      size="lg"
                      className="w-28 sm:w-32 bg-yellow-600 hover:bg-yellow-700 text-sm sm:text-base"
                    >
                      Pause
                    </Button>
                  )}
                  <Button
                    onClick={handleReset}
                    size="lg"
                    variant="outline"
                    className="w-28 sm:w-32 border-zinc-700 text-white hover:bg-zinc-800 text-sm sm:text-base"
                  >
                    Reset
                  </Button>
                </div>

                {/* Quick Duration Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 sm:mb-8">
                  {[15, 25, 30, 45].map((mins) => (
                    <Button
                      key={mins}
                      variant="outline"
                      className="border-zinc-700 text-white hover:bg-zinc-800 text-sm sm:text-base"
                      onClick={() => {
                        setDuration(mins * 60)
                        setTimeLeft(mins * 60)
                        setIsRunning(false)
                      }}
                    >
                      {mins}m
                    </Button>
                  ))}
                </div>

                {/* Task Selection */}
                <div className="mt-6 sm:mt-8 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-medium text-zinc-400">Current Task</label>
                    {selectedTask && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 sm:h-8 px-2 text-zinc-400 hover:text-white text-xs sm:text-sm"
                        onClick={() => setSelectedTask(null)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <Select value={selectedTask || ""} onValueChange={setSelectedTask}>
                    <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white text-sm sm:text-base">
                      <SelectValue placeholder="Select a task to focus on" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] bg-zinc-800 border-zinc-700">
                      {tasks.length === 0 ? (
                        <div className="py-6 text-center">
                          <p className="text-sm sm:text-base text-zinc-400">No tasks found</p>
                          <p className="mt-1 text-xs sm:text-sm text-zinc-500">Add tasks from your dashboard</p>
                        </div>
                      ) : (
                        tasks.map((task) => (
                          <SelectItem 
                            key={task.id} 
                            value={task.id}
                            className="text-white hover:bg-zinc-700 focus:bg-zinc-700 text-sm sm:text-base"
                          >
                            <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={cn(
                                  "w-2 h-2 rounded-full flex-shrink-0",
                                  task.completed ? "bg-green-500" : 
                                  task.due_date && new Date(task.due_date) < new Date() ? "bg-red-500" :
                                  "bg-yellow-500"
                                )} />
                                <span className="truncate">{task.title}</span>
                              </div>
                              {task.due_date && (
                                <span className={cn(
                                  "text-xs whitespace-nowrap hidden sm:inline",
                                  new Date(task.due_date) < new Date() ? "text-red-400" : "text-zinc-400"
                                )}>
                                  {format(new Date(task.due_date), 'MMM d')}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedTask && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
                      <div className="text-xs sm:text-sm text-zinc-400 truncate">
                        {tasks.find(t => t.id === selectedTask)?.title}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {tasks.find(t => t.id === selectedTask)?.due_date && (
                          <Badge variant="outline" className="text-xs">
                            Due {format(new Date(tasks.find(t => t.id === selectedTask)?.due_date!), 'MMM d')}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            tasks.find(t => t.id === selectedTask)?.completed 
                              ? "bg-green-500/10 text-green-500" 
                              : "bg-yellow-500/10 text-yellow-500"
                          )}
                        >
                          {tasks.find(t => t.id === selectedTask)?.completed ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="presets">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl text-white">Timer Presets</CardTitle>
                <CardDescription className="text-sm sm:text-base text-zinc-400">
                  Save and manage your frequently used timer durations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <TimerPresets onSelectPreset={handlePresetSelect} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl text-white">Timer Settings</CardTitle>
                <CardDescription className="text-sm sm:text-base text-zinc-400">
                  Customize your timer preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-white">Quick Duration</h3>
                    <Select
                      value={String(duration / 60)}
                      onValueChange={(value) => {
                        const newDuration = parseInt(value)
                        setDuration(newDuration * 60)
                        setTimeLeft(newDuration * 60)
                        setIsRunning(false)
                      }}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-sm sm:text-base">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="15" className="text-white hover:bg-zinc-700 text-sm sm:text-base">15 minutes</SelectItem>
                        <SelectItem value="25" className="text-white hover:bg-zinc-700 text-sm sm:text-base">25 minutes</SelectItem>
                        <SelectItem value="30" className="text-white hover:bg-zinc-700 text-sm sm:text-base">30 minutes</SelectItem>
                        <SelectItem value="45" className="text-white hover:bg-zinc-700 text-sm sm:text-base">45 minutes</SelectItem>
                        <SelectItem value="60" className="text-white hover:bg-zinc-700 text-sm sm:text-base">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4 text-white">Sound & Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-sm sm:text-base text-zinc-400">Timer completion sound</span>
                        <Badge variant="outline" className="text-xs">
                          Enabled
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-sm sm:text-base text-zinc-400">Browser notifications</span>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs sm:text-sm w-fit", {
                            "bg-green-500/10 text-green-500": notificationPermission === "granted",
                            "bg-yellow-500/10 text-yellow-500": notificationPermission === "default",
                            "bg-red-500/10 text-red-500": notificationPermission === "denied"
                          })}
                        >
                          {typeof window !== "undefined" && "Notification" in window
                            ? notificationPermission === "granted"
                              ? "Enabled"
                              : notificationPermission === "denied"
                              ? "Blocked"
                              : "Not enabled"
                            : "Not supported"}
                        </Badge>
                      </div>
                      {notificationPermission === "default" && (
                        <Button
                          size="sm"
                          className="w-full sm:w-auto mt-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm"
                          onClick={() => {
                            if (typeof window !== "undefined" && "Notification" in window) {
                              Notification.requestPermission().then(permission => {
                                setNotificationPermission(permission)
                              })
                            }
                          }}
                        >
                          Enable Notifications
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Task completion dialog */}
        <AlertDialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <AlertDialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl text-white">Task Complete?</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-zinc-400">
                Did you complete the task during this session?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="h-11 bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                onClick={() => handleTaskComplete(false)}
              >
                No, Reschedule
              </AlertDialogCancel>
              <AlertDialogAction 
                className="h-11 bg-zinc-900 hover:bg-zinc-800 text-white"
                onClick={() => handleTaskComplete(true)}
              >
                Yes, Complete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reschedule dialog */}
        <AlertDialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
          <AlertDialogContent className="max-w-[300px] p-0 bg-zinc-900 border border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-medium text-white">
                  Reschedule Task
                </AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  Choose a new date for this task
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>

            <div className="px-1">
              <Calendar
                mode="single"
                selected={rescheduleDate}
                onSelect={setRescheduleDate}
                initialFocus
                disabled={(date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  return date < today
                }}
              />
            </div>

            <div className="flex gap-2 p-4 border-t border-zinc-800">
              <AlertDialogCancel 
                onClick={() => {
                  setShowRescheduleDialog(false)
                  setRescheduleDate(undefined)
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReschedule}
                disabled={!rescheduleDate}
                className={cn(
                  "flex-1 bg-emerald-600 text-white hover:bg-emerald-500 transition-colors",
                  !rescheduleDate && "opacity-50 cursor-not-allowed"
                )}
              >
                Reschedule
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
