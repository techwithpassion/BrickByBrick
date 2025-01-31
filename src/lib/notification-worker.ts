import { showTaskNotification } from "./notifications"

let morningTimeout: NodeJS.Timeout | null = null
let eveningTimeout: NodeJS.Timeout | null = null

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/custom-sw.js')
      console.log('Service Worker registered:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
  return null
}

export async function scheduleNotifications(settings: {
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

  // Check notification permission
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications')
    return
  }

  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }

  if (permission !== 'granted') {
    console.error('Notification permission not granted')
    return
  }

  // Register service worker
  const registration = await registerServiceWorker()
  if (!registration) {
    console.error('Service Worker registration required for notifications')
    return
  }

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
  morningTimeout = setTimeout(async () => {
    try {
      await registration.showNotification("Morning Reminder", {
        body: settings.morningMessage,
        icon: "/icons/icon-192x192.png",
        tag: "morning-notification",
        requireInteraction: true
      })
    } catch (error) {
      console.error('Failed to show morning notification:', error)
    }
    // Reschedule for next day
    scheduleNotifications(settings)
  }, morningDelay)

  // Schedule evening notification
  const eveningDelay = eveningTime.getTime() - now.getTime()
  eveningTimeout = setTimeout(async () => {
    try {
      await registration.showNotification("Evening Reminder", {
        body: settings.eveningMessage,
        icon: "/icons/icon-192x192.png",
        tag: "evening-notification",
        requireInteraction: true
      })
    } catch (error) {
      console.error('Failed to show evening notification:', error)
    }
    // Reschedule for next day
    scheduleNotifications(settings)
  }, eveningDelay)

  console.log('Notifications scheduled:', {
    morningTime: morningTime.toLocaleString(),
    eveningTime: eveningTime.toLocaleString()
  })
}

// Start notifications when the app loads
export function initializeNotifications() {
  if (typeof window === "undefined") return

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const settings = await response.json()
      if (settings?.notification_settings) {
        await scheduleNotifications(settings.notification_settings)
      }
    } catch (error) {
      console.error("Error loading notification settings:", error)
    }
  }

  loadSettings()

  // Listen for settings changes
  window.addEventListener("storage", async (event) => {
    if (event.key === "notification_settings") {
      const settings = JSON.parse(event.newValue || "{}")
      await scheduleNotifications(settings)
    }
  })
}
