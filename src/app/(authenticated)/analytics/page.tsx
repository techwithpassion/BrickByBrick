"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useUser } from "@/hooks/use-user"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from "recharts"
import { 
  format as formatDate,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameWeek,
  isSameMonth,
  subMonths
} from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Clock, Calendar as CalendarIcon, Target, Trophy, TrendingUp, Book } from "lucide-react"

interface StudySession {
  id: string
  created_at: string
  duration_minutes: number
  task_id: string | null
}

interface Task {
  id: string
  title: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage() {
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("week") // week, month, year
  const [viewType, setViewType] = useState("daily") // daily, weekly, monthly
  const supabase = createClientComponentClient()
  const { user } = useUser()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch study sessions for the last 12 months
        const startDate = formatDate(subMonths(new Date(), 12), 'yyyy-MM-dd')
        const { data: sessionsData } = await supabase
          .from("study_sessions")
          .select("*")
          .eq("user_id", user.id)
          .gte('created_at', startDate)
          .order("created_at", { ascending: false })

        if (sessionsData) {
          setStudySessions(sessionsData)
        }

        // Fetch tasks
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)

        if (tasksData) {
          setTasks(tasksData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-zinc-400">Loading analytics...</div>
      </div>
    )
  }

  // Helper function to get time period data
  const getTimePeriodData = () => {
    const now = new Date()
    let startDate, endDate, interval, dateFormat
    
    switch(timeRange) {
      case "month":
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        interval = viewType === "daily" ? eachDayOfInterval : eachWeekOfInterval
        dateFormat = viewType === "daily" ? "MMM d" : "MMM d"
        break
      case "year":
        startDate = subMonths(now, 12)
        endDate = now
        interval = viewType === "monthly" ? eachMonthOfInterval : eachWeekOfInterval
        dateFormat = viewType === "monthly" ? "MMM yyyy" : "MMM d"
        break
      default: // week
        startDate = startOfWeek(now)
        endDate = endOfWeek(now)
        interval = eachDayOfInterval
        dateFormat = "EEE"
    }

    const dates = interval({ start: startDate, end: endDate })
    
    return dates.map(date => {
      const sessionsInPeriod = studySessions.filter(session => {
        const sessionDate = parseISO(session.created_at)
        switch(viewType) {
          case "monthly":
            return isSameMonth(sessionDate, date)
          case "weekly":
            return isSameWeek(sessionDate, date)
          default:
            return isSameDay(sessionDate, date)
        }
      })

      const totalMinutes = sessionsInPeriod.reduce((sum, session) => sum + session.duration_minutes, 0)
      const totalSessions = sessionsInPeriod.length
      const uniqueTasks = new Set(sessionsInPeriod.map(s => s.task_id)).size

      return {
        date: formatDate(date, dateFormat),
        minutes: totalMinutes,
        hours: Math.round(totalMinutes / 60 * 10) / 10,
        sessions: totalSessions,
        tasks: uniqueTasks
      }
    })
  }

  const chartData = getTimePeriodData()

  // Task distribution data
  const taskDistribution = studySessions.reduce((acc, session) => {
    if (session.task_id) {
      const taskTitle = tasks.find(t => t.id === session.task_id)?.title || "Unknown"
      acc[taskTitle] = (acc[taskTitle] || 0) + session.duration_minutes
    }
    return acc
  }, {} as Record<string, number>)

  const pieChartData = Object.entries(taskDistribution)
    .map(([name, value]) => ({
      name,
      value
    }))
    .sort((a, b) => b.value - a.value)

  const totalStudyTime = studySessions.reduce((acc, session) => acc + session.duration_minutes, 0)
  const averageSessionTime = studySessions.length 
    ? Math.round(totalStudyTime / studySessions.length) 
    : 0
  const longestSession = Math.max(...studySessions.map(s => s.duration_minutes))
  const thisWeekSessions = studySessions.filter(session => {
    const sessionDate = parseISO(session.created_at)
    const weekStart = startOfWeek(new Date())
    const weekEnd = endOfWeek(new Date())
    return sessionDate >= weekStart && sessionDate <= weekEnd
  })

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              {timeRange === "year" && <SelectItem value="monthly">Monthly</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-blue-500">
            <Clock className="h-6 w-6" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg text-zinc-400">Total Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
            </div>
            <p className="text-sm text-zinc-400 mt-2">
              Across {studySessions.length} sessions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-emerald-500">
            <Target className="h-6 w-6" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg text-zinc-400">Average Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{averageSessionTime}m</div>
            <p className="text-sm text-zinc-400 mt-2">
              Per study session
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-yellow-500">
            <Trophy className="h-6 w-6" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg text-zinc-400">Longest Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{longestSession}m</div>
            <p className="text-sm text-zinc-400 mt-2">
              Personal best
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-purple-500">
            <Book className="h-6 w-6" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg text-zinc-400">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {new Set(studySessions.map(s => s.task_id)).size}
            </div>
            <p className="text-sm text-zinc-400 mt-2">
              Different tasks studied
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Study Time Chart */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    name="Study Hours"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tasks" 
                    name="Unique Tasks"
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Time of Day</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studySessions.slice(0, 50).map((session) => {
                  const task = tasks.find(t => t.id === session.task_id)
                  return (
                    <TableRow key={session.id}>
                      <TableCell className="text-zinc-300">
                        {formatDate(parseISO(session.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {task?.title || "No task"}
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {session.duration_minutes} minutes
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {formatDate(parseISO(session.created_at), "h:mm a")}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
