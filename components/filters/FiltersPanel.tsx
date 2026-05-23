'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Settings, X } from 'lucide-react'

interface Filter {
  id: string
  type: 'brightness' | 'contrast' | 'saturation' | 'hue' | 'blur' | 'zoom'
  value: number
  enabled: boolean
}

const FILTER_TYPES = [
  { type: 'brightness', label: 'Brightness', min: -100, max: 100, default: 0 },
  { type: 'contrast', label: 'Contrast', min: -100, max: 100, default: 0 },
  { type: 'saturation', label: 'Saturation', min: -100, max: 100, default: 0 },
  { type: 'hue', label: 'Hue', min: -180, max: 180, default: 0 },
  { type: 'blur', label: 'Blur', min: 0, max: 20, default: 0 },
  { type: 'zoom', label: 'Zoom', min: 0.5, max: 3, default: 1 },
] as const

export function FiltersPanel() {
  const [activeFilters, setActiveFilters] = useState<Filter[]>([])

  const handleAddFilter = (filterType: Filter['type']) => {
    if (activeFilters.find((f) => f.type === filterType)) return

    const filterDef = FILTER_TYPES.find((f) => f.type === filterType)
    if (filterDef) {
      setActiveFilters([
        ...activeFilters,
        {
          id: `${filterType}-${Date.now()}`,
          type: filterType,
          value: filterDef.default,
          enabled: true,
        },
      ])
    }
  }

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter((f) => f.id !== filterId))
  }

  const handleUpdateValue = (filterId: string, value: number) => {
    setActiveFilters(
      activeFilters.map((f) =>
        f.id === filterId ? { ...f, value } : f
      )
    )
  }

  const handleToggleFilter = (filterId: string) => {
    setActiveFilters(
      activeFilters.map((f) =>
        f.id === filterId ? { ...f, enabled: !f.enabled } : f
      )
    )
  }

  const getFilterDef = (type: Filter['type']) =>
    FILTER_TYPES.find((f) => f.type === type)

  return (
    <Card className="w-full bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Filters */}
        <div className="space-y-3">
          {activeFilters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No filters applied</p>
          ) : (
            activeFilters.map((filter) => {
              const filterDef = getFilterDef(filter.type)
              if (!filterDef) return null

              return (
                <div
                  key={filter.id}
                  className="rounded-lg border border-border bg-sidebar p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filter.enabled}
                        onChange={() => handleToggleFilter(filter.id)}
                        className="h-4 w-4 rounded"
                      />
                      <span className="font-medium text-foreground">
                        {filterDef.label}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFilter(filter.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <Slider
                      value={[filter.value]}
                      onValueChange={(v) => handleUpdateValue(filter.id, v[0])}
                      min={filterDef.min}
                      max={filterDef.max}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="min-w-[50px] text-right text-sm font-mono text-muted-foreground">
                      {filter.value.toFixed(1)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Available Filters */}
        <div className="border-t border-border pt-4">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            Add Filter
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FILTER_TYPES.map((filter) => (
              <Button
                key={filter.type}
                size="sm"
                variant={
                  activeFilters.find((f) => f.type === filter.type)
                    ? 'default'
                    : 'outline'
                }
                onClick={() => handleAddFilter(filter.type as Filter['type'])}
                disabled={!!activeFilters.find((f) => f.type === filter.type)}
                className="text-xs"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
