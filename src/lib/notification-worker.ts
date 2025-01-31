import { showTaskNotification } from "./notifications"

let morningTimeout: NodeJS.Timeout | null = null
let eveningTimeout: NodeJS.Timeout | null = null

export function scheduleNotifications(settings: {
  enabled: boolean
  morningTime: string
  eveningTime: string
  morningMessage: string
  eveningMessage: string
}) {
  // Clear existing timeouts
  if (morningTimeout) clearTimeout(morningTimeout)
  if (eveningTimeout) clearTimeout(eveningTimeout)

  if (!settings.enabled) return

  const now = new Date()
  const [morningHour, morningMinute] = settings.morningTime.split(":").map(Number)
  const [eveningHour, eveningMinute] = settings.eveningTime.split(":").map(Number)

  // Calculate next morning notification time
  const morningTime = new Date(now)
  morningTime.setHours(morningHour, morningMinute, 0, 0)
  if (morningTime < now) {
    morningTime.setDate(morningTime.getDate() + 1)
  }

  // Calculate next evening notification time
  const eveningTime = new Date(now)
  eveningTime.setHours(eveningHour, eveningMinute, 0, 0)
  if (eveningTime < now) {
    eveningTime.setDate(eveningTime.getDate() + 1)
  }

  // Schedule morning notification
  const morningDelay = morningTime.getTime() - now.getTime()
  morningTimeout = setTimeout(() => {
    showTaskNotification({
      id: "morning",
      title: "Good Morning!",
      due_date: new Date().toISOString(),
    })
    // Reschedule for next day
    scheduleNotifications(settings)
  }, morningDelay)

  // Schedule evening notification
  const eveningDelay = eveningTime.getTime() - now.getTime()
  eveningTimeout = setTimeout(() => {
    showTaskNotification({
      id: "evening",
      title: "Good Evening!",
      due_date: new Date().toISOString(),
    })
    // Reschedule for next day
    scheduleNotifications(settings)
  }, eveningDelay)
}

// Start notifications when the app loads
export function initializeNotifications() {
  if (typeof window === "undefined") return

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const settings = await response.json()
      if (settings?.notification_settings) {
        scheduleNotifications(settings.notification_settings)
      }
    } catch (error) {
      console.error("Error loading notification settings:", error)
    }
  }

  loadSettings()

  // Listen for settings changes
  window.addEventListener("storage", (event) => {
    if (event.key === "notification_settings") {
      const settings = JSON.parse(event.newValue || "{}")
      scheduleNotifications(settings)
    }
  })
}
