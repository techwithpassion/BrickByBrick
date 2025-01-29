import { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Brick By Brick",
  description: "Welcome to Brick By Brick - Your Personal Study Assistant",
}

export default function HomePage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Brick By Brick
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "The beautiful thing about learning is that no one can take it away from you."
            </p>
            <footer className="text-sm">B.B. King</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to Brick By Brick
            </h1>
            <p className="text-sm text-muted-foreground">
              Your personal study assistant
            </p>
          </div>
          <div className="grid gap-6">
            <Link href="/login">
              <Button className="w-full">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Timer</CardTitle>
                <CardDescription>Track your study sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/features/timer">
                  <Button variant="ghost" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Manage your tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/features/calendar">
                  <Button variant="ghost" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
