"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface NotificationSettings {
  enabled: boolean
  morningTime: string
  eveningTime: string
  morningMessage: string
  eveningMessage: string
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    morningTime: "08:00",
    eveningTime: "22:00",
    morningMessage: "Good morning! Ready to build your knowledge brick by brick?",
    eveningMessage: "Good night! Great job on your progress today.",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default")
  const { supabase } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
    checkNotificationPermission()
  }, [])

  const checkNotificationPermission = async () => {
    if (!("Notification" in window)) {
      setPermissionStatus("denied")
      return
    }
    
    const status = await Notification.permission
    setPermissionStatus(status)
  }

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
      
      if (permission === "granted") {
        toast({
          title: "Notifications enabled",
          description: "You will now receive notifications at your scheduled times.",
        })
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      toast({
        title: "Error enabling notifications",
        description: "Please try again or check your browser settings.",
        variant: "destructive",
      })
    }
  }

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("user_settings")
        .select("notification_settings")
        .eq("user_id", user.id)
        .single()

      if (error) throw error

      if (data?.notification_settings) {
        setSettings(data.notification_settings)
      }
    } catch (error) {
      console.error("Error loading notification settings:", error)
      toast({
        title: "Error loading settings",
        description: "Failed to load your notification settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            notification_settings: settings,
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        )

      if (error) throw error

      // Save to local storage for the notification worker
      localStorage.setItem("notification_settings", JSON.stringify(settings))
      // Dispatch storage event to trigger notification worker update
      window.dispatchEvent(new StorageEvent("storage", {
        key: "notification_settings",
        newValue: JSON.stringify(settings)
      }))

      toast({
        title: "Settings saved",
        description: "Your notification settings have been updated.",
      })
    } catch (error) {
      console.error("Error saving notification settings:", error)
      toast({
        title: "Error saving settings",
        description: "Failed to save your notification settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggle = async (checked: boolean) => {
    if (checked && permissionStatus !== "granted") {
      await requestPermission()
      if (permissionStatus !== "granted") {
        return
      }
    }
    
    setSettings(prev => ({ ...prev, enabled: checked }))
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {permissionStatus === "denied" && (
        <Alert variant="destructive">
          <AlertDescription>
            Notifications are blocked. Please enable notifications in your browser settings to receive reminders.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          checked={settings.enabled}
          onCheckedChange={handleToggle}
          disabled={permissionStatus === "denied"}
        />
        <Label>Enable notifications</Label>
      </div>

      {settings.enabled && (
        <>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Morning notification time</Label>
              <Input
                type="time"
                value={settings.morningTime}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    morningTime: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Morning message</Label>
              <Input
                value={settings.morningMessage}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    morningMessage: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Evening notification time</Label>
              <Input
                type="time"
                value={settings.eveningTime}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    eveningTime: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Evening message</Label>
              <Input
                value={settings.eveningMessage}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    eveningMessage: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <Button onClick={saveSettings}>Save Settings</Button>
        </>
      )}
    </div>
  )
}
