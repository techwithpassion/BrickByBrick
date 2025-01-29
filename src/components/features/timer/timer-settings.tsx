"use client"

import * as React from "react"
import { useTimer } from "@/contexts/timer-context"
import { useSubjects } from "@/contexts/subjects-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Volume2, VolumeX } from "lucide-react"

export function TimerSettings() {
  const {
    focusDuration,
    setFocusDuration,
    breakDuration,
    setBreakDuration,
    autoStartBreaks,
    setAutoStartBreaks,
    autoStartPomodoros,
    setAutoStartPomodoros,
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    selectedSubject,
    setSelectedSubject,
  } = useTimer()
  const { subjects } = useSubjects()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer Settings</CardTitle>
        <CardDescription>
          Customize your study session preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Focus Duration (minutes)</Label>
            <Input
              type="number"
              min={1}
              max={120}
              value={focusDuration}
              onChange={(e) =>
                setFocusDuration(Number(e.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Break Duration (minutes)</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={breakDuration}
              onChange={(e) =>
                setBreakDuration(Number(e.target.value))
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-start Breaks</Label>
              <p className="text-sm text-muted-foreground">
                Automatically start break timer
              </p>
            </div>
            <Switch
              checked={autoStartBreaks}
              onCheckedChange={setAutoStartBreaks}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-start Focus</Label>
              <p className="text-sm text-muted-foreground">
                Automatically start focus timer
              </p>
            </div>
            <Switch
              checked={autoStartPomodoros}
              onCheckedChange={setAutoStartPomodoros}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select
              value={selectedSubject?.id || ""}
              onValueChange={(value) =>
                setSelectedSubject(
                  subjects.find((s) => s.id === value) || null
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">General Study</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sound Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Play sound when timer ends
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
          </div>
          {soundEnabled && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Volume</Label>
                <span className="text-sm">
                  {Math.round(soundVolume * 100)}%
                </span>
              </div>
              <Slider
                value={[soundVolume * 100]}
                onValueChange={(value) => setSoundVolume(value[0] / 100)}
                max={100}
                step={1}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
