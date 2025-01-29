"use client"

import { useEffect, useState, useRef } from "react"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { useAuth } from "@/components/shared/auth-provider"
import { useStudyGroup } from "@/contexts/study-group-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  sender: {
    full_name: string | null
    avatar_url: string | null
    email: string
  }
}

export function GroupChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()
  const { selectedGroup } = useStudyGroup()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedGroup) return

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select(`
            id,
            content,
            created_at,
            user_id,
            sender:user_id(
              full_name,
              avatar_url,
              email
            )
          `)
          .eq("group_id", selectedGroup.id)
          .order("created_at", { ascending: true })

        if (error) throw error
        setMessages(data)
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error loading messages",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `group_id=eq.${selectedGroup.id}`,
        },
        async (payload) => {
          // Fetch the sender's profile for the new message
          const { data: senderData, error: senderError } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, email")
            .eq("id", payload.new.user_id)
            .single()

          if (senderError) {
            console.error("Error fetching sender profile:", senderError)
            return
          }

          const newMessage: Message = {
            ...payload.new,
            sender: senderData
          }

          setMessages((prev) => [...prev, newMessage])
          scrollRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [selectedGroup, supabase, toast])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !selectedGroup) return

    try {
      const { error } = await supabase.from("messages").insert({
        content: newMessage.trim(),
        group_id: selectedGroup.id,
        user_id: user.id,
      })

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error sending message",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  if (!selectedGroup) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${
                message.user_id === user?.id ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender.avatar_url || undefined} />
                <AvatarFallback>
                  {message.sender.full_name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col space-y-1 ${
                  message.user_id === user?.id ? "items-end" : ""
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {message.sender.full_name || message.sender.email}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    message.user_id === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
