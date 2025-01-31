"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { addDays, isBefore, startOfToday } from "date-fns"

interface RescheduleDialogProps {
  task: {
    id: string
    title: string
    due_date: string
  } | null
  isOpen: boolean
  onClose: () => void
  onReschedule: () => void
}

export function RescheduleDialog({
  task,
  isOpen,
  onClose,
  onReschedule,
}: RescheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(
    task ? new Date(task.due_date) : undefined
  )
  const [isLoading, setIsLoading] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && isBefore(newDate, startOfToday())) {
      toast({
        title: "Invalid date",
        description: "Cannot schedule tasks for past dates.",
        variant: "destructive",
      })
      return
    }
    setDate(newDate)
  }

  const handleReschedule = async () => {
    if (!task || !date) return

    if (isBefore(date, startOfToday())) {
      toast({
        title: "Invalid date",
        description: "Cannot schedule tasks for past dates.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase
        .from("tasks")
        .update({ due_date: date.toISOString() })
        .eq("id", task.id)

      if (error) throw error

      toast({
        title: "Task rescheduled",
        description: "The task has been rescheduled successfully.",
      })

      onReschedule()
      onClose()
    } catch (error) {
      console.error("Error rescheduling task:", error)
      toast({
        title: "Error",
        description: "Failed to reschedule task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Task</DialogTitle>
          <DialogDescription>
            Choose a new date for "{task?.title}"
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => isBefore(date, startOfToday())}
            className="rounded-md border"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!date || isLoading}
          >
            Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
