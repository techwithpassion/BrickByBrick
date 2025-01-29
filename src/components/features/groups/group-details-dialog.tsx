"use client"

import * as React from "react"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { useAuth } from "@/components/shared/auth-provider"
import { useStudyGroup } from "@/contexts/study-group-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare,
  Clock
} from "lucide-react"
import { GroupChat } from "./group-chat"

interface Member {
  id: string
  user_id: string
  member_role: string
  joined_at: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
    email: string
  }
}

interface StudySession {
  id: string
  session_start_time: string
  session_end_time: string | null
  session_duration: number | null
  session_notes: string | null
  user: {
    full_name: string | null
  }
}

interface GroupDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GroupDetailsDialog({ 
  open, 
  onOpenChange 
}: GroupDetailsDialogProps) {
  const [members, setMembers] = React.useState<Member[]>([])
  const [sessions, setSessions] = React.useState<StudySession[]>([])
  const [loading, setLoading] = React.useState(true)
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()
  const { selectedGroup } = useStudyGroup()

  const fetchGroupDetails = React.useCallback(async () => {
    try {
      setLoading(true)

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from("study_group_members")
        .select(`
          id,
          user_id,
          member_role,
          joined_at,
          profiles:user_id(
            full_name,
            avatar_url,
            email
          )
        `)
        .eq("group_id", selectedGroup.id)
        .eq("status", "active")

      if (membersError) throw membersError
      setMembers(membersData)

      // Fetch recent study sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("study_sessions")
        .select(`
          id,
          session_start_time,
          session_end_time,
          session_duration,
          session_notes,
          user:user_id(
            full_name
          )
        `)
        .eq("group_id", selectedGroup.id)
        .order("session_start_time", { ascending: false })
        .limit(10)

      if (sessionsError) throw sessionsError
      setSessions(sessionsData)

    } catch (error) {
      console.error("Error fetching group details:", error)
      toast({
        title: "Error",
        description: "Failed to load group details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [selectedGroup, supabase, toast])

  React.useEffect(() => {
    if (open && selectedGroup) {
      fetchGroupDetails()
    }
  }, [open, selectedGroup, fetchGroupDetails])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (!selectedGroup) {
    return null
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{selectedGroup.group_name}</DialogTitle>
          <DialogDescription>
            {selectedGroup.group_description || "No description provided"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Clock className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="resources">
              <BookOpen className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Members ({members.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={member.profiles.avatar_url || undefined} />
                            <AvatarFallback>
                              {member.profiles.full_name?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {member.profiles.full_name || member.profiles.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Joined {new Date(member.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge>
                          {member.member_role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <GroupChat />
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Study Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {session.user.full_name || "Anonymous"}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.session_start_time).toLocaleDateString()}
                          </span>
                        </div>
                        {session.session_duration && (
                          <p className="text-sm text-muted-foreground">
                            Duration: {formatDuration(session.session_duration)}
                          </p>
                        )}
                        {session.session_notes && (
                          <p className="text-sm">{session.session_notes}</p>
                        )}
                      </div>
                    ))}
                    {sessions.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No study sessions recorded yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Study Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                  Coming soon! Share study materials with your group.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
