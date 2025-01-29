"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/shared/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  // If any password field is filled, require all password fields
  if (data.currentPassword || data.newPassword || data.confirmPassword) {
    if (!data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Current password is required when changing password",
        path: ["currentPassword"],
      })
    }
    if (!data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password is required when changing password",
        path: ["newPassword"],
      })
    }
    if (!data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password confirmation is required when changing password",
        path: ["confirmPassword"],
      })
    }
  }

  // Check if passwords match when both are provided
  if (data.newPassword && data.confirmPassword && data.newPassword !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
  }
})

type FormData = z.infer<typeof formSchema>

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
      avatarUrl: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return

    setIsLoading(true)
    try {
      // Only update profile fields that have changed
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      }

      if (data.name !== undefined) updates.name = data.name
      if (data.bio !== undefined) updates.bio = data.bio
      if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl

      // Only make the profile update if there are changes
      if (Object.keys(updates).length > 1) {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id)

        if (error) throw error
      }

      // Only update password if all password fields are filled
      if (data.currentPassword && data.newPassword && data.confirmPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.newPassword
        })

        if (passwordError) throw passwordError

        // Clear password fields after successful update
        form.setValue("currentPassword", "")
        form.setValue("newPassword", "")
        form.setValue("confirmPassword", "")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error updating profile",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (error) throw error

        form.reset({
          name: data.name || "",
          bio: data.bio || "",
          avatarUrl: data.avatar_url || "",
        })
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }

    loadProfile()
  }, [user, supabase, form])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your profile information. Only filled fields will be updated.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={form.watch("avatarUrl") || "/avatars/default.png"} />
            <AvatarFallback>
              {form.watch("name")?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Your public display name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Tell others a little bit about yourself
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/avatar.jpg" />
                  </FormControl>
                  <FormDescription>
                    A URL to your profile picture
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Change Password</h3>
              <p className="text-sm text-muted-foreground">
                Leave these fields empty if you don't want to change your password
              </p>
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
