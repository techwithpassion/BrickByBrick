import { Metadata } from "next"
import { ProfileProvider } from "@/contexts/profile-context"
import { ProfileForm } from "@/components/features/profile/profile-form"
import { StudyStats } from "@/components/features/profile/study-stats"
import { StudyStreak } from "@/components/features/profile/study-streak"

export const metadata: Metadata = {
  title: "Profile - Brick By Brick",
  description: "Manage your account and view your study statistics",
}

export default function ProfilePage() {
  return (
    <ProfileProvider>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,2fr]">
          <div className="space-y-8">
            <ProfileForm />
            <StudyStreak />
          </div>
          <StudyStats />
        </div>
      </div>
    </ProfileProvider>
  )
}
