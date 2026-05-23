'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useStreamStore } from '@/lib/store/stream-store'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useStreamStore()

  React.useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token || isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">CloudStream Studio</h1>
        <p className="mt-4 text-lg text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
