'use client'

import React, { useState, useEffect } from 'react'

type TriggerType = 'hover' | 'always' | 'once'

interface GoldPulseProps {
  children: React.ReactNode
  trigger?: TriggerType
  className?: string
}

/**
 * GoldPulse — wraps an element and applies a golden pulse glow animation.
 *
 * - 'hover': activates on hover (default)
 * - 'always': continuously pulses
 * - 'once': pulses once on mount then stops
 */
export default function GoldPulse({
  children,
  trigger = 'hover',
  className = '',
}: GoldPulseProps) {
  const [hasPlayed, setHasPlayed] = useState(false)

  const baseStyle: React.CSSProperties = {
    borderRadius: 'inherit',
  }

  if (trigger === 'always') {
    baseStyle.animation = 'goldPulse 2s ease-in-out infinite'
  } else if (trigger === 'once' && !hasPlayed) {
    baseStyle.animation = 'goldPulse 2s ease-in-out 1'
  }

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setHasPlayed(true)
    }
  }

  const handleAnimationEnd = () => {
    if (trigger === 'once') {
      setHasPlayed(true)
    }
  }

  return (
    <div
      className={className}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  )
}
