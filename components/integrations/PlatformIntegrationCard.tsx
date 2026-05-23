'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, X, LogOut, Video } from 'lucide-react'

interface Platform {
  id: string
  platform: 'youtube' | 'twitch' | 'facebook' | 'custom'
  isEnabled: boolean
  channelName?: string
  channelId?: string
  pageId?: string
}

interface PlatformIntegrationCardProps {
  platform: Platform
  onConnect: (platform: string) => void
  onDisconnect: (integrationId: string) => void
  isConnecting?: boolean
}

export function PlatformIntegrationCard({
  platform,
  onConnect,
  onDisconnect,
  isConnecting,
}: PlatformIntegrationCardProps) {
  const isConnected = platform.isEnabled

  const getIcon = () => {
    switch (platform.platform) {
      case 'youtube':
        return '📺'
      case 'twitch':
        return '🎮'
      case 'facebook':
        return 'f'
      case 'custom':
        return '⚙️'
      default:
        return '📡'
    }
  }

  const getColor = () => {
    switch (platform.platform) {
      case 'youtube':
        return 'bg-red-500/10 border-red-500/20'
      case 'twitch':
        return 'bg-purple-500/10 border-purple-500/20'
      case 'facebook':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'custom':
        return 'bg-green-500/10 border-green-500/20'
      default:
        return 'bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <Card className={`${getColor()} border p-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{getIcon()}</div>
          <div>
            <h3 className="font-semibold capitalize">{platform.platform}</h3>
            {isConnected ? (
              <div>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <Check className="h-4 w-4" /> {platform.channelName || 'Connected'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not connected</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {isConnected ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDisconnect(platform.id)}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onConnect(platform.platform)}
              disabled={isConnecting}
              className="bg-primary hover:bg-primary/90"
            >
              <Video className="h-4 w-4 mr-1" />
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
