"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useStudyGroup } from "@/contexts/study-group-context"
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

interface StudyGroup {
  id: string
  group_name: string
  group_description: string | null
  created_by: string
  created_at: string
  updated_at: string
  memberCount: number
}

const formSchema = z.object({
  group_name: z.string().min(1, "Group name is required"),
  group_description: z.string().optional(),
})

interface EditGroupDialogProps {
  group: StudyGroup
  trigger: React.ReactNode
}

export function EditGroupDialog({ group, trigger }: EditGroupDialogProps) {
  const [open, setOpen] = React.useState(false)
  const { updateGroup } = useStudyGroup()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      group_name: group.group_name,
      group_description: group.group_description || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await updateGroup(group.id, {
      name: values.group_name,
      description: values.group_description,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Study Group</DialogTitle>
          <DialogDescription>
            Make changes to your study group.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="group_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Choose a name that describes the purpose of your group.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Briefly describe what your group will be studying.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
