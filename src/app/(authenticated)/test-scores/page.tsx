"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface Course {
  id: string
  name: string
  subjects: string[]
}

interface TestScore {
  id: string
  course_id: string
  subject: string
  score: number
  max_score: number
  test_date: string
  notes?: string
}

export default function TestScoresPage() {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [testScores, setTestScores] = useState<TestScore[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [score, setScore] = useState("")
  const [maxScore, setMaxScore] = useState("")
  const [testDate, setTestDate] = useState<Date>()
  const [notes, setNotes] = useState("")
  const [isAddingScore, setIsAddingScore] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load courses
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")

      if (courseError) throw courseError
      setCourses(courseData || [])

      // Load test scores
      const { data: scoreData, error: scoreError } = await supabase
        .from("test_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("test_date", { ascending: false })

      if (scoreError) throw scoreError
      setTestScores(scoreData || [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    }
  }

  const addTestScore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("test_scores").insert({
        user_id: user.id,
        course_id: selectedCourse,
        subject: selectedSubject,
        score: parseFloat(score),
        max_score: parseFloat(maxScore),
        test_date: testDate?.toISOString().split("T")[0],
        notes,
      })

      if (error) throw error

      toast({
        title: "Score added",
        description: "Test score has been recorded successfully",
      })

      setIsAddingScore(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error("Error adding test score:", error)
      toast({
        title: "Error",
        description: "Failed to add test score",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setSelectedCourse("")
    setSelectedSubject("")
    setScore("")
    setMaxScore("")
    setTestDate(undefined)
    setNotes("")
  }

  const getSubjectScores = (subject: string) => {
    return testScores
      .filter((score) => score.subject === subject)
      .map((score) => ({
        date: format(new Date(score.test_date), "MMM d"),
        percentage: (score.score / score.max_score) * 100,
      }))
      .reverse()
  }

  const uniqueSubjects = Array.from(
    new Set(testScores.map((score) => score.subject))
  )

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test Scores</h1>
        <Button onClick={() => setIsAddingScore(true)}>Add Score</Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {uniqueSubjects.map((subject) => {
          const data = getSubjectScores(subject)
          return (
            <Card key={subject} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{subject}</CardTitle>
                <CardDescription>
                  Performance over time (in percentage)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="percentage"
                        stroke="#8884d8"
                        name="Score %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isAddingScore} onOpenChange={setIsAddingScore}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Test Score</DialogTitle>
            <DialogDescription>
              Record your test score to track your progress
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCourse && (
              <div className="flex flex-col gap-2">
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses
                      .find((c) => c.id === selectedCourse)
                      ?.subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <Label>Score</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <Label>Maximum Score</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Test Date</Label>
              <Calendar
                mode="single"
                selected={testDate}
                onSelect={setTestDate}
                disabled={(date) =>
                  date > new Date() || date < new Date("2020-01-01")
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the test"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={addTestScore}
              disabled={
                !selectedCourse ||
                !selectedSubject ||
                !score ||
                !maxScore ||
                !testDate
              }
            >
              Add Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
