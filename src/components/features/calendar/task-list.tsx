"use client"

import { useCalendarContext } from "@/contexts/calendar-context"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { CheckIcon, CircleIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

export function TaskList() {
  const { tasks, refreshTasks } = useCalendarContext()
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed })
        .eq("id", taskId)

      if (error) throw error

      await refreshTasks()
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  if (!tasks.length) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">No tasks found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your Tasks</h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  task.completed && "bg-primary/10 text-primary"
                )}
                onClick={() => toggleTaskCompletion(task.id, !task.completed)}
              >
                {task.completed ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <CircleIcon className="h-4 w-4" />
                )}
              </Button>
              <div>
                <p
                  className={`font-medium ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}
                {task.due_date && (
                  <p className="text-sm text-muted-foreground">
                    Due: {format(new Date(task.due_date), "PPP")}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from("tasks")
                    .delete()
                    .eq("id", task.id)

                  if (error) throw error

                  await refreshTasks()
                  toast({
                    title: "Task deleted",
                    description: "Task has been deleted successfully",
                  })
                } catch (error) {
                  console.error("Error deleting task:", error)
                  toast({
                    title: "Error",
                    description: "Failed to delete task",
                    variant: "destructive",
                  })
                }
              }}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
