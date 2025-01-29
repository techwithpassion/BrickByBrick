import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const subject = await db.subject.findUnique({
      where: {
        id: params.subjectId,
        userId: session.user.id,
      },
    })

    if (!subject) {
      return new NextResponse("Subject not found", { status: 404 })
    }

    const json = await req.json()
    const body = subjectSchema.parse(json)

    const updatedSubject = await db.subject.update({
      where: {
        id: params.subjectId,
      },
      data: {
        name: body.name,
        description: body.description,
      },
      include: {
        topics: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

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
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const subject = await db.subject.findUnique({
      where: {
        id: params.subjectId,
        userId: session.user.id,
      },
    })

    if (!subject) {
      return new NextResponse("Subject not found", { status: 404 })
    }

    await db.subject.delete({
      where: {
        id: params.subjectId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
