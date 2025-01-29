import { Metadata } from "next"
import { TimerProvider } from "@/contexts/timer-context"
import { TimerDisplay } from "@/components/features/timer/timer-display"
import { TimerControls } from "@/components/features/timer/timer-controls"
import { TimerSettings } from "@/components/features/timer/timer-settings"
import { TimerHistory } from "@/components/features/timer/timer-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, History, Settings } from "lucide-react"

export const metadata: Metadata = {
  title: "Timer - Brick By Brick",
  description: "Track your study sessions with our Pomodoro timer",
}

export default function TimerPage() {
  return (
    <TimerProvider>
      <div className="container mx-auto py-10">
        <div className="flex flex-col space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Study Timer</h1>
              <p className="text-muted-foreground">
                Stay focused and track your study sessions
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-8">
              <Card>
                <CardContent className="pt-6">
                  <TimerDisplay />
                  <div className="mt-8">
                    <TimerControls />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Tabs defaultValue="settings">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="h-4 w-4 mr-2" />
                    History
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Timer Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TimerSettings />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Session History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TimerHistory />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </TimerProvider>
  )
}
