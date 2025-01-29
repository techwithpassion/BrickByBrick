import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import bcrypt from "bcrypt"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const updateSchema = z.object({
  name: z.string().optional(),
  image: z.string().url().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
}).refine((data) => {
  if (data.currentPassword || data.newPassword) {
    return data.currentPassword && data.newPassword
  }
  return true
}, {
  message: "Both current and new password are required to change password",
})

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = updateSchema.parse(json)

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // If changing password, verify current password
    if (body.currentPassword && body.newPassword) {
      if (!user.password) {
        return new NextResponse(
          "Cannot change password for OAuth accounts",
          { status: 400 }
        )
      }

      const isValid = await bcrypt.compare(
        body.currentPassword,
        user.password
      )

      if (!isValid) {
        return new NextResponse("Invalid current password", { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(body.newPassword, 10)
      body.password = hashedPassword
    }

    // Remove password-related fields from the update
    const { currentPassword, newPassword, ...updateData } = body

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
