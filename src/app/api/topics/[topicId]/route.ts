import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const topicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  completed: z.boolean(),
})

export async function PATCH(
  req: Request,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const topic = await db.topic.findUnique({
      where: {
        id: params.topicId,
      },
      include: {
        subject: true,
      },
    })

    if (!topic || topic.subject.userId !== session.user.id) {
      return new NextResponse("Topic not found", { status: 404 })
    }

    const json = await req.json()
    const body = topicSchema.parse(json)

    await db.topic.update({
      where: {
        id: params.topicId,
      },
      data: {
        name: body.name,
        description: body.description,
        completed: body.completed,
      },
    })

    // Get updated subject with topics
    const updatedSubject = await db.subject.findUnique({
      where: {
        id: topic.subjectId,
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

export async function DELETE(
  req: Request,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const topic = await db.topic.findUnique({
      where: {
        id: params.topicId,
      },
      include: {
        subject: true,
      },
    })

    if (!topic || topic.subject.userId !== session.user.id) {
      return new NextResponse("Topic not found", { status: 404 })
    }

    const subjectId = topic.subjectId

    await db.topic.delete({
      where: {
        id: params.topicId,
      },
    })

    // Get updated subject with topics
    const updatedSubject = await db.subject.findUnique({
      where: {
        id: subjectId,
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
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
