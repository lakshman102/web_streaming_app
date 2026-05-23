'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Send, Shield } from 'lucide-react'

interface ChatMessageUI {
  id: string
  platform: 'youtube' | 'twitch' | 'facebook'
  username: string
  userAvatar?: string
  message: string
  isModerator: boolean
  isBroadcaster: boolean
  timestamp: Date
}

const platformColors = {
  youtube: 'bg-red-500/20 text-red-500',
  twitch: 'bg-purple-500/20 text-purple-500',
  facebook: 'bg-blue-500/20 text-blue-500',
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessageUI[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube'])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          platforms: selectedPlatforms,
        }),
      })

      setInputMessage('')
    } catch (error) {
      console.error('[v0] Send message error:', error)
    }
  }

  return (
    <Card className="flex h-full flex-col bg-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Live Chat
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 border-b border-border p-4">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <div className="mb-1 flex items-center gap-2">
                  {msg.userAvatar && (
                    <img
                      src={msg.userAvatar}
                      alt={msg.username}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span className="font-semibold text-foreground">
                    {msg.username}
                  </span>
                  {msg.isBroadcaster && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                      <Shield className="h-3 w-3" />
                      Broadcaster
                    </span>
                  )}
                  {msg.isModerator && (
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-500">
                      Mod
                    </span>
                  )}
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      platformColors[msg.platform]
                    }`}
                  >
                    {msg.platform.charAt(0).toUpperCase() + msg.platform.slice(1)}
                  </span>
                </div>
                <p className="text-muted-foreground">{msg.message}</p>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Platform Selection */}
        <div className="border-b border-border p-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            Send to:
          </p>
          <div className="flex gap-2">
            {['youtube', 'twitch', 'facebook'].map((platform) => (
              <Button
                key={platform}
                size="sm"
                variant={
                  selectedPlatforms.includes(platform) ? 'default' : 'outline'
                }
                onClick={() => {
                  setSelectedPlatforms((prev) =>
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

        {/* Message Input */}
        <div className="flex gap-2 p-3">
          <Input
            placeholder="Send message to live chat..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage()
            }}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
