import { Metadata } from "next"
import { ProfileForm } from "@/components/features/profile/profile-form"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Profile - Brick By Brick",
  description: "Manage your profile settings",
}

export default function ProfilePage() {
  return (
    <div className="container max-w-2xl py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings
          </p>
        </div>

        <Card className="p-6">
          <ProfileForm />
        </Card>
      </div>
    </div>
  )
}
