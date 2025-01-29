"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

interface Subject {
  id: string
  userId: string
  subjectName: string
  subjectDescription: string | null
  subjectColor: string | null
  createdAt: string
}

interface SubjectWithTopics extends Subject {
  topics: {
    id: string
    name: string
    description: string | null
    completed: boolean
    subjectId: string
    createdAt: string
    updatedAt: string
  }[]
  completedTopics: number
}

interface SubjectsContextType {
  subjects: SubjectWithTopics[]
  selectedSubject: SubjectWithTopics | null
  isLoading: boolean
  createSubject: (data: { name: string; description?: string; color?: string }) => Promise<void>
  updateSubject: (
    subjectId: string,
    data: { name: string; description?: string; color?: string }
  ) => Promise<void>
  deleteSubject: (subjectId: string) => Promise<void>
  createTopic: (data: {
    name: string
    description?: string
    subjectId: string
  }) => Promise<void>
  updateTopic: (
    topicId: string,
    data: { name: string; description?: string; completed?: boolean }
  ) => Promise<void>
  deleteTopic: (topicId: string) => Promise<void>
  selectSubject: (subject: SubjectWithTopics | null) => void
  refreshSubjects: () => Promise<void>
}

const SubjectsContext = createContext<SubjectsContextType | undefined>(undefined)

export function SubjectsProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [subjects, setSubjects] = useState<SubjectWithTopics[]>([])
  const [selectedSubject, setSelectedSubject] = useState<SubjectWithTopics | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (error) {
          // If the table doesn't exist, just set empty subjects
          if (error.code === "42P01") {
            setSubjects([])
            return
          }
          throw error
        }

        const subjectsWithTopics = await Promise.all(
          data.map(async (subject) => {
            const { data: topics, error: topicsError } = await supabase
              .from("topics")
              .select("*")
              .eq("subject_id", subject.id)

            if (topicsError) throw topicsError

            return {
              ...subject,
              topics,
              completedTopics: topics.filter((topic) => topic.completed).length,
            }
          })
        )

        setSubjects(subjectsWithTopics)
      } catch (error) {
        console.error("Error fetching subjects:", error)
        toast({
          title: "Error",
          description: "Failed to fetch subjects",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubjects()
  }, [supabase, toast])

  const createSubject = async (data: { name: string; description?: string; color?: string }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { data: subjectData, error } = await supabase
        .from("subjects")
        .insert([
          {
            subject_name: data.name,
            subject_description: data.description,
            subject_color: data.color,
            user_id: session.user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      const { data: topics, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .eq("subject_id", subjectData.id)

      if (topicsError) throw topicsError

      setSubjects((prev) => [
        {
          ...subjectData,
          topics,
          completedTopics: topics.filter((topic) => topic.completed).length,
        },
        ...prev,
      ])

      toast({
        title: "Success",
        description: "Subject created successfully",
      })
    } catch (error) {
      console.error("Error creating subject:", error)
      toast({
        title: "Error",
        description: "Failed to create subject",
        variant: "destructive",
      })
    }
  }

  const updateSubject = async (
    subjectId: string,
    data: { name: string; description?: string; color?: string }
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { data: subjectData, error } = await supabase
        .from("subjects")
        .update({
          subject_name: data.name,
          subject_description: data.description,
          subject_color: data.color,
        })
        .eq("id", subjectId)
        .eq("user_id", session.user.id)
        .select()
        .single()

      if (error) throw error

      const { data: topics, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .eq("subject_id", subjectData.id)

      if (topicsError) throw topicsError

      setSubjects((prev) =>
        prev.map((subject) =>
          subject.id === subjectId
            ? {
                ...subjectData,
                topics,
                completedTopics: topics.filter((topic) => topic.completed).length,
              }
            : subject
        )
      )

      toast({
        title: "Success",
        description: "Subject updated successfully",
      })
    } catch (error) {
      console.error("Error updating subject:", error)
      toast({
        title: "Error",
        description: "Failed to update subject",
        variant: "destructive",
      })
    }
  }

  const deleteSubject = async (subjectId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", subjectId)
        .eq("user_id", session.user.id)

      if (error) throw error

      setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId))

      if (selectedSubject?.id === subjectId) {
        setSelectedSubject(null)
      }

      toast({
        title: "Success",
        description: "Subject deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting subject:", error)
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      })
    }
  }

  const createTopic = async (data: {
    name: string
    description?: string
    subjectId: string
  }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { data: topicData, error } = await supabase
        .from("topics")
        .insert([
          {
            name: data.name,
            description: data.description,
            subject_id: data.subjectId,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setSubjects((prev) =>
        prev.map((subject) =>
          subject.id === data.subjectId
            ? {
                ...subject,
                topics: [...subject.topics, topicData],
                completedTopics: subject.topics.filter((topic) => topic.completed)
                  .length,
              }
            : subject
        )
      )

      toast({
        title: "Success",
        description: "Topic created successfully",
      })
    } catch (error) {
      console.error("Error creating topic:", error)
      toast({
        title: "Error",
        description: "Failed to create topic",
        variant: "destructive",
      })
    }
  }

  const updateTopic = async (
    topicId: string,
    data: { name: string; description?: string; completed?: boolean }
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { data: topicData, error } = await supabase
        .from("topics")
        .update({ name: data.name, description: data.description, completed: data.completed })
        .eq("id", topicId)
        .select()
        .single()

      if (error) throw error

      setSubjects((prev) =>
        prev.map((subject) =>
          subject.topics.find((topic) => topic.id === topicId)
            ? {
                ...subject,
                topics: subject.topics.map((topic) =>
                  topic.id === topicId ? topicData : topic
                ),
                completedTopics: subject.topics.filter((topic) => topic.completed)
                  .length,
              }
            : subject
        )
      )

      toast({
        title: "Success",
        description: "Topic updated successfully",
      })
    } catch (error) {
      console.error("Error updating topic:", error)
      toast({
        title: "Error",
        description: "Failed to update topic",
        variant: "destructive",
      })
    }
  }

  const deleteTopic = async (topicId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("topics")
        .delete()
        .eq("id", topicId)

      if (error) throw error

      setSubjects((prev) =>
        prev.map((subject) =>
          subject.topics.find((topic) => topic.id === topicId)
            ? {
                ...subject,
                topics: subject.topics.filter((topic) => topic.id !== topicId),
                completedTopics: subject.topics.filter((topic) => topic.completed)
                  .length,
              }
            : subject
        )
      )

      toast({
        title: "Success",
        description: "Topic deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting topic:", error)
      toast({
        title: "Error",
        description: "Failed to delete topic",
        variant: "destructive",
      })
    }
  }

  const selectSubject = (subject: SubjectWithTopics | null) => {
    setSelectedSubject(subject)
  }

  const refreshSubjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        // If the table doesn't exist, just set empty subjects
        if (error.code === "42P01") {
          setSubjects([])
          return
        }
        throw error
      }

      const subjectsWithTopics = await Promise.all(
        data.map(async (subject) => {
          const { data: topics, error: topicsError } = await supabase
            .from("topics")
            .select("*")
            .eq("subject_id", subject.id)

          if (topicsError) throw topicsError

          return {
            ...subject,
            topics,
            completedTopics: topics.filter((topic) => topic.completed).length,
          }
        })
      )

      setSubjects(subjectsWithTopics)
    } catch (error) {
      console.error("Error refreshing subjects:", error)
      toast({
        title: "Error",
        description: "Failed to refresh subjects",
        variant: "destructive",
      })
    }
  }

  return (
    <SubjectsContext.Provider
      value={{
        subjects,
        selectedSubject,
        isLoading,
        createSubject,
        updateSubject,
        deleteSubject,
        createTopic,
        updateTopic,
        deleteTopic,
        selectSubject,
        refreshSubjects,
      }}
    >
      {children}
    </SubjectsContext.Provider>
  )
}

export function useSubjects() {
  const context = useContext(SubjectsContext)
  if (context === undefined) {
    throw new Error("useSubjects must be used within a SubjectsProvider")
  }
  return context
}
