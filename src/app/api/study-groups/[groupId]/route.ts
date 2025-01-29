import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function PATCH(
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
    const { name, description } = json

    const group = await db.studyGroup.update({
      where: {
        id: params.groupId,
      },
      data: {
        name,
        description,
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

    return NextResponse.json(group)
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
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

    await db.studyGroup.delete({
      where: {
        id: params.groupId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
