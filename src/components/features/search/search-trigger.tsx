"use client"

import * as React from "react"
import { SearchDialog } from "./search-dialog"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useHotkeys } from "react-hotkeys-hook"

export function SearchTrigger() {
  const [open, setOpen] = React.useState(false)

  useHotkeys("ctrl+k, cmd+k", (e) => {
    e.preventDefault()
    setOpen(true)
  })

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" aria-hidden="true" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
