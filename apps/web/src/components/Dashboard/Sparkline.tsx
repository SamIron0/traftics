"use client"

import { useEffect, useRef } from "react"

interface SparklineProps {
  data: number[]
  className?: string
}

export function Sparkline({ data, className }: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set line style
    ctx.strokeStyle = "#008000"
    ctx.lineWidth = 1.5

    // Calculate points
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * canvas.width,
      y: canvas.height - ((value - Math.min(...data)) / (Math.max(...data) - Math.min(...data))) * canvas.height,
    }))

    // Draw line
    ctx.beginPath()
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()
  }, [data])

  return <canvas ref={canvasRef} className={`h-8 w-full ${className}`} height={32} width={128} />
}

