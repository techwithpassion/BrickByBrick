"use client"

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if the device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(isIOSDevice)

    const handler = (e: BeforeInstallPromptEvent) => {
      // Store the event for later use
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler as any)

    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone || 
                        document.referrer.includes('android-app://')
    
    if (isStandalone) {
      setIsInstallable(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return

    try {
      // Show the native install prompt
      await deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
      }
    } catch (error) {
      console.error('Error installing PWA:', error)
    }
  }

  const getInstallInstructions = () => {
    if (isIOS) {
      return {
        title: "Install on iOS",
        steps: [
          "1. Open this page in Safari",
          "2. Tap the Share button",
          "3. Scroll down and tap 'Add to Home Screen'",
          "4. Tap 'Add' to confirm"
        ]
      }
    }

    return {
      title: "Install App",
      steps: [
        "1. Click the install button",
        "2. Follow the prompts to install"
      ]
    }
  }

  return { 
    isInstallable, 
    install, 
    isIOS,
    getInstallInstructions 
  }
}
