import { Metadata } from "next"
import { SettingsForm } from "@/components/features/settings/settings-form"

export const metadata: Metadata = {
  title: "Settings - Brick By Brick",
  description: "Manage your account settings and preferences",
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <SettingsForm />
      </div>
    </div>
  )
}
