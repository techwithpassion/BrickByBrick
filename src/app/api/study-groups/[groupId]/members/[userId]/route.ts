import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  req: Request,
  { params }: { params: { groupId: string; userId: string } }
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
    const { role } = json

    if (!["MEMBER", "ADMIN"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 })
    }

    await db.studyGroupMember.update({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: params.userId,
        },
      },
      data: {
        role,
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
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { groupId: string; userId: string } }
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

    const adminCount = await db.studyGroupMember.count({
      where: {
        groupId: params.groupId,
        role: "ADMIN",
      },
    })

    const memberToDelete = await db.studyGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: params.userId,
        },
      },
    })

    if (memberToDelete?.role === "ADMIN" && adminCount <= 1) {
      return new NextResponse(
        "Cannot remove the last admin from the group",
        { status: 400 }
      )
    }

    await db.studyGroupMember.delete({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: params.userId,
        },
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
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
