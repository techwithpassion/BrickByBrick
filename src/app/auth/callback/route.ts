import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)

    // Handle different auth flows
    if (type === "recovery") {
      // Password reset flow
      return NextResponse.redirect(new URL("/reset-password", requestUrl.origin))
    } else if (type === "signup") {
      // Email verification flow
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
    }
  }

  // Default redirect
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
