import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { startOfDay, subDays } from "date-fns"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get streaks for the last 30 days
    const thirtyDaysAgo = subDays(startOfDay(new Date()), 30)

    const streaks = await db.studyStreak.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    return NextResponse.json(streaks)
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
