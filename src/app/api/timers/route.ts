import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const timerSchema = z.object({
  name: z.string().min(1),
  duration: z.number().min(1).max(180),
  isPomodoro: z.boolean().default(false),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = timerSchema.parse(json)

    const timer = await db.timer.create({
      data: {
        name: body.name,
        duration: body.duration,
        isPomodoro: body.isPomodoro,
        userId: session.user.id,
      },
    })

    return NextResponse.json(timer)
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

    const timers = await db.timer.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(timers)
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
