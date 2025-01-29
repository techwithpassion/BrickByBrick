"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/components/shared/auth-provider"
import { useStudyGroup } from "@/contexts/study-group-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { AddMemberDialog } from "./add-member-dialog"
import { EditGroupDialog } from "./edit-group-dialog"
import { GroupDetailsDialog } from "./group-details-dialog"

interface StudyGroup {
  id: string
  group_name: string
  group_description: string | null
  memberCount: number
  created_at: string
  created_by: string
  creator: {
    full_name: string
    email: string
  }
}

export function GroupList() {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const { selectGroup } = useStudyGroup()

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return

      try {
        // First get the user's active memberships
        const { data: memberGroups, error: memberError } = await supabase
          .from("study_group_members")
          .select("group_id")
          .eq("user_id", user.id)
          .eq("status", "active")

        if (memberError) throw memberError

        if (!memberGroups?.length) {
          setGroups([])
          return
        }

        const groupIds = memberGroups.map(mg => mg.group_id)

        // Then get the group details with creator's profile
        const { data: groupData, error: groupError } = await supabase
          .from("study_groups")
          .select(`
            id,
            group_name,
            group_description,
            created_at,
            created_by,
            creator:created_by(
              full_name,
              email
            ),
            member_count:study_group_members(count)
          `)
          .in("id", groupIds)

        if (groupError) throw groupError

        const formattedGroups = groupData.map(group => ({
          id: group.id,
          group_name: group.group_name,
          group_description: group.group_description,
          memberCount: group.member_count[0].count,
          created_at: group.created_at,
          created_by: group.created_by,
          creator: group.creator
        }))

        setGroups(formattedGroups)
      } catch (error) {
        console.error("Error fetching groups:", error)
        toast({
          title: "Error loading groups",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [user, supabase, toast])

  if (isLoading) {
    return <div>Loading groups...</div>
  }

  const isGroupAdmin = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.created_by === user?.id
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      try {
        const { error } = await supabase
          .from("study_groups")
          .delete()
          .eq("id", groupId)
          .eq("created_by", user?.id)

        if (error) throw error

        setGroups(prev => prev.filter(g => g.id !== groupId))
        toast({
          title: "Success",
          description: "Group deleted successfully"
        })
      } catch (error) {
        console.error("Error deleting group:", error)
        toast({
          title: "Error",
          description: "Failed to delete group",
          variant: "destructive"
        })
      }
    }
  }

  const handleRemoveMember = async (groupId: string, userId: string) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        const { error } = await supabase
          .from("study_group_members")
          .delete()
          .eq("group_id", groupId)
          .eq("user_id", userId)

        if (error) throw error

        toast({
          title: "Success",
          description: "Member removed successfully"
        })
      } catch (error) {
        console.error("Error removing member:", error)
        toast({
          title: "Error",
          description: "Failed to remove member",
          variant: "destructive"
        })
      }
    }
  }

  const handleRoleChange = async (
    groupId: string,
    userId: string,
    newRole: string
  ) => {
    try {
      const { error } = await supabase
        .from("study_group_members")
        .update({ member_role: newRole })
        .eq("group_id", groupId)
        .eq("user_id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Member role updated successfully"
      })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive"
      })
    }
  }

  const handleViewGroup = (group: StudyGroup) => {
    setSelectedGroupId(group.id)
    selectGroup(group)
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{group.group_name}</CardTitle>
                  <CardDescription>{group.group_description}</CardDescription>
                </div>
                {isGroupAdmin(group.id) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDeleteGroup(group.id)}>
                        Delete Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">
                  <Users className="mr-1 h-3 w-3" />
                  {group.memberCount} members
                </Badge>
              </div>
              <div className="mt-4 space-x-2">
                <Button onClick={() => handleViewGroup(group)}>
                  View Group
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <GroupDetailsDialog
        groupId={selectedGroupId || ""}
        open={!!selectedGroupId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedGroupId(null)
            selectGroup(null)
          }
        }}
      />
    </div>
  )
}
