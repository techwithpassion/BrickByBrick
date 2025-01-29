import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  soundEnabled: z.boolean(),
})

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = settingsSchema.parse(json)

    // Update user settings
    const user = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: body.name,
        email: body.email,
      },
    })

    // Create or update user preferences
    await db.userPreferences.upsert({
      where: {
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
        theme: body.theme,
        emailNotifications: body.emailNotifications,
        pushNotifications: body.pushNotifications,
        soundEnabled: body.soundEnabled,
      },
      update: {
        theme: body.theme,
        emailNotifications: body.emailNotifications,
        pushNotifications: body.pushNotifications,
        soundEnabled: body.soundEnabled,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
