import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = subjectSchema.parse(json)

    const subject = await db.subject.create({
      data: {
        name: body.name,
        description: body.description,
        userId: session.user.id,
      },
      include: {
        topics: true,
      },
    })

    return NextResponse.json(subject)
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

    const subjects = await db.subject.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        topics: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate completed topics for each subject
    const subjectsWithStats = subjects.map((subject) => ({
      ...subject,
      completedTopics: subject.topics.filter((topic) => topic.completed).length,
    }))

    return NextResponse.json(subjectsWithStats)
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
