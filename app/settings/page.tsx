'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-8 p-8">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Platform Integrations</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your YouTube, Twitch, and Facebook accounts here. Coming in Phase 1B.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Encoding Presets</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Customize your streaming quality and encoding settings. Coming soon.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Account Settings</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your profile, email, and preferences. Coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
