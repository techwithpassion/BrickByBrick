import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  subjectId: z.string().min(1),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  dueDate: z.date(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = taskSchema.parse(json)

    const task = await db.task.create({
      data: {
        ...body,
        userId: session.user.id,
      },
      include: {
        subject: true,
        topic: true,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const tasks = await db.task.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subject: true,
        topic: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
