import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const topicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  subjectId: z.string(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = topicSchema.parse(json)

    // Verify that the subject belongs to the user
    const subject = await db.subject.findUnique({
      where: {
        id: body.subjectId,
        userId: session.user.id,
      },
    })

    if (!subject) {
      return new NextResponse("Subject not found", { status: 404 })
    }

    const topic = await db.topic.create({
      data: {
        name: body.name,
        description: body.description,
        subjectId: body.subjectId,
        completed: false,
      },
    })

    // Get updated subject with topics
    const updatedSubject = await db.subject.findUnique({
      where: {
        id: body.subjectId,
      },
      include: {
        topics: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (!updatedSubject) {
      return new NextResponse("Subject not found", { status: 404 })
    }

    return NextResponse.json({
      ...updatedSubject,
      completedTopics: updatedSubject.topics.filter(
        (topic) => topic.completed
      ).length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
