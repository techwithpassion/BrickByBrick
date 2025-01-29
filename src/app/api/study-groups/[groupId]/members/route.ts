import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const memberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["MEMBER", "ADMIN"]),
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

    const isAdmin = await db.studyGroupMember.findFirst({
      where: {
        groupId: params.groupId,
        userId: session.user.id,
        role: "ADMIN",
      },
    })

    if (!isAdmin) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const json = await req.json()
    const body = memberSchema.parse(json)

    const user = await db.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const existingMember = await db.studyGroupMember.findFirst({
      where: {
        groupId: params.groupId,
        userId: user.id,
      },
    })

    if (existingMember) {
      return new NextResponse("User is already a member", { status: 400 })
    }

    await db.studyGroupMember.create({
      data: {
        groupId: params.groupId,
        userId: user.id,
        role: body.role,
      },
    })

    const updatedGroup = await db.studyGroup.findUnique({
      where: {
        id: params.groupId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedGroup)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
