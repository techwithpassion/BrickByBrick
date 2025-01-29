import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

const createNotificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(["info", "success", "warning", "error"]),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = createNotificationSchema.parse(json)

    const notification = await db.notification.create({
      data: {
        userId: session.user.id,
        title: body.title,
        message: body.message,
        type: body.type,
        read: false,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
