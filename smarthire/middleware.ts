import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = req.nextUrl

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // ✅ Handle role redirect in middleware — avoids client-side loop
    if (pathname === "/dashboard") {
      const role = token.role as string | undefined
      const dest = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/seeker"
      return NextResponse.redirect(new URL(dest, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // ✅ Now catches "/dashboard" exactly AND all sub-paths
  matcher: ["/dashboard", "/dashboard/:path*"],
}