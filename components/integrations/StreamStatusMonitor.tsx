'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Users, Zap, AlertCircle } from 'lucide-react'

interface StreamStatus {
  platform: string
  isActive: boolean
  status: 'idle' | 'connecting' | 'live' | 'stopped' | 'error'
  viewers?: number
  bitrate?: number
  uptime?: number
  errors?: number
}

interface StreamStatusMonitorProps {
  statuses: StreamStatus[]
  isLoading?: boolean
}

export function StreamStatusMonitor({ statuses, isLoading }: StreamStatusMonitorProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500/20 text-green-700 border-green-500/50'
      case 'connecting':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50'
      case 'stopped':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/50'
      case 'error':
        return 'bg-red-500/20 text-red-700 border-red-500/50'
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/50'
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Stream Status</h3>

      {isLoading && (
        <Card className="border border-sidebar-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Loading stream status...</p>
        </Card>
      )}

      {statuses.map((status) => (
        <Card key={status.platform} className="border border-sidebar-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium capitalize">{status.platform}</h4>
              <Badge className={`mt-1 ${getStatusBadgeColor(status.status)}`}>{status.status}</Badge>
            </div>
            {status.status === 'live' && <Activity className="h-5 w-5 text-green-500 animate-pulse" />}
          </div>

          {status.isActive && status.status === 'live' && (
            <div className="grid grid-cols-3 gap-2 text-sm">
              {status.viewers !== undefined && (
                <div>
                  <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Viewers
                  </div>
                  <p className="font-semibold">{status.viewers.toLocaleString()}</p>
                </div>
              )}
              {status.bitrate !== undefined && (
                <div>
                  <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Bitrate
                  </div>
                  <p className="font-semibold">{(status.bitrate / 1000).toFixed(1)} Mbps</p>
                </div>
              )}
              {status.uptime !== undefined && (
                <div>
                  <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                    ⏱️ Uptime
                  </div>
                  <p className="font-semibold text-xs">{formatUptime(status.uptime)}</p>
                </div>
              )}
            </div>
          )}

          {status.errors && status.errors > 0 && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {status.errors} errors detected
            </div>
          )}
        </Card>
      ))}

      {statuses.length === 0 && (
        <Card className="border border-sidebar-border bg-card p-4">
          <p className="text-sm text-muted-foreground">No active streams</p>
        </Card>
      )}
    </div>
  )
}
