"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useUser } from "@/hooks/use-user"
import { Plus, Timer, X, Clock, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimerPreset {
  id: string
  user_id: string
  duration_minutes: number
  name: string
  created_at: string
}

export function TimerPresets({ onSelectPreset }: { onSelectPreset: (duration: number, name: string) => void }) {
  const [presets, setPresets] = useState<TimerPreset[]>([])
  const [isAddingPreset, setIsAddingPreset] = useState(false)
  const [newPresetName, setNewPresetName] = useState("")
  const [newPresetMinutes, setNewPresetMinutes] = useState("")
  const [newPresetSeconds, setNewPresetSeconds] = useState("")
  const supabase = createClientComponentClient()
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return
    loadPresets()
  }, [user])

  const loadPresets = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from("timer_presets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error loading presets:", error)
      toast({
        title: "Error",
        description: "Failed to load presets",
        variant: "destructive",
      })
      return
    }

    setPresets(data || [])
  }

  const addPreset = async () => {
    if (!user || !newPresetName || (!newPresetMinutes && !newPresetSeconds)) {
      toast({
        title: "Invalid input",
        description: "Please provide a name and duration",
        variant: "destructive",
      })
      return
    }

    const minutes = parseInt(newPresetMinutes) || 0
    const seconds = parseInt(newPresetSeconds) || 0
    const totalMinutes = minutes + (seconds / 60)

    if (totalMinutes <= 0 || minutes > 180 || seconds > 59) {
      toast({
        title: "Invalid duration",
        description: "Please enter a valid duration (max 180 minutes)",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("timer_presets").insert({
        user_id: user.id,
        name: newPresetName,
        duration_minutes: totalMinutes
      })

      if (error) throw error

      setNewPresetName("")
      setNewPresetMinutes("")
      setNewPresetSeconds("")
      setIsAddingPreset(false)
      toast({
        title: "Success",
        description: "Timer preset added successfully",
      })
      loadPresets()
    } catch (error) {
      console.error("Error adding preset:", error)
      toast({
        title: "Error",
        description: "Failed to add preset",
        variant: "destructive",
      })
    }
  }

  const deletePreset = async (id: string) => {
    try {
      const { error } = await supabase
        .from("timer_presets")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Timer preset deleted successfully",
      })
      loadPresets()
    } catch (error) {
      console.error("Error deleting preset:", error)
      toast({
        title: "Error",
        description: "Failed to delete preset",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (minutes: number) => {
    const wholeMinutes = Math.floor(minutes)
    const seconds = Math.round((minutes % 1) * 60)
    if (seconds === 0) {
      return `${wholeMinutes}m`
    }
    return `${wholeMinutes}m ${seconds}s`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Dialog open={isAddingPreset} onOpenChange={setIsAddingPreset}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 w-full">
              <Plus className="h-4 w-4" />
              Add New Preset
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Save className="h-5 w-5" />
                Add Timer Preset
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Name</Label>
                <Input
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g., Short Break"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Duration</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={newPresetMinutes}
                      onChange={(e) => setNewPresetMinutes(e.target.value)}
                      placeholder="25"
                      min="0"
                      max="180"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <span className="text-xs text-zinc-500 mt-1 block">Minutes (0-180)</span>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={newPresetSeconds}
                      onChange={(e) => setNewPresetSeconds(e.target.value)}
                      placeholder="00"
                      min="0"
                      max="59"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <span className="text-xs text-zinc-500 mt-1 block">Seconds (0-59)</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddingPreset(false)}>
                Cancel
              </Button>
              <Button onClick={addPreset} className="gap-2">
                <Save className="h-4 w-4" />
                Save Preset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-1 gap-2">
          {presets.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No presets yet</p>
              <p className="text-xs mt-1">Add your first timer preset</p>
            </div>
          ) : (
            presets.map((preset) => (
              <div
                key={preset.id}
                className="group relative flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
              >
                <button
                  onClick={() => onSelectPreset(preset.duration_minutes, preset.name)}
                  className="flex items-center gap-4 text-white w-full"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Timer className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-sm text-zinc-400">
                      {formatDuration(preset.duration_minutes)}
                    </span>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePreset(preset.id);
                  }}
                  className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
