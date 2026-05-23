'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Sparkles, X } from 'lucide-react'

interface Effect {
  id: string
  name: string
  intensity: number
  enabled: boolean
}

const AVAILABLE_EFFECTS = [
  { id: 'blur', name: 'Blur', maxIntensity: 20 },
  { id: 'pixelate', name: 'Pixelate', maxIntensity: 50 },
  { id: 'sepia', name: 'Sepia Tone', maxIntensity: 1 },
  { id: 'grayscale', name: 'Grayscale', maxIntensity: 1 },
  { id: 'invert', name: 'Invert', maxIntensity: 1 },
  { id: 'posterize', name: 'Posterize', maxIntensity: 256 },
  { id: 'solarize', name: 'Solarize', maxIntensity: 1 },
  { id: 'vignette', name: 'Vignette', maxIntensity: 1 },
]

export function EffectsPanel() {
  const [activeEffects, setActiveEffects] = useState<Effect[]>([])

  const handleAddEffect = (effectId: string) => {
    const effectDef = AVAILABLE_EFFECTS.find((e) => e.id === effectId)
    if (effectDef && !activeEffects.find((e) => e.id === effectId)) {
      setActiveEffects([
        ...activeEffects,
        {
          id: effectId,
          name: effectDef.name,
          intensity: 0.5,
          enabled: true,
        },
      ])
    }
  }

  const handleRemoveEffect = (effectId: string) => {
    setActiveEffects(activeEffects.filter((e) => e.id !== effectId))
  }

  const handleUpdateIntensity = (effectId: string, intensity: number) => {
    setActiveEffects(
      activeEffects.map((e) =>
        e.id === effectId ? { ...e, intensity } : e
      )
    )
  }

  const handleToggleEffect = (effectId: string) => {
    setActiveEffects(
      activeEffects.map((e) =>
        e.id === effectId ? { ...e, enabled: !e.enabled } : e
      )
    )
  }

  return (
    <Card className="w-full bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Effects
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Effects */}
        <div className="space-y-3">
          {activeEffects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No effects applied</p>
          ) : (
            activeEffects.map((effect) => (
              <div
                key={effect.id}
                className="rounded-lg border border-border bg-sidebar p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={effect.enabled}
                      onChange={() => handleToggleEffect(effect.id)}
                      className="h-4 w-4 rounded"
                    />
                    <span className="font-medium text-foreground">
                      {effect.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveEffect(effect.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Slider
                  value={[effect.intensity]}
                  onValueChange={(v) =>
                    handleUpdateIntensity(effect.id, v[0])
                  }
                  max={1}
                  step={0.01}
                />
              </div>
            ))
          )}
        </div>

        {/* Available Effects */}
        <div className="border-t border-border pt-4">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            Add Effect
          </p>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_EFFECTS.map((effect) => (
              <Button
                key={effect.id}
                size="sm"
                variant={
                  activeEffects.find((e) => e.id === effect.id)
                    ? 'default'
                    : 'outline'
                }
                onClick={() => handleAddEffect(effect.id)}
                disabled={!!activeEffects.find((e) => e.id === effect.id)}
                className="text-xs"
              >
                {effect.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
