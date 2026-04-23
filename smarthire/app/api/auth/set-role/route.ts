// app/api/auth/set-role/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function POST(req: NextRequest) {
  const { email, name, role } = await req.json()

  if (!email || !role || !["seeker", "recruiter"].includes(role)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  await prisma.user.upsert({
    where: { email },
    update: {},          // don't overwrite role if they somehow already exist
    create: { email, name: name ?? "User", role },
  })

  return NextResponse.json({ ok: true })
}