'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const hasRedirected = useRef(false)  // ✅ prevents duplicate pushes

  useEffect(() => {
    if (status === 'loading') return
    if (hasRedirected.current) return  // ✅ already fired, bail out

    if (status === 'unauthenticated') {
      hasRedirected.current = true
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user) {
      hasRedirected.current = true
      const role = session.user.role
      router.push(role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/seeker')
    }
  }, [status, session?.user, router])  // ✅ depend on session.user, not whole session

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}