"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

interface Notification {
  id: string
  userId: string
  notificationType: string
  notificationTitle: string
  notificationMessage: string
  isRead: boolean
  createdAt: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  isLoading: boolean
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (error) {
          // If the table doesn't exist, just set empty notifications
          if (error.code === "42P01") {
            setNotifications([])
            return
          }
          throw error
        }

        setNotifications(data || [])
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast({
          title: "Error",
          description: "Failed to fetch notifications",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Subscribe to notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [payload.new as Notification, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((notification) =>
                notification.id === payload.new.id
                  ? (payload.new as Notification)
                  : notification
              )
            )
          } else if (payload.eventType === "DELETE") {
            setNotifications((prev) =>
              prev.filter((notification) => notification.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, toast])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      )
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isLoading,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
