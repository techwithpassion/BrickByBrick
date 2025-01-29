"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSearch } from "@/contexts/search-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Book,
  CheckSquare,
  Users,
  Search,
  Loader2,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const {
    searchQuery,
    searchResults,
    isSearching,
    setSearchQuery,
    performSearch,
  } = useSearch()
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  const handleSelect = (url: string) => {
    router.push(url)
    onOpenChange(false)
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 outline-none">
        <DialogHeader className="px-4 pb-4 pt-5">
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="border-t px-4 py-2">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search subjects, tasks, and groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 p-0 focus-visible:ring-0"
            />
            {isSearching && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
        <ScrollArea className="border-t">
          <div className="px-2 py-4">
            {searchResults.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                {searchQuery
                  ? "No results found."
                  : "Type to start searching..."}
              </p>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <Button
                    key={`${result.type}-${result.id}`}
                    variant="ghost"
                    className="w-full justify-start gap-2 px-2"
                    onClick={() => handleSelect(result.url)}
                  >
                    {result.type === "subject" && (
                      <Book className="h-4 w-4 text-blue-500" />
                    )}
                    {result.type === "task" && (
                      <CheckSquare className="h-4 w-4 text-green-500" />
                    )}
                    {result.type === "group" && (
                      <Users className="h-4 w-4 text-purple-500" />
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{result.title}</p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {result.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
