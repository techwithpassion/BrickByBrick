"use client"

import { Navigation } from "@/components/shared/navigation"
import { ProfileProvider } from "@/contexts/profile-context"
import { CalendarProvider } from "@/contexts/calendar-context"
import { TimerProvider } from "@/contexts/timer-context"
import { SupabaseProvider } from "@/lib/supabase/supabase-provider"
import { Toaster } from "@/components/ui/toaster"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SupabaseProvider>
      <ProfileProvider>
        <CalendarProvider>
          <TimerProvider>
            <div className="flex min-h-screen bg-black">
              <Navigation />
              <div className="flex-1 lg:pl-64">
                {/* Add top padding on mobile to account for fixed header */}
                <div className="pt-16 lg:pt-0">
                  <div className="animate-in fade-in duration-500">
                    {children}
                  </div>
                </div>
              </div>
            </div>
            <Toaster />
          </TimerProvider>
        </CalendarProvider>
      </ProfileProvider>
    </SupabaseProvider>
  )
}
