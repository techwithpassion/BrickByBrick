import { Metadata } from "next"
import { HelpContent } from "@/components/features/help/help-content"

export const metadata: Metadata = {
  title: "Help & Documentation - Brick By Brick",
  description: "Learn how to use Brick By Brick effectively",
}

export default function HelpPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Help & Documentation</h1>
          <p className="text-muted-foreground">
            Learn how to use Brick By Brick effectively
          </p>
        </div>
        <HelpContent />
      </div>
    </div>
  )
}
