"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
    }

    // Check if the app is already installed
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstallable(false)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", () => setIsInstallable(false))
    checkInstalled()

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice
      if (choiceResult.outcome === "accepted") {
        setIsInstallable(false)
      }
    } catch (error) {
      console.error("Error installing app:", error)
    }
  }

  if (!isInstallable) return null

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  )
}
