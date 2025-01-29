import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get total study time from completed timers
    const timers = await db.timer.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        duration: true,
      },
    })

    const totalStudyTime = timers.reduce(
      (total, timer) => total + timer.duration,
      0
    )

    // Get completed tasks count
    const completedTasks = await db.task.count({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
    })

    // Get active groups count
    const activeGroups = await db.studyGroupMember.count({
      where: {
        userId: session.user.id,
      },
    })

    // Get current and longest streaks
    const streaks = await db.studyStreak.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
    })

    const currentStreak = streaks.length > 0 ? streaks[0].streakCount : 0
    const longestStreak = streaks.reduce(
      (max, streak) => Math.max(max, streak.streakCount),
      0
    )

    return NextResponse.json({
      totalStudyTime,
      completedTasks,
      activeGroups,
      currentStreak,
      longestStreak,
    })
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
