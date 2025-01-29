import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function DELETE(
  req: Request,
  { params }: { params: { timerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const timer = await db.timer.findUnique({
      where: {
        id: params.timerId,
        userId: session.user.id,
      },
    })

    if (!timer) {
      return new NextResponse("Not Found", { status: 404 })
    }

    await db.timer.delete({
      where: {
        id: params.timerId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { timerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { name, duration, isPomodoro } = json

    const timer = await db.timer.findUnique({
      where: {
        id: params.timerId,
        userId: session.user.id,
      },
    })

    if (!timer) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const updatedTimer = await db.timer.update({
      where: {
        id: params.timerId,
      },
      data: {
        name,
        duration,
        isPomodoro,
      },
    })

    return NextResponse.json(updatedTimer)
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
