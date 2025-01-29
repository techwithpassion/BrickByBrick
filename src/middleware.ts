import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that don't require authentication
const publicPaths = new Set([
  "/",
  "/login",
  "/signup",
  "/auth/callback",
])

// Paths that are always excluded from middleware
const excludedPaths = [
  "/_next",
  "/api",
  "/static",
  "/favicon.ico",
]

export async function middleware(request: NextRequest) {
  try {
    // Skip middleware for excluded paths
    const pathname = request.nextUrl.pathname
    if (excludedPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next()
    }

    // Create authenticated Supabase client
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Refresh session if exists
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check if the current path requires authentication
    const isPublicPath = publicPaths.has(pathname)

    // Handle authentication routes
    if (session) {
      // If logged in and trying to access auth pages, redirect to dashboard
      if (pathname === "/login" || pathname === "/signup") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } else {
      // If not logged in and trying to access protected routes
      if (!isPublicPath) {
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirectTo", pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    
    // On error, redirect to login
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}
