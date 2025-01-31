"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { initializeNotifications } from "@/lib/notification-worker"

export function PWAInit() {
  const { toast } = useToast()

  useEffect(() => {
    const registerServiceWorker = async () => {
      if (!("serviceWorker" in navigator)) {
        console.log("Service workers are not supported")
        return
      }

      try {
        const registration = await navigator.serviceWorker.register("/custom-sw.js")
        console.log("Service Worker registered successfully:", registration.scope)

        // Initialize notifications after service worker is registered
        initializeNotifications()

        // Check if we should show the install prompt
        window.addEventListener("beforeinstallprompt", (e) => {
          // Prevent Chrome 67 and earlier from automatically showing the prompt
          e.preventDefault()
          // Show custom install UI if needed
          toast({
            title: "Install BrickByBrick",
            description: "Install our app for a better experience!",
            action: (
              <button
                onClick={() => {
                  ;(e as any).prompt()
                }}
                className="rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Install
              </button>
            ),
          })
        })

        // Handle successful installation
        window.addEventListener("appinstalled", () => {
          toast({
            title: "Successfully installed!",
            description: "BrickByBrick has been installed on your device.",
          })
        })
      } catch (error) {
        console.error("Service Worker registration failed:", error)
      }
    }

    registerServiceWorker()
  }, [toast])

  return null
}
