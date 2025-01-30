"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfirmEmailPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent you a confirmation link. Please check your email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            After confirming your email, you'll be able to sign in to your account.
          </p>
          <Link href="/auth/sign-in">
            <Button className="w-full">Go to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
