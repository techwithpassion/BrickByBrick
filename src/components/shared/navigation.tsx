"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import {
  LayoutDashboard,
  Timer,
  Calendar,
  BarChart3,
  Settings,
  ListTodo,
  User,
  Menu,
  X,
  HelpCircle,
  LogOut,
  Download,
} from "lucide-react"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Timer",
    href: "/timer",
    icon: Timer,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: ListTodo,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
]

const userNavigation = [
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    name: "Help",
    href: "/help",
    icon: HelpCircle,
  },
]

export function Navigation() {
  const pathname = usePathname()
  const { isInstallable, install, isIOS, getInstallInstructions } = usePWAInstall()
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { signOut } = useAuth()
  const { toast } = useToast()

  const handleInstall = () => {
    if (isIOS) {
      setShowInstallDialog(true)
    } else {
      install()
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      })
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const instructions = getInstallInstructions()

  return (
    <>
      {/* Mobile Navigation Button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-black px-4 lg:hidden">
        <Link href="/dashboard" className="text-xl font-semibold text-white">
          Brick By Brick
        </Link>
        <div className="flex items-center space-x-4">
          {isInstallable && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInstall}
              className="flex items-center text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Install
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="fixed top-0 z-40 hidden h-screen w-64 border-r border-white/5 bg-black lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-white/5 px-6">
            <Link href="/dashboard" className="text-xl font-semibold text-white">
              Brick By Brick
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 space-y-1 p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* User Navigation */}
          <div className="border-t border-white/5 p-4 space-y-1">
            {userNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-white text-black"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
            <div className="flex flex-col gap-1">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
              {isInstallable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInstall}
                  className="hidden sm:flex"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install App
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <nav className="fixed top-16 left-0 bottom-0 w-64 bg-black border-r border-white/5 overflow-y-auto">
            {/* Main Navigation */}
            <div className="flex-1 space-y-1 p-4">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-white text-black"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* User Navigation */}
            <div className="border-t border-white/5 p-4 space-y-1">
              {userNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-white text-black"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
                {isInstallable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleInstall}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Install App
                  </Button>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}

      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{instructions.title}</DialogTitle>
            <DialogDescription>
              <div className="mt-4 space-y-2">
                {instructions.steps.map((step, index) => (
                  <p key={index}>{step}</p>
                ))}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
