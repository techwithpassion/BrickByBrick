"use client"

import { Navigation } from "@/components/shared/navigation"
import { ProfileProvider } from "@/contexts/profile-context"
import { CalendarProvider } from "@/contexts/calendar-context"
import { TimerProvider } from "@/contexts/timer-context"
import { Button } from "@/components/ui/button"
import { Timer, Calendar, Users, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SupabaseProvider } from "@/lib/supabase/supabase-provider"

const sidebarLinks = [
  {
    href: "/dashboard",
    label: "Study Timer",
    icon: Timer,
    description: "Track your study sessions",
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: Calendar,
    description: "Manage your schedule",
  },
  {
    href: "/groups",
    label: "Study Groups",
    icon: Users,
    description: "Collaborate with peers",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    description: "View your progress",
  },
]

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SupabaseProvider>
      <ProfileProvider>
        <CalendarProvider>
          <TimerProvider>
            <div className="min-h-screen">
              <Navigation />
              <div className="flex">
                <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 border-r bg-muted/40 lg:block">
                  <div className="flex h-full flex-col gap-4 p-6">
                    <div className="flex items-center gap-2 px-2">
                      <div className="rounded-md bg-primary/10 p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 text-primary"
                        >
                          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                          <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                          <path d="M12 3v6" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Quick Access</h2>
                        <p className="text-sm text-muted-foreground">
                          Navigate your workspace
                        </p>
                      </div>
                    </div>
                    <nav className="space-y-2 px-2">
                      {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block"
                          >
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className="w-full justify-start"
                            >
                              <link.icon className="mr-2 h-4 w-4" />
                              <div className="flex flex-col items-start text-left">
                                <span>{link.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {link.description}
                                </span>
                              </div>
                            </Button>
                          </Link>
                        )
                      })}
                    </nav>
                  </div>
                </aside>
                <main className="flex-1 overflow-y-auto">
                  <div className="container mx-auto py-6">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </TimerProvider>
        </CalendarProvider>
      </ProfileProvider>
    </SupabaseProvider>
  )
}
