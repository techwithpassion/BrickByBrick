import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const messageSchema = z.object({
  content: z.string().min(1),
})

export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const isMember = await db.studyGroupMember.findFirst({
      where: {
        groupId: params.groupId,
        userId: session.user.id,
      },
    })

    if (!isMember) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await req.json()
    const body = messageSchema.parse(json)

    const message = await db.message.create({
      data: {
        content: body.content,
        groupId: params.groupId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const isMember = await db.studyGroupMember.findFirst({
      where: {
        groupId: params.groupId,
        userId: session.user.id,
      },
    })

    if (!isMember) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const messages = await db.message.findMany({
      where: {
        groupId: params.groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100, // Limit to last 100 messages
    })

    return NextResponse.json(messages)
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
