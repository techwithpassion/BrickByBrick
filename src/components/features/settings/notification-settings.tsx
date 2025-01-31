"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requestNotificationPermission } from "@/lib/notifications"

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
  const { supabase } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("user_settings")
        .select("notification_settings")
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") throw error

      if (data?.notification_settings) {
        setSettings(data.notification_settings)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (settings.enabled) {
        const permission = await requestNotificationPermission()
        if (!permission) {
          toast({
            title: "Notification Permission Required",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive",
          })
          return
        }
      }

      // First try to get existing settings
      const { data: existingSettings } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", user.id)
        .single()

      const { error } = await supabase
        .from("user_settings")
        .upsert({
          id: existingSettings?.id, // Include the id if it exists
          user_id: user.id,
          notification_settings: settings,
        }, {
          onConflict: "user_id"
        })

      if (error) throw error

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="notifications"
            checked={settings.enabled}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, enabled: checked }))
            }
          />
          <Label htmlFor="notifications">Enable Daily Notifications</Label>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Morning Notification</Label>
            <div className="flex space-x-2">
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
              <Input
                value={settings.morningMessage}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    morningMessage: e.target.value,
                  }))
                }
                placeholder="Morning message"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Evening Notification</Label>
            <div className="flex space-x-2">
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
              <Input
                value={settings.eveningMessage}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    eveningMessage: e.target.value,
                  }))
                }
                placeholder="Evening message"
              />
            </div>
          </div>
        </div>

        <Button onClick={saveSettings}>Save Settings</Button>
      </CardContent>
    </Card>
  )
}
