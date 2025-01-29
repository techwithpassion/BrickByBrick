"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Timer, Calendar, Users, User, Menu, X } from "lucide-react"
import { SearchTrigger } from "@/components/features/search/search-trigger"
import { NotificationsDropdown } from "@/components/features/notifications/notifications-dropdown"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { UserNav } from "@/components/shared/user-nav"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import React from "react"

const navigationItems = [
  {
    href: "/dashboard",
    label: "Study Timer",
    icon: Timer,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: Calendar,
  },
  {
    href: "/groups",
    label: "Study Groups",
    icon: Users,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pl-1 pr-0">
            <div className="px-7">
              <Link
                href="/"
                className="flex items-center space-x-2"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                  <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                  <path d="M12 3v6" />
                </svg>
                <span className="font-bold">Brick By Brick</span>
              </Link>
            </div>
            <div className="mt-4 px-6">
              <nav className="flex flex-col space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant={pathname === item.href ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-6 hidden items-center space-x-2 lg:flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
            <path d="M12 3v6" />
          </svg>
          <span className="hidden font-bold lg:inline-block">
            Brick By Brick
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchTrigger />
          </div>
          <nav className="flex items-center space-x-2">
            <NotificationsDropdown />
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  )
}
