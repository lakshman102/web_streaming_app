'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface StudioLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  topbar?: React.ReactNode
  rightPanel?: React.ReactNode
}

export function StudioLayout({
  children,
  sidebar,
  topbar,
  rightPanel,
}: StudioLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true)

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      {topbar && (
        <div className="border-b border-border">
          {topbar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {sidebar && (
          <div
            className={cn(
              'border-r border-border bg-card transition-all duration-300',
              sidebarOpen ? 'w-72' : 'w-0'
            )}
          >
            {sidebarOpen && <div className="h-full overflow-y-auto">{sidebar}</div>}
          </div>
        )}

        {/* Center Canvas Area */}
        <div className="flex-1 overflow-hidden bg-background">
          {children}
        </div>

        {/* Right Panel */}
        {rightPanel && (
          <div
            className={cn(
              'border-l border-border bg-card transition-all duration-300',
              rightPanelOpen ? 'w-80' : 'w-0'
            )}
          >
            {rightPanelOpen && <div className="h-full overflow-y-auto">{rightPanel}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
