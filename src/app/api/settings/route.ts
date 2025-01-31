import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("notification_settings")
      .eq("user_id", user.id)
      .single()

    if (settingsError) {
      if (settingsError.code === "PGRST116") {
        // No settings found, return default settings
        return NextResponse.json({
          notification_settings: {
            enabled: false,
            morningTime: "08:00",
            eveningTime: "22:00",
            morningMessage: "Good morning! Ready to build your knowledge brick by brick?",
            eveningMessage: "Good night! Great job on your progress today."
          }
        })
      }
      throw settingsError
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}
