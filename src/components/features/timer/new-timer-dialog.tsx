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
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/supabase-provider"

const timerFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must not be longer than 50 characters" }),
  duration: z
    .number()
    .min(1, { message: "Duration must be at least 1 minute" })
    .max(240, { message: "Duration must not be longer than 240 minutes" }),
})

type TimerFormValues = z.infer<typeof timerFormSchema>

export function NewTimerDialog() {
  const [open, setOpen] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const form = useForm<TimerFormValues>({
    resolver: zodResolver(timerFormSchema),
    defaultValues: {
      name: "",
      duration: 25,
    },
  })

  async function onSubmit(data: TimerFormValues) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Not authenticated")
      }

      const { error } = await supabase.from("timers").insert({
        name: data.name,
        duration: data.duration,
        user_id: session.user.id,
      })

      if (error) throw error

      toast({
        title: "Timer created",
        description: "Your new timer has been created successfully.",
      })

      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error creating timer:", error)
      toast({
        title: "Error",
        description: "Failed to create timer. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Timer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Timer</DialogTitle>
          <DialogDescription>
            Set up a new timer for your study sessions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Focus Session" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your timer a descriptive name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How long should the timer run for?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Create Timer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
