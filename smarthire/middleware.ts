import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // ✅ explicitly tell it which cookie to look for
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  })
  console.log("MW TOKEN:", token)
  console.log("MW PATHNAME:", req.nextUrl.pathname)

  const { pathname } = req.nextUrl

  // ✅ Always allow these through
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  // ✅ Not logged in → send to login, but SANITIZE the callbackUrl
  if (!token) {
    const loginUrl = new URL("/login", req.url)
    // Only set callbackUrl if it's a real sub-route, not /dashboard root
    // to avoid the loop
    if (pathname !== "/dashboard") {
      loginUrl.searchParams.set("callbackUrl", pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // ✅ Logged in, hitting /dashboard root → redirect by role
  if (pathname === "/dashboard") {
    const role = token.role as string | undefined
    const dest = role === "recruiter"
      ? "/dashboard/recruiter"
      : "/dashboard/seeker"
    return NextResponse.redirect(new URL(dest, req.url))

  }

  // ✅ Role-based route protection
  const role = token.role as string | undefined

  if (pathname.startsWith("/dashboard/recruiter") && role !== "recruiter") {
    return NextResponse.redirect(new URL("/dashboard/seeker", req.url))
  }

  if (pathname.startsWith("/dashboard/seeker") && role !== "seeker") {
    return NextResponse.redirect(new URL("/dashboard/recruiter", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/apply/:path*",
  ],
}
