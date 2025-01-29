"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  group_name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  group_description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface StudyGroup {
  id: string
  group_name: string
  group_description: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      group_name: "",
      group_description: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to create a group",
          variant: "destructive",
        })
        return
      }

      // First create the group
      const { data: group, error: createError } = await supabase
        .from("study_groups")
        .insert<StudyGroup>([
          {
            group_name: values.group_name,
            group_description: values.group_description || null,
            created_by: session.user.id,
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Error creating group:", createError)
        throw createError
      }

      toast({
        title: "Success",
        description: "Study group created successfully",
      })
      form.reset()
      setOpen(false)
    } catch (error) {
      console.error("Error creating group:", error)
      toast({
        title: "Error",
        description: "Failed to create study group",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Group</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Study Group</DialogTitle>
          <DialogDescription>
            Create a new study group to collaborate with others
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="group_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter group name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter group description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
