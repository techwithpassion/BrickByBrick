"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

interface StudyGroup {
  id: string
  group_name: string
  group_description: string | null
  created_by: string
  created_at: string
  updated_at: string
}

interface StudyGroupContextType {
  groups: StudyGroup[]
  selectedGroup: StudyGroup | null
  isLoading: boolean
  createGroup: (data: { name: string; description?: string }) => Promise<void>
  updateGroup: (groupId: string, data: { name: string; description?: string }) => Promise<void>
  deleteGroup: (groupId: string) => Promise<void>
  joinGroup: (groupId: string) => Promise<void>
  leaveGroup: (groupId: string) => Promise<void>
  selectGroup: (group: StudyGroup | null) => void
}

const StudyGroupContext = createContext<StudyGroupContextType | undefined>(undefined)

export function StudyGroupProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: memberGroups, error: memberError } = await supabase
          .from("study_group_members")
          .select("group_id")
          .eq("user_id", session.user.id)
          .eq("status", "active")

        if (memberError) {
          // If the table doesn't exist, just set empty groups
          if (memberError.code === "42P01") {
            setGroups([])
            return
          }
          throw memberError
        }

        const groupIds = memberGroups.map(mg => mg.group_id)

        if (groupIds.length === 0) {
          setGroups([])
          return
        }

        const { data: groups, error: groupsError } = await supabase
          .from("study_groups")
          .select("id, group_name, group_description, created_by, created_at, updated_at")
          .in("id", groupIds)
          .order("created_at", { ascending: false })

        if (groupsError) {
          // If the table doesn't exist, just set empty groups
          if (groupsError.code === "42P01") {
            setGroups([])
            return
          }
          throw groupsError
        }

        setGroups(groups)
      } catch (error) {
        console.error("Error fetching groups:", error)
        toast({
          title: "Error",
          description: "Failed to fetch study groups",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()

    // Subscribe to group changes
    const channel = supabase
      .channel("study_groups")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "study_groups",
        },
        () => {
          fetchGroups()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, toast])

  const createGroup = async (data: { name: string; description?: string }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("study_groups")
        .insert({
          group_name: data.name,
          group_description: data.description,
          created_by: session.user.id,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Study group created successfully",
      })
    } catch (error) {
      console.error("Error creating group:", error)
      toast({
        title: "Error",
        description: "Failed to create study group",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateGroup = async (groupId: string, data: { name: string; description?: string }) => {
    try {
      const { error } = await supabase
        .from("study_groups")
        .update({
          group_name: data.name,
          group_description: data.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", groupId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Study group updated successfully",
      })
    } catch (error) {
      console.error("Error updating group:", error)
      toast({
        title: "Error",
        description: "Failed to update study group",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from("study_groups")
        .delete()
        .eq("id", groupId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Study group deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting group:", error)
      toast({
        title: "Error",
        description: "Failed to delete study group",
        variant: "destructive",
      })
      throw error
    }
  }

  const joinGroup = async (groupId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("study_group_members")
        .insert({
          group_id: groupId,
          user_id: session.user.id,
          status: "active",
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Joined study group successfully",
      })
    } catch (error) {
      console.error("Error joining group:", error)
      toast({
        title: "Error",
        description: "Failed to join study group",
        variant: "destructive",
      })
      throw error
    }
  }

  const leaveGroup = async (groupId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("study_group_members")
        .update({ status: "inactive" })
        .eq("group_id", groupId)
        .eq("user_id", session.user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Left study group successfully",
      })
    } catch (error) {
      console.error("Error leaving group:", error)
      toast({
        title: "Error",
        description: "Failed to leave study group",
        variant: "destructive",
      })
      throw error
    }
  }

  const selectGroup = (group: StudyGroup | null) => {
    setSelectedGroup(group)
  }

  return (
    <StudyGroupContext.Provider
      value={{
        groups,
        selectedGroup,
        isLoading,
        createGroup,
        updateGroup,
        deleteGroup,
        joinGroup,
        leaveGroup,
        selectGroup,
      }}
    >
      {children}
    </StudyGroupContext.Provider>
  )
}

export function useStudyGroup() {
  const context = useContext(StudyGroupContext)
  if (context === undefined) {
    throw new Error("useStudyGroup must be used within a StudyGroupProvider")
  }
  return context
}
