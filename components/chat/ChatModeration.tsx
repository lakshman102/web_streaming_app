'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, Ban, Clock, Trash2 } from 'lucide-react'

interface BlockedUser {
  id: string
  username: string
  action: 'ban' | 'timeout' | 'delete'
  platforms: string[]
  timestamp: Date
}

export function ChatModeration() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [userIdInput, setUserIdInput] = useState('')
  const [selectedAction, setSelectedAction] = useState<'ban' | 'timeout' | 'delete'>('ban')
  const [selectedModerationPlatforms, setSelectedModerationPlatforms] = useState<string[]>(['youtube'])

  const handleModerateUser = async () => {
    if (!userIdInput.trim()) return

    try {
      await fetch('/api/chat/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdInput,
          action: selectedAction,
          platforms: selectedModerationPlatforms,
        }),
      })

      setBlockedUsers((prev) => [
        ...prev,
        {
          id: userIdInput,
          username: userIdInput,
          action: selectedAction,
          platforms: selectedModerationPlatforms,
          timestamp: new Date(),
        },
      ])

      setUserIdInput('')
    } catch (error) {
      console.error('[v0] Moderation error:', error)
    }
  }

  const handleUnblock = async (userId: string) => {
    setBlockedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  return (
    <Card className="flex h-full flex-col bg-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Moderation
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0">
        {/* Moderation Controls */}
        <div className="border-b border-border p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              User ID or Username
            </label>
            <Input
              placeholder="Enter user to moderate"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Action
            </label>
            <div className="mt-1 flex gap-2">
              {(['ban', 'timeout', 'delete'] as const).map((action) => (
                <Button
                  key={action}
                  size="sm"
                  variant={selectedAction === action ? 'default' : 'outline'}
                  onClick={() => setSelectedAction(action)}
                  className="flex-1"
                >
                  {action === 'ban' && <Ban className="mr-1 h-3 w-3" />}
                  {action === 'timeout' && <Clock className="mr-1 h-3 w-3" />}
                  {action === 'delete' && <Trash2 className="mr-1 h-3 w-3" />}
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Platforms
            </label>
            <div className="mt-1 flex gap-2">
              {['youtube', 'twitch', 'facebook'].map((platform) => (
                <Button
                  key={platform}
                  size="sm"
                  variant={
                    selectedModerationPlatforms.includes(platform)
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() => {
                    setSelectedModerationPlatforms((prev) =>
                      prev.includes(platform)
                        ? prev.filter((p) => p !== platform)
                        : [...prev, platform]
                    )
                  }}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleModerateUser}
            disabled={!userIdInput.trim()}
            className="w-full bg-destructive hover:bg-destructive/90"
          >
            {selectedAction === 'ban' ? 'Ban User' : selectedAction === 'timeout' ? 'Timeout User' : 'Delete Messages'}
          </Button>
        </div>

        {/* Blocked Users List */}
        <ScrollArea className="flex-1 p-4">
          {blockedUsers.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No users moderated yet
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-sidebar p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.action.charAt(0).toUpperCase() + user.action.slice(1)} •{' '}
                      {user.platforms.join(', ')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUnblock(user.id)}
                  >
                    Undo
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
