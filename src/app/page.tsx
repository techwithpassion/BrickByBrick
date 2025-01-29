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
      <div className="relative hidden h-full flex-col bg-zinc-950 p-10 text-white lg:flex dark:border-r dark:border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-800 to-teal-900" />
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
            <footer className="text-sm text-zinc-200">B.B. King</footer>
          </blockquote>
        </div>
      </div>
      <div className="relative p-8 lg:p-12 bg-white dark:bg-zinc-950">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[450px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Welcome to Brick By Brick
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Your intelligent study companion that helps you build lasting knowledge, one session at a time
            </p>
          </div>

          {/* Main Actions */}
          <div className="grid gap-4">
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg h-11 text-base">
                Get Started
              </Button>
            </Link>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500 dark:text-zinc-400">
                  or
                </span>
              </div>
            </div>
            <Link href="/signup">
              <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm h-11 text-base">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white text-center">
              Everything you need to excel
            </h2>
            <div className="grid gap-4">
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base text-zinc-950 dark:text-white">Smart Study Timer</CardTitle>
                      <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Track and optimize your study sessions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base text-zinc-950 dark:text-white">Task Management</CardTitle>
                      <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Stay organized with smart scheduling</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                      >
                        <path d="M12 20v-6M6 20V10M18 20V4" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base text-zinc-950 dark:text-white">Progress Analytics</CardTitle>
                      <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Track your growth with insights</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Testimonials */}
          <div className="pt-4">
            <div className="relative rounded-2xl bg-zinc-50 dark:bg-zinc-900 px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="relative h-10 w-10">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                  <div className="absolute inset-1 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    S
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Sarah Chen</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Medical Student</p>
                </div>
              </div>
              <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">
                "Brick By Brick has transformed how I study. The timer keeps me focused, and the analytics help me understand my progress. It's become an essential part of my daily routine."
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Trusted by students worldwide
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              🔒 Secure login • Free to use • No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
