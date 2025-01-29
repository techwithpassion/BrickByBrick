"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function HelpContent() {
  return (
    <Tabs defaultValue="getting-started">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="faq">FAQ</TabsTrigger>
        <TabsTrigger value="contact">Contact Support</TabsTrigger>
      </TabsList>

      <TabsContent value="getting-started" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started with Brick By Brick</CardTitle>
            <CardDescription>
              Learn the basics of using Brick By Brick
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Welcome to Brick By Brick</h3>
              <p className="text-muted-foreground">
                Brick By Brick is your all-in-one study companion, designed to help you build consistent study habits
                and track your progress. With features like study timer, streak tracking, and task management,
                we make it easier for you to achieve your learning goals.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Quick Start Guide</h3>
              <ol className="list-decimal space-y-2 pl-4">
                <li>Create your account or sign in using email</li>
                <li>Visit the Timer page to start your first study session</li>
                <li>Use preset timers or create your own custom duration</li>
                <li>Track your daily study streaks on the dashboard</li>
                <li>Manage your tasks and view analytics to improve your study habits</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="features" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              Explore all the features available in Brick By Brick
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="timer">
                <AccordionTrigger>Study Timer</AccordionTrigger>
                <AccordionContent>
                  Our advanced study timer helps you stay focused and productive:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Choose from preset durations or create custom timers</li>
                    <li>Timer presets for quick access to common durations</li>
                    <li>Visual and audio notifications when timer completes</li>
                    <li>Track study sessions automatically</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="streaks">
                <AccordionTrigger>Study Streaks</AccordionTrigger>
                <AccordionContent>
                  Stay motivated with our streak tracking system:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Track your daily study consistency</li>
                    <li>View your current and longest streaks</li>
                    <li>See total days studied</li>
                    <li>Automatic streak updates when you complete study sessions</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dashboard">
                <AccordionTrigger>Dashboard & Analytics</AccordionTrigger>
                <AccordionContent>
                  Monitor your progress with our comprehensive dashboard:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Overview of your study statistics</li>
                    <li>Streak tracking visualization</li>
                    <li>Recent activity summary</li>
                    <li>Quick access to timer and calendar</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="calendar">
                <AccordionTrigger>Calendar & Tasks</AccordionTrigger>
                <AccordionContent>
                  Organize your study schedule effectively:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>View and manage study tasks</li>
                    <li>Set due dates and priorities</li>
                    <li>Track task completion status</li>
                    <li>Calendar view for better planning</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="theme">
                <AccordionTrigger>Theme & Accessibility</AccordionTrigger>
                <AccordionContent>
                  Customize your experience:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Dark mode support for comfortable viewing</li>
                    <li>Responsive design for all devices</li>
                    <li>Soothing color scheme to reduce eye strain</li>
                    <li>Keyboard shortcuts for common actions</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="faq" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find answers to common questions about Brick By Brick
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="streaks">
                <AccordionTrigger>
                  How do study streaks work?
                </AccordionTrigger>
                <AccordionContent>
                  Study streaks are tracked automatically when you complete study sessions.
                  A streak is maintained by studying at least once every day. Your current
                  streak, longest streak, and total study days are displayed on the dashboard.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="timer">
                <AccordionTrigger>
                  Can I customize the timer?
                </AccordionTrigger>
                <AccordionContent>
                  Yes! You can use preset timers or create custom durations. The timer
                  includes features like notifications and automatic session tracking.
                  Your timer preferences are saved for future sessions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="data">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, we take data security seriously. All your data is
                  encrypted and stored securely using Supabase. We never share your 
                  personal information with third parties.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="offline">
                <AccordionTrigger>
                  Does it work offline?
                </AccordionTrigger>
                <AccordionContent>
                  Currently, Brick By Brick requires an internet connection to
                  track your progress and sync data. We're working on offline
                  support for future updates.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contact" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Need help? Get in touch with our support team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Support Hours</h3>
              <p className="text-muted-foreground">
                Our support team is available Monday through Friday, 9 AM to 5
                PM EST.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Methods</h3>
              <ul className="list-disc space-y-2 pl-4">
                {/* <li>Email: support@brickbybrick.com</li> */}
                <li>GitHub Issues: Report bugs or suggest features</li>
                <li>Discord: Join our community server</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Feedback</h3>
              <p className="text-muted-foreground">
                We're constantly improving Brick By Brick based on user feedback.
                Feel free to share your suggestions or report any issues you encounter.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
