"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  due_date: string
  completed: boolean
}

interface Holiday {
  date: string
  name: string
  type: string
}

interface TestDay {
  id: string
  user_id: string
  course_id: string
  subject: string
  test_date: string
  description?: string
}

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().min(1, "Due date is required"),
})

const taskColors = [
  { bg: "bg-blue-500/10", text: "text-blue-500" },
  { bg: "bg-purple-500/10", text: "text-purple-500" },
  { bg: "bg-pink-500/10", text: "text-pink-500" },
  { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  { bg: "bg-orange-500/10", text: "text-orange-500" },
]

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isAddingTask, setIsAddingTask] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: format(selectedDate, "yyyy-MM-dd"),
    },
  })

  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [isDeleteMode, setIsDeleteMode] = useState(false)

  const [testDays, setTestDays] = useState<TestDay[]>([])
  const [courses, setCourses] = useState<{ id: string; name: string; subjects: string[] }[]>([])
  const [isAddingTest, setIsAddingTest] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [testDescription, setTestDescription] = useState("")

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    )
  }

  const deleteSelectedTasks = async () => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .in("id", selectedTasks)

      if (error) throw error

      toast({
        title: "Success",
        description: "Selected tasks deleted successfully",
      })

      setSelectedTasks([])
      setIsDeleteMode(false)
      loadTasks()
    } catch (error) {
      console.error("Error deleting tasks:", error)
      toast({
        title: "Error",
        description: "Failed to delete tasks",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    loadTasks()
    loadHolidays()
    loadTestDays()
  }, [currentMonth])

  useEffect(() => {
    if (selectedDate) {
      form.setValue("due_date", format(selectedDate, "yyyy-MM-dd"))
    }
  }, [selectedDate, form])

  async function loadTasks() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get tasks for the visible calendar range (including prev/next month overflow)
      const visibleStart = startOfWeek(startOfMonth(currentMonth))
      const visibleEnd = endOfWeek(endOfMonth(currentMonth))

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .gte("due_date", format(visibleStart, "yyyy-MM-dd"))
        .lte("due_date", format(visibleEnd, "yyyy-MM-dd"))
        .order("due_date", { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error loading tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      })
    }
  }

  async function loadHolidays() {
    try {
      const year = currentMonth.getFullYear()
      const response = await fetch(
        `https://calendarific.com/api/v2/holidays?api_key=${process.env.NEXT_PUBLIC_CALENDARIFIC_API_KEY}&country=IN&year=${year}`
      )
      const data = await response.json()
      setHolidays(data.response.holidays || [])
    } catch (error) {
      console.error("Error loading holidays:", error)
    }
  }

  async function loadTestDays() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: testData, error: testError } = await supabase
        .from("test_days")
        .select("*")
        .eq("user_id", user.id)

      if (testError) throw testError
      setTestDays(testData || [])

      // Load courses
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")

      if (courseError) throw courseError
      setCourses(courseData || [])
    } catch (error) {
      console.error("Error loading test days:", error)
    }
  }

  async function onSubmit(values: z.infer<typeof taskFormSchema>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: values.title,
        description: values.description,
        due_date: values.due_date,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Task added successfully",
      })

      form.reset()
      setIsAddingTask(false)
      loadTasks()
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      })
    }
  }

  async function addTestDay() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("test_days").insert({
        user_id: user.id,
        course_id: selectedCourse,
        subject: selectedSubject,
        test_date: selectedDate.toISOString().split("T")[0],
        description: testDescription,
      })

      if (error) throw error

      toast({
        title: "Test day added",
        description: "Test has been scheduled successfully",
      })

      setIsAddingTest(false)
      setSelectedCourse("")
      setSelectedSubject("")
      setTestDescription("")
      loadTestDays()
    } catch (error) {
      console.error("Error adding test day:", error)
      toast({
        title: "Error",
        description: "Failed to add test day",
        variant: "destructive",
      })
    }
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Get all dates that should be displayed (including prev/next month overflow)
  const calendarDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth))
    const end = endOfWeek(endOfMonth(currentMonth))
    return eachDayOfInterval({ start, end })
  }

  const tasksForDate = (date: Date) =>
    tasks.filter((task) => isSameDay(new Date(task.due_date), date))

  const holidaysForDate = (date: Date) =>
    holidays.filter((holiday) => isSameDay(new Date(holiday.date), date))

  const testDaysForDate = (date: Date) =>
    testDays.filter((test) => isSameDay(new Date(test.test_date), date))

  const isCurrentMonth = (date: Date) =>
    date.getMonth() === currentMonth.getMonth()

  return (
    <div className="min-h-screen bg-black">
      <div className="grid grid-cols-[300px,1fr] h-screen">
        {/* Sidebar */}
        <div className="border-r border-white/10 p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              {format(selectedDate, "MMMM d, yyyy")}
            </h2>
          </div>

          {holidaysForDate(selectedDate).length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-white/60">Holidays</h3>
              {holidaysForDate(selectedDate).map((holiday) => (
                <div
                  key={holiday.name}
                  className="mb-2 rounded-md bg-red-500/10 p-2 text-sm text-red-500"
                >
                  {holiday.name}
                </div>
              ))}
            </div>
          )}

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white/60">Tasks</h3>
              <div className="flex items-center gap-2">
                {isDeleteMode && selectedTasks.length > 0 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={deleteSelectedTasks}
                  >
                    Delete ({selectedTasks.length})
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={isDeleteMode ? "secondary" : "outline"}
                  onClick={() => {
                    setIsDeleteMode(!isDeleteMode)
                    setSelectedTasks([])
                  }}
                >
                  {isDeleteMode ? "Cancel" : "Select"}
                </Button>
                <Button size="sm" onClick={() => setIsAddingTask(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {tasksForDate(selectedDate).length > 0 ? (
                tasksForDate(selectedDate).map((task) => {
                  const colorIndex = Math.abs(
                    task.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
                  ) % taskColors.length
                  const { bg, text } = taskColors[colorIndex]

                  return (
                    <Card
                      key={task.id}
                      className={`p-3 ${isDeleteMode ? "cursor-pointer" : ""} ${
                        selectedTasks.includes(task.id) ? "ring-2 ring-white" : ""
                      }`}
                      onClick={() => isDeleteMode && toggleTaskSelection(task.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium ${text}`}>{task.title}</h4>
                          {task.description && (
                            <p className="mt-1 text-sm text-white/60">
                              {task.description}
                            </p>
                          )}
                        </div>
                        {!isDeleteMode && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                const { error } = supabase
                                  .from("tasks")
                                  .delete()
                                  .eq("id", task.id)
                                  .then(({ error }) => {
                                    if (!error) loadTasks()
                                  })
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                const { error } = supabase
                                  .from("tasks")
                                  .update({ completed: !task.completed })
                                  .eq("id", task.id)
                                  .then(({ error }) => {
                                    if (!error) loadTasks()
                                  })
                              }}
                            >
                              {task.completed ? "Completed" : "Mark Done"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })
              ) : (
                <p className="text-center text-sm text-white/60">
                  No tasks for this date
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white/60">Tests</h3>
              <Button size="sm" onClick={() => setIsAddingTest(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {testDaysForDate(selectedDate).length > 0 ? (
              testDaysForDate(selectedDate).map((test) => (
                <Card key={test.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-red-500">
                        {courses.find((c) => c.id === test.course_id)?.name} - {test.subject}
                      </h4>
                      {test.description && (
                        <p className="mt-1 text-sm text-white/60">
                          {test.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-sm text-white/60">
                No tests scheduled for this date
              </p>
            )}
          </div>
        </div>

        {/* Main Calendar */}
        <div className="p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-white">
                {format(currentMonth, "MMMM yyyy")}
              </h1>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Create a new task for {format(selectedDate, "MMMM d, yyyy")}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Add Task</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddingTest} onOpenChange={setIsAddingTest}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Test Day</DialogTitle>
                  <DialogDescription>
                    Schedule a test for {format(selectedDate, "MMMM d, yyyy")}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label>Course</label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                      <option value="">Select course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCourse && (
                    <div className="flex flex-col gap-2">
                      <label>Subject</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                      >
                        <option value="">Select subject</option>
                        {courses
                          .find((c) => c.id === selectedCourse)
                          ?.subjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label>Description (Optional)</label>
                    <textarea
                      value={testDescription}
                      onChange={(e) => setTestDescription(e.target.value)}
                      placeholder="Add any notes about the test"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={addTestDay}
                    disabled={!selectedCourse || !selectedSubject}
                  >
                    Add Test
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-7 gap-px bg-white/5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-white/60"
              >
                {day}
              </div>
            ))}
            {calendarDays().map((date) => {
              const dayTasks = tasksForDate(date)
              const dayHolidays = holidaysForDate(date)
              const dayTestDays = testDaysForDate(date)
              const isSelected = isSameDay(date, selectedDate)
              const isToday = isSameDay(date, new Date())

              return (
                <button
                  key={date.toString()}
                  className={`
                    min-h-[120px] p-2 text-left hover:bg-white/5
                    ${isSelected ? "bg-white/10" : ""}
                    ${!isCurrentMonth(date) ? "opacity-50" : ""}
                    ${isToday ? "ring-2 ring-blue-500" : ""}
                  `}
                  onClick={() => setSelectedDate(date)}
                >
                  <span
                    className={`
                      inline-block rounded-full w-8 h-8 text-center leading-8
                      ${isSelected ? "bg-white text-black" : "text-white"}
                      ${isToday ? "font-bold" : ""}
                    `}
                  >
                    {format(date, "d")}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayHolidays.map((holiday) => (
                      <div
                        key={holiday.name}
                        className="truncate rounded bg-red-500/10 px-1 py-px text-xs text-red-500"
                        title={holiday.name}
                      >
                        {holiday.name}
                      </div>
                    ))}
                    {dayTestDays.map((test) => (
                      <div
                        key={test.id}
                        className="truncate rounded bg-red-500/20 px-1 py-px text-xs text-red-500"
                        title={`${courses.find((c) => c.id === test.course_id)?.name} - ${test.subject}`}
                      >
                        Test: {test.subject}
                      </div>
                    ))}
                    {dayTasks.map((task) => {
                      const colorIndex = Math.abs(
                        task.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
                      ) % taskColors.length
                      const { bg, text } = taskColors[colorIndex]

                      return (
                        <div
                          key={task.id}
                          className={`
                            truncate rounded px-1 py-px text-xs
                            ${task.completed ? "bg-green-500/10 text-green-500" : `${bg} ${text}`}
                            ${selectedTasks.includes(task.id) ? "ring-1 ring-white" : ""}
                          `}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      )
                    })}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
