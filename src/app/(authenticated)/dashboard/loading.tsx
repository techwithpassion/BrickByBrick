"use client"

import { Icons } from "@/components/shared/icons"

export default function DashboardLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Icons.spinner className="h-8 w-8 animate-spin text-emerald-500" />
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Loading your dashboard...
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Please wait while we prepare your study space
        </p>
      </div>
    </div>
  )
}
