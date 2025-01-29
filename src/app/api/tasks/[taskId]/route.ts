import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const task = await db.task.findUnique({
      where: {
        id: params.taskId,
        userId: session.user.id,
      },
    })

    if (!task) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const json = await req.json()

    const updatedTask = await db.task.update({
      where: {
        id: params.taskId,
      },
      data: json,
      include: {
        subject: true,
        topic: true,
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const task = await db.task.findUnique({
      where: {
        id: params.taskId,
        userId: session.user.id,
      },
    })

    if (!task) {
      return new NextResponse("Not Found", { status: 404 })
    }

    await db.task.delete({
      where: {
        id: params.taskId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
