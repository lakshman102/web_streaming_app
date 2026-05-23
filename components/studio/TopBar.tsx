'use client'

import React from 'react'
import { useStreamStore } from '@/lib/store/stream-store'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User } from 'lucide-react'

export function TopBar() {
  const router = useRouter()
  const { user, isLive, toggleStream } = useStreamStore()
  const [streamStatus, setStreamStatus] = React.useState<'idle' | 'loading' | 'streaming'>('idle')

  const handleGoLive = async () => {
    setStreamStatus('loading')
    try {
      // Simulate stream start
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toggleStream()
      setStreamStatus('streaming')
    } catch (error) {
      console.error('Failed to start stream:', error)
      setStreamStatus('idle')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="flex h-16 items-center justify-between bg-card px-6 py-4">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">CS</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-foreground">CloudStream Studio</h1>
          <p className="text-xs text-muted-foreground">Professional Cloud Streaming</p>
        </div>
      </div>

      {/* Center: Stream Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${
            isLive ? 'animate-pulse bg-destructive' : 'bg-muted'
          }`} />
          <span className="text-sm font-medium text-foreground">
            {isLive ? 'STREAMING' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Right: Go Live & User Menu */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleGoLive}
          disabled={streamStatus === 'loading'}
          className={`${
            isLive
              ? 'bg-destructive hover:bg-destructive/90'
              : 'bg-accent hover:bg-accent/90'
          }`}
        >
          {streamStatus === 'loading' ? 'Starting...' : isLive ? 'Stop Stream' : 'Go Live'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <span className="text-sm">{user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
