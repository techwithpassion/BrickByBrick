"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RescheduleDialog } from "@/components/features/tasks/reschedule-dialog"
import { format, isPast } from "date-fns"
import { Calendar, Clock, Check, X, ArrowUpDown } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  due_date: string
  completed: boolean
  user_id: string
}

type SortField = "title" | "due_date" | "completed"
type SortOrder = "asc" | "desc"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>("due_date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending">("all")
  const { supabase } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)

    if (error) {
      console.error("Error fetching tasks:", error)
      return
    }

    setTasks(data || [])
  }

  const handleMarkComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: true })
        .eq("id", taskId)

      if (error) throw error

      toast({
        title: "Task completed",
        description: "The task has been marked as complete.",
      })
      fetchTasks()
    } catch (error) {
      console.error("Error marking task complete:", error)
      toast({
        title: "Error",
        description: "Failed to mark task as complete. Please try again.",
        variant: "destructive",
      })
    }
  }

  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (sortField === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      }
      if (sortField === "due_date") {
        return sortOrder === "asc"
          ? new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          : new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      }
      return sortOrder === "asc"
        ? Number(a.completed) - Number(b.completed)
        : Number(b.completed) - Number(a.completed)
    })
  }

  const filteredAndSortedTasks = sortTasks(
    tasks.filter((task) => {
      if (filterStatus === "completed") return task.completed
      if (filterStatus === "pending") return !task.completed
      return true
    })
  )

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="completed">Status</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="w-full sm:w-10"
          >
            <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "transform rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAndSortedTasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(task.due_date), "PPP")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(task.due_date), "p")}
                  </span>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                {!task.completed && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => {
                        setSelectedTask(task)
                        setIsRescheduleOpen(true)
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => handleMarkComplete(task.id)}
                    >
                      <Check className="h-4 w-4" />
                      <span className="ml-2">Complete</span>
                    </Button>
                  </>
                )}
                {task.completed && (
                  <span className="flex items-center text-sm text-green-500">
                    <Check className="h-4 w-4 mr-1" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredAndSortedTasks.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No tasks found. Create some tasks to get started!
          </div>
        )}
      </div>

      <RescheduleDialog
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        onReschedule={fetchTasks}
      />
    </div>
  )
}
