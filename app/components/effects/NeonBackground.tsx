'use client'

import { useEffect, useRef } from 'react'

interface Trail {
  points: { x: number; y: number; age: number }[]
  hue: number
  speed: number
  amplitude: number
  phase: number
  yBase: number
  thickness: number
  lifetime: number
  maxPoints: number
}

export default function NeonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let trails: Trail[] = []
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create initial trails
    const createTrail = (): Trail => {
      const hue = [190, 285, 320, 200, 300, 340][Math.floor(Math.random() * 6)]
      return {
        points: [],
        hue,
        speed: 0.3 + Math.random() * 0.7,
        amplitude: 80 + Math.random() * 200,
        phase: Math.random() * Math.PI * 2,
        yBase: canvas.height * (0.1 + Math.random() * 0.8),
        thickness: 1.5 + Math.random() * 3.5,
        lifetime: 60 + Math.random() * 120,
        maxPoints: 30 + Math.floor(Math.random() * 40),
      }
    }

    for (let i = 0; i < 5; i++) {
      trails.push(createTrail())
    }

    const animate = () => {
      const { width, height } = canvas

      // Trailing fade - clear with low alpha for persistence
      ctx.fillStyle = 'rgba(8, 4, 22, 0.15)'
      ctx.fillRect(0, 0, width, height)

      for (const trail of trails) {
        const x = ((time * trail.speed + trail.phase) % (width + 400)) - 200
        const y = trail.yBase + Math.sin(time * 0.02 * trail.speed + trail.phase) * trail.amplitude

        trail.points.push({ x, y, age: 0 })
        if (trail.points.length > trail.maxPoints) trail.points.shift()

        // Age all points
        for (const p of trail.points) p.age++

        // Draw trail
        if (trail.points.length < 2) continue

        ctx.beginPath()
        ctx.moveTo(trail.points[0].x, trail.points[0].y)

        for (let i = 1; i < trail.points.length; i++) {
          const p = trail.points[i]
          ctx.lineTo(p.x, p.y)
        }

        const alpha = 0.5
        ctx.strokeStyle = `hsla(${trail.hue}, 80%, 65%, ${alpha})`
        ctx.lineWidth = trail.thickness
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.shadowColor = `hsla(${trail.hue}, 90%, 60%, 0.8)`
        ctx.shadowBlur = 12
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Spawn new trails occasionally
      if (Math.random() < 0.008 && trails.length < 8) {
        trails.push(createTrail())
      }

      // Remove old trails
      trails = trails.filter((_, i) => i < 8)

      time++
      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
