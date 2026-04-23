import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

async function getUserWithRetry(email: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })
      if (user) return user
    } catch (err) {
      console.error("DB ERROR (retry):", err)
    }
    await new Promise((res) => setTimeout(res, 500))
  }
  return null
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("MISSING_CREDENTIALS")
          }

          const email = credentials.email.toLowerCase()
          const user = await getUserWithRetry(email)

          if (!user) throw new Error("USER_NOT_FOUND")
          if (!user.password) throw new Error("NO_PASSWORD_SET")

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) throw new Error("INVALID_PASSWORD")

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (err) {
          console.error("AUTH ERROR:", err)
          return null
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          if (!user.email) return false

          const existing = await prisma.user.findUnique({
            where: { email: user.email },
          })

          // ✅ If new user, redirect to role selection instead of creating
          if (!existing) {
            // Pass email via query param so select-role page knows who to create
            return `/select-role?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name ?? "")}`
          }

          // ✅ Existing user, let them through normally
          return true
        }
        return true
      } catch (err) {
        console.error("SIGNIN ERROR:", err)
        return "/login?error=DatabaseError"
      }
    },

    async jwt({ token, user, account }: any) {
  if (account?.provider === "credentials" && user) {
    token.id = user.id
    token.role = user.role
    return token
  }

  if (account?.provider === "google") {
    const email = user?.email ?? token.email
    if (!email) return token

    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    })

    // ✅ If no DB user yet (new google user mid-flow), just return token as-is
    if (!dbUser) return token

    token.id = dbUser.id
    token.role = dbUser.role
    return token
  }

  if (token.id) {
    const exists = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { id: true },
    })
    if (!exists) return {}
  }

  return token
},


    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
  },
}