'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useStreamStore, usePlatformIntegrations } from '@/lib/store/stream-store'
import { PlatformIntegrationCard } from '@/components/integrations/PlatformIntegrationCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader, ArrowLeft } from 'lucide-react'

const PLATFORMS = ['youtube', 'twitch', 'facebook', 'custom'] as const

export default function IntegrationsPage() {
  const router = useRouter()
  const { user } = useStreamStore()
  const { integrations, addPlatformIntegration, removePlatformIntegration } = usePlatformIntegrations()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isConnecting, setIsConnecting] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      if (!user?.id) return

      const response = await fetch(`/api/integrations?userId=${user.id}`)
      const data = await response.json()

      if (data.integrations) {
        data.integrations.forEach((int: any) => {
          addPlatformIntegration(int)
        })
      }
    } catch (error) {
      console.error('[v0] Error loading integrations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (platform: string) => {
    setIsConnecting(platform)

    try {
      if (platform === 'youtube') {
        const clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID
        const redirectUri = `${window.location.origin}/api/integrations/youtube/auth`
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: clientId || '',
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
          access_type: 'offline',
          prompt: 'consent',
        })}`
        window.location.href = authUrl
      } else if (platform === 'twitch') {
        const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
        const redirectUri = `${window.location.origin}/api/integrations/twitch/auth`
        const authUrl = `https://id.twitch.tv/oauth2/authorize?${new URLSearchParams({
          client_id: clientId || '',
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'user:read:email channel:manage:broadcast',
        })}`
        window.location.href = authUrl
      } else if (platform === 'facebook') {
        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
        const redirectUri = `${window.location.origin}/api/integrations/facebook/auth`
        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${new URLSearchParams({
          client_id: appId || '',
          redirect_uri: redirectUri,
          scope: 'pages_read_engagement,pages_manage_metadata,pages_read_user_content,pages_manage_posts',
        })}`
        window.location.href = authUrl
      } else if (platform === 'custom') {
        // Open custom RTMP setup dialog
        alert('Custom RTMP setup - enter your RTMP server details')
      }
    } catch (error) {
      console.error('[v0] Error connecting platform:', error)
      setIsConnecting(null)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('Disconnect this platform?')) return

    try {
      const response = await fetch('/api/integrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId }),
      })

      if (response.ok) {
        removePlatformIntegration(integrationId)
      }
    } catch (error) {
      console.error('[v0] Error disconnecting platform:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Platform Integrations</h1>
            <p className="text-muted-foreground mt-2">
              Connect your streaming platforms to broadcast simultaneously
            </p>
          </div>
        </div>

        {/* Integrations Grid */}
        {isLoading ? (
          <Card className="border border-border bg-card p-8 flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin mr-2" />
            <p>Loading integrations...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => {
              const integration = integrations.find((i) => i.platform === platform)
              return (
                <PlatformIntegrationCard
                  key={platform}
                  platform={integration || {
                    id: '',
                    platform: platform as any,
                    isEnabled: false,
                  }}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  isConnecting={isConnecting === platform}
                />
              )
            })}
          </div>
        )}

        {/* Info Section */}
        <Card className="border border-border bg-card p-6 mt-8">
          <h3 className="font-semibold mb-4">How It Works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Connect your streaming platform accounts using OAuth</li>
            <li>• Your authentication tokens are encrypted and stored securely</li>
            <li>• Select which platforms to stream to when you go live</li>
            <li>• Stream simultaneously to all connected platforms</li>
            <li>• View real-time statistics for each platform</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
