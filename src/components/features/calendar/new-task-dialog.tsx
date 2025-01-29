"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useCalendarContext } from "@/contexts/calendar-context"
import { Calendar } from "@/components/ui/calendar"
import { useSupabase } from "@/lib/supabase/supabase-provider"

const taskFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(50, { message: "Title must not be longer than 50 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must not be longer than 500 characters" })
    .optional(),
  due_date: z.date().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

export function NewTaskDialog() {
  const [open, setOpen] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const { refreshTasks } = useCalendarContext()

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: undefined,
    },
  })

  async function onSubmit(data: TaskFormValues) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Not authenticated")
      }

      const { error } = await supabase.from("tasks").insert({
        title: data.title,
        description: data.description || null,
        due_date: data.due_date?.toISOString() || null,
        user_id: session.user.id,
        completed: false,
      })

      if (error) throw error

      toast({
        title: "Task created",
        description: "Your new task has been created successfully.",
      })

      await refreshTasks()
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Task</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your calendar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Complete assignment" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your task a descriptive title.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Add more details about your task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      className="rounded-md border"
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Set a due date for your task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
