'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { router.push('/login'); return }
    
    const role = session?.user?.role
    if (role === 'recruiter') {
      router.push('/dashboard/recruiter')
    } else {
      router.push('/dashboard/seeker')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}