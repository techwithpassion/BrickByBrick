"use client"

import React, { createContext, useContext, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

interface SearchResult {
  type: "subject" | "task" | "group"
  id: string
  title: string
  description?: string | null
  url: string
}

interface SearchContextType {
  searchQuery: string
  searchResults: SearchResult[]
  isSearching: boolean
  setSearchQuery: (query: string) => void
  performSearch: () => Promise<void>
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)

      // Search in subjects
      const { data: subjects, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, title, description")
        .textSearch("title", searchQuery)
        .limit(5)

      if (subjectsError) throw subjectsError

      // Search in tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, description")
        .textSearch("title", searchQuery)
        .limit(5)

      if (tasksError) throw tasksError

      // Search in groups
      const { data: groups, error: groupsError } = await supabase
        .from("study_groups")
        .select("id, title, description")
        .textSearch("title", searchQuery)
        .limit(5)

      if (groupsError) throw groupsError

      const results: SearchResult[] = [
        ...(subjects?.map(subject => ({
          type: "subject" as const,
          id: subject.id,
          title: subject.title,
          description: subject.description,
          url: `/subjects/${subject.id}`,
        })) || []),
        ...(tasks?.map(task => ({
          type: "task" as const,
          id: task.id,
          title: task.title,
          description: task.description,
          url: `/tasks/${task.id}`,
        })) || []),
        ...(groups?.map(group => ({
          type: "group" as const,
          id: group.id,
          title: group.title,
          description: group.description,
          url: `/groups/${group.id}`,
        })) || []),
      ]

      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Error",
        description: "Failed to perform search",
        variant: "destructive",
      })
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearching,
        setSearchQuery,
        performSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
