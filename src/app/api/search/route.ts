import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const searchSchema = z.object({
  query: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { query } = searchSchema.parse(json)

    const [subjects, tasks, groups] = await Promise.all([
      // Search subjects
      db.subject.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),

      // Search tasks
      db.task.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),

      // Search groups
      db.studyGroup.findMany({
        where: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ])

    return NextResponse.json({
      subjects,
      tasks,
      groups,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
