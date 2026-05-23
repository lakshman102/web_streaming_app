'use client'

import React from 'react'
import { useStreamStore } from '@/lib/store/stream-store'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'

interface StreamDestinationsProps {
  streamSessionId?: string
  onStartStreaming?: (destinations: Array<{ integrationId: string; platform: string }>) => Promise<void>
}

export function StreamDestinations({ streamSessionId, onStartStreaming }: StreamDestinationsProps) {
  const { platformIntegrations, destinations, setDestinations } = useStreamStore()
  const [selectedDestinations, setSelectedDestinations] = React.useState<Record<string, boolean>>({
    youtube: destinations.youtube,
    twitch: destinations.twitch,
    facebook: destinations.facebook,
  })
  const [isStarting, setIsStarting] = React.useState(false)

  const handleDestinationChange = (platform: string, selected: boolean) => {
    setSelectedDestinations((prev) => ({
      ...prev,
      [platform]: selected,
    }))
    setDestinations({
      ...destinations,
      [platform]: selected,
    })
  }

  const handleStartStreaming = async () => {
    if (!onStartStreaming) return

    setIsStarting(true)
    try {
      const selected = platformIntegrations
        .filter((int) => selectedDestinations[int.platform])
        .map((int) => ({
          integrationId: int._id,
          platform: int.platform,
        }))

      await onStartStreaming(selected)
    } catch (error) {
      console.error('[v0] Error starting stream:', error)
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <Card className="border border-sidebar-border bg-card p-4">
      <h3 className="font-semibold mb-4">Stream To Platforms</h3>

      <div className="space-y-3 mb-4">
        {platformIntegrations.map((integration) => (
          <div key={integration._id} className="flex items-center gap-3">
            <Checkbox
              id={integration._id}
              checked={selectedDestinations[integration.platform] || false}
              onCheckedChange={(checked) =>
                handleDestinationChange(integration.platform, checked as boolean)
              }
              disabled={!integration.isEnabled}
            />
            <label
              htmlFor={integration._id}
              className={`flex-1 capitalize cursor-pointer ${!integration.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="font-medium">{integration.platform}</span>
              {integration.channelName && (
                <span className="text-sm text-muted-foreground ml-2">({integration.channelName})</span>
              )}
            </label>
          </div>
        ))}
      </div>

      {platformIntegrations.length === 0 && (
        <p className="text-sm text-muted-foreground">No platforms connected. Connect one from the Integrations tab.</p>
      )}

      {onStartStreaming && platformIntegrations.length > 0 && (
        <Button
          onClick={handleStartStreaming}
          disabled={isStarting || Object.values(selectedDestinations).every((v) => !v)}
          className="w-full"
        >
          {isStarting && <Loader className="h-4 w-4 mr-2 animate-spin" />}
          Start Streaming
        </Button>
      )}
    </Card>
  )
}
