import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const updateNotificationSchema = z.object({
  read: z.boolean(),
})

export async function PATCH(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const notification = await db.notification.findUnique({
      where: {
        id: params.notificationId,
        userId: session.user.id,
      },
    })

    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 })
    }

    const json = await req.json()
    const body = updateNotificationSchema.parse(json)

    const updatedNotification = await db.notification.update({
      where: {
        id: params.notificationId,
      },
      data: {
        read: body.read,
      },
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const notification = await db.notification.findUnique({
      where: {
        id: params.notificationId,
        userId: session.user.id,
      },
    })

    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 })
    }

    await db.notification.delete({
      where: {
        id: params.notificationId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
