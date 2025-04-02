import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  // const path = request.nextUrl.pathname
  //
  // // Define public paths that don't require authentication
  // const isPublicPath = path === "/login" || path === "/" || path.startsWith("/_next") || path.startsWith("/api")
  //
  // // Get the token from the cookies
  // const token = request.cookies.get("auth-token")?.value || ""
  //
  // // Redirect logic
  // if (!isPublicPath && !token) {
  //   // Redirect to login if trying to access a protected route without a token
  //   return NextResponse.redirect(new URL("/login", request.url))
  // }
  //
  // if (path === "/login" && token) {
  //   // Redirect to home if trying to access login with a token
  //   return NextResponse.redirect(new URL("/", request.url))
  // }
  //
  // return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

