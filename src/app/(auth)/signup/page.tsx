import { Metadata } from "next"
import Link from "next/link"
import { SignUpForm } from "@/components/features/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign Up - Brick By Brick",
  description: "Create your account to start building your knowledge.",
}

export default function SignUpPage() {
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <SignUpForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
