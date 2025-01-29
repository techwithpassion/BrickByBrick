"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import {
  Bell,
  Check,
  Info,
  AlertCircle,
  CheckCircle,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/contexts/notifications-context"

export function NotificationsDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications()

  const getIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <p className="text-sm font-medium">Notifications</p>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => markAllAsRead()}
              >
                <Check className="mr-2 h-3 w-3" />
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => clearAll()}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Clear all
              </Button>
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="grid gap-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="grid cursor-default gap-2 p-4"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {getIcon(notification.type)}
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            !notification.read ? "text-primary" : ""
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
