"use client"

import { ThemeProvider } from "@/components/shared/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/shared/auth-provider"
import { SearchProvider } from "@/contexts/search-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { StudyGroupProvider } from "@/contexts/study-group-context"
import { SupabaseProvider } from "@/lib/supabase/supabase-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <NotificationsProvider>
          <SearchProvider>
            <SupabaseProvider>
              <StudyGroupProvider>
                {children}
              </StudyGroupProvider>
            </SupabaseProvider>
          </SearchProvider>
        </NotificationsProvider>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}
