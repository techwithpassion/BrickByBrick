"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TimerSettingsProps {
  duration: number
  onDurationChange: (duration: number) => void
}

const timerOptions = [
  { value: "25", label: "25 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "custom", label: "Custom" },
]

export function TimerSettings({ duration = 25, onDurationChange }: TimerSettingsProps) {
  const [selectedOption, setSelectedOption] = useState(String(duration))
  const [customMinutes, setCustomMinutes] = useState("")
  const [customSeconds, setCustomSeconds] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (selectedOption !== "custom") {
      onDurationChange(parseInt(selectedOption))
    }
  }, [selectedOption, onDurationChange])

  const handleCustomTimeChange = () => {
    const minutes = parseInt(customMinutes) || 0
    const seconds = parseInt(customSeconds) || 0
    const totalMinutes = minutes + seconds / 60
    if (totalMinutes > 0) {
      onDurationChange(totalMinutes)
    }
  }

  const handleMinutesChange = (value: string) => {
    const minutes = value.replace(/[^0-9]/g, "")
    if (minutes === "" || parseInt(minutes) <= 240) {
      setCustomMinutes(minutes)
    }
  }

  const handleSecondsChange = (value: string) => {
    const seconds = value.replace(/[^0-9]/g, "")
    if (seconds === "" || parseInt(seconds) < 60) {
      setCustomSeconds(seconds)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full h-12 text-base bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800">
          <Plus className="h-5 w-5 mr-2" />
          Add Timer
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Timer Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-zinc-400">Duration</Label>
              <Select
                value={selectedOption}
                onValueChange={setSelectedOption}
              >
                <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-700 text-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {timerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-800">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOption === "custom" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-zinc-400">Minutes</Label>
                  <Input
                    type="text"
                    value={customMinutes}
                    onChange={(e) => handleMinutesChange(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    placeholder="0-240"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-zinc-400">Seconds</Label>
                  <Input
                    type="text"
                    value={customSeconds}
                    onChange={(e) => handleSecondsChange(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-white"
                    placeholder="0-59"
                  />
                </div>
                <Button
                  onClick={() => {
                    handleCustomTimeChange()
                    setIsDialogOpen(false)
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Set Custom Time
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
