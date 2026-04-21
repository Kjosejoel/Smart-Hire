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
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL("/login", req.url)
    if (pathname !== "/dashboard") {
      loginUrl.searchParams.set("callbackUrl", pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === "/dashboard") {
    const role = token.role as string | undefined
    const dest = role === "recruiter"
      ? "/dashboard/recruiter"
      : "/dashboard/seeker"
    return NextResponse.redirect(new URL(dest, req.url))
  }

  // ✅ Only redirect if role is KNOWN — never redirect if undefined
  const role = token.role as string | undefined

  if (role === "recruiter" && pathname.startsWith("/dashboard/seeker")) {
    return NextResponse.redirect(new URL("/dashboard/recruiter", req.url))
  }

  if (role === "seeker" && pathname.startsWith("/dashboard/recruiter")) {
    return NextResponse.redirect(new URL("/dashboard/seeker", req.url))
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