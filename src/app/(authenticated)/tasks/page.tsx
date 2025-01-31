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
      if (sortField === "completed") {
        return sortOrder === "asc"
          ? Number(a.completed) - Number(b.completed)
          : Number(b.completed) - Number(a.completed)
      }
      return 0
    })
  }

  const filterTasks = (tasksToFilter: Task[]) => {
    if (filterStatus === "all") return tasksToFilter
    return tasksToFilter.filter(task => 
      filterStatus === "completed" ? task.completed : !task.completed
    )
  }

  const displayedTasks = sortTasks(filterTasks(tasks))

  return (
    <div className="container mx-auto py-10">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Tasks</h1>
          <div className="flex space-x-4">
            <Select
              value={filterStatus}
              onValueChange={(value: "all" | "completed" | "pending") => 
                setFilterStatus(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (sortField === "title") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    } else {
                      setSortField("title")
                      setSortOrder("asc")
                    }
                  }}
                >
                  Title
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (sortField === "due_date") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    } else {
                      setSortField("due_date")
                      setSortOrder("asc")
                    }
                  }}
                >
                  Due Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (sortField === "completed") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    } else {
                      setSortField("completed")
                      setSortOrder("asc")
                    }
                  }}
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(task.due_date), "PPP")}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {format(new Date(task.due_date), "p")}
                  </div>
                </TableCell>
                <TableCell>
                  {task.completed ? (
                    <span className="flex items-center text-green-600">
                      <Check className="mr-2 h-4 w-4" />
                      Completed
                    </span>
                  ) : isPast(new Date(task.due_date)) ? (
                    <span className="flex items-center text-red-600">
                      <X className="mr-2 h-4 w-4" />
                      Overdue
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-600">
                      <Clock className="mr-2 h-4 w-4" />
                      Pending
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {!task.completed && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkComplete(task.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task)
                          setIsRescheduleOpen(true)
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Reschedule
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <RescheduleDialog
        task={selectedTask}
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false)
          setSelectedTask(null)
        }}
        onReschedule={() => {
          fetchTasks()
          setIsRescheduleOpen(false)
          setSelectedTask(null)
        }}
      />
    </div>
  )
}
