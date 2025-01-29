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
                Brick By Brick is a comprehensive study management platform
                designed to help you organize your study materials, track your
                progress, and collaborate with others.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Quick Start Guide</h3>
              <ol className="list-decimal space-y-2 pl-4">
                <li>Create your account or sign in</li>
                <li>Set up your subjects and topics</li>
                <li>Start a study session using the timer</li>
                <li>Track your progress and complete tasks</li>
                <li>Join or create study groups</li>
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
              <AccordionItem value="subjects">
                <AccordionTrigger>Subjects & Topics</AccordionTrigger>
                <AccordionContent>
                  Organize your study materials by creating subjects and breaking
                  them down into manageable topics. Track your progress and mark
                  topics as completed as you study.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="timer">
                <AccordionTrigger>Study Timer</AccordionTrigger>
                <AccordionContent>
                  Use the Pomodoro technique or customize your own study
                  sessions. The timer helps you stay focused and tracks your
                  study streaks.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tasks">
                <AccordionTrigger>Tasks & Calendar</AccordionTrigger>
                <AccordionContent>
                  Create and manage tasks, set due dates, and prioritize your
                  work. The calendar view helps you stay organized and meet
                  deadlines.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="groups">
                <AccordionTrigger>Study Groups</AccordionTrigger>
                <AccordionContent>
                  Collaborate with others by joining or creating study groups.
                  Share resources, discuss topics, and help each other succeed.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="statistics">
                <AccordionTrigger>Progress & Statistics</AccordionTrigger>
                <AccordionContent>
                  Track your study habits, view detailed statistics, and monitor
                  your progress over time. Stay motivated by maintaining study
                  streaks.
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
              <AccordionItem value="account">
                <AccordionTrigger>
                  How do I create an account?
                </AccordionTrigger>
                <AccordionContent>
                  You can create an account by clicking the "Sign Up" button
                  and following the registration process. We support both email
                  registration and Google sign-in.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="data">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, we take data security seriously. All your data is
                  encrypted and stored securely. We never share your personal
                  information with third parties.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="premium">
                <AccordionTrigger>
                  Are there any premium features?
                </AccordionTrigger>
                <AccordionContent>
                  Currently, all features in Brick By Brick are available to
                  all users for free. We may introduce premium features in the
                  future.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="delete">
                <AccordionTrigger>
                  How do I delete my account?
                </AccordionTrigger>
                <AccordionContent>
                  You can delete your account from the Settings page. Please
                  note that this action is irreversible and will delete all
                  your data.
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
                <li>Email: support@brickbybrick.com</li>
                <li>Twitter: @BrickByBrickApp</li>
                <li>Discord: Join our community server</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Response Time</h3>
              <p className="text-muted-foreground">
                We typically respond to all inquiries within 24 hours during
                business days.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
