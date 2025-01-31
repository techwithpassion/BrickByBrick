"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/hooks/use-user"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { StreakStats } from "@/components/features/dashboard/streak-stats"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Timer,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  ArrowRight,
  Calendar,
  BarChart3
} from "lucide-react"

interface StudySession {
  session_duration: number
  session_start_time: string
  task_id: string | null
}

interface Task {
  id: string
  title: string
  completed: boolean
  due_date: string | null
}

interface StudySession {
  id: string
  duration_minutes: number
  created_at: string
}

interface Task {
  id: string
  title: string
  completed: boolean
  created_at: string
}

export default function DashboardPage() {
  const { user } = useUser()
  const { data, error, isLoading } = useDashboardData(user?.id)

  const timeOfDay = new Date().getHours()
  let greeting = "Good morning"
  if (timeOfDay >= 12 && timeOfDay < 17) {
    greeting = "Good afternoon"
  } else if (timeOfDay >= 17) {
    greeting = "Good evening"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-zinc-400">Loading your dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-400">Error loading dashboard data</div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { profile, sessions, tasks, recentSessions } = data

  // Prepare data for charts
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  })

  const studyTimeData = daysInMonth.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd")
    const dayStudyTime = sessions
      .filter((session) => session.session_start_time.startsWith(dayStr))
      .reduce((sum, session) => sum + session.session_duration, 0)

    return {
      date: format(day, "MMM d"),
      minutes: dayStudyTime,
    }
  })

  const taskStatusData = [
    {
      name: "Completed",
      value: tasks.filter((task) => task.completed).length,
    },
    {
      name: "In Progress",
      value: tasks.filter((task) => !task.completed).length,
    },
  ]

  const COLORS = ["#22c55e", "#3b82f6"]
  const totalStudyTime = recentSessions.reduce((acc, session) => acc + session.duration_minutes, 0)
  const completedTasks = tasks.filter(task => task.completed).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">
              {greeting}, {profile?.full_name || user?.email?.split("@")[0]}
            </h1>
            <Badge variant="outline" className="text-base px-4 py-1">
              {format(new Date(), "EEEE, MMMM do")}
            </Badge>
          </div>
          <p className="text-lg text-zinc-400 max-w-2xl">
            Track your progress, manage tasks, and maintain your study momentum. Every small step counts towards your bigger goals.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/timer">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-600/50 transition-all group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute right-4 top-4 text-blue-500">
                <Timer className="h-6 w-6" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg text-zinc-400">Start Timer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">Begin a focused study session</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/calendar">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-emerald-600/50 transition-all group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute right-4 top-4 text-emerald-500">
                <Calendar className="h-6 w-6" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg text-zinc-400">View Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">Plan your study schedule</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-600/50 transition-all group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute right-4 top-4 text-purple-500">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg text-zinc-400">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">Track your progress</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Streak Stats */}
        <StreakStats />

        {/* Study Time Chart */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">Study Time This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fill: "#71717a" }}
                    tickLine={{ stroke: "#71717a" }}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: "#71717a" }}
                    tickLine={{ stroke: "#71717a" }}
                    label={{
                      value: "Minutes",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#71717a",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "6px",
                    }}
                    labelStyle={{ color: "#ffffff" }}
                    itemStyle={{ color: "#ffffff" }}
                  />
                  <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "6px",
                    }}
                    labelStyle={{ color: "#ffffff" }}
                    itemStyle={{ color: "#ffffff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-zinc-400">Study Time</CardTitle>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
              </div>
              <p className="text-sm text-zinc-400 mt-1">Last {recentSessions.length} sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-zinc-400">Tasks</CardTitle>
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{tasks.length}</div>
              <p className="text-sm text-zinc-400 mt-1">Active tasks</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-zinc-400">Completed</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{completedTasks}</div>
              <p className="text-sm text-zinc-400 mt-1">Tasks finished</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-zinc-400">Streak</CardTitle>
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">3 days</div>
              <p className="text-sm text-zinc-400 mt-1">Keep it up!</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white">Recent Tasks</CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                    View all <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <p className="text-zinc-400">No tasks yet. Start by creating one!</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            task.completed ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                        />
                        <span className="text-white">{task.title}</span>
                      </div>
                      <span className="text-sm text-zinc-400">
                        {format(new Date(task.created_at), "MMM d")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white">Recent Sessions</CardTitle>
                <Link href="/analytics">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                    View all <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.length === 0 ? (
                  <p className="text-zinc-400">No sessions yet. Start the timer to begin!</p>
                ) : (
                  recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-white">
                          {session.duration_minutes} minutes
                        </span>
                      </div>
                      <span className="text-sm text-zinc-400">
                        {format(new Date(session.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
