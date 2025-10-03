'use client'

import { useEffect, useRef } from 'react'

interface BarChartProps {
  data: any[]
  xKey: string
  yKey: string
  color?: string
  height?: number
  showGrid?: boolean
  showValues?: boolean
}

export default function BarChart({ 
  data, 
  xKey, 
  yKey, 
  color = '#3B82F6', 
  height = 300, 
  showGrid = true, 
  showValues = false 
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height)

    // Chart dimensions
    const padding = { top: 20, right: 20, bottom: 60, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Get data ranges
    const yValues = data.map(d => d[yKey])
    const yMin = 0 // Start from 0 for bar charts
    const yMax = Math.max(...yValues)
    const yRange = yMax - yMin

    // Helper functions
    const getX = (index: number) => padding.left + (index / data.length) * chartWidth
    const getY = (value: number) => padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight
    const barWidth = chartWidth / data.length * 0.7

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 0.5
      ctx.globalAlpha = 0.3

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (i / 5) * chartHeight
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(padding.left + chartWidth, y)
        ctx.stroke()
      }

      ctx.globalAlpha = 1
    }

    // Draw axes
    ctx.strokeStyle = '#6B7280'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, padding.top + chartHeight)
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.stroke()

    // Draw y-axis labels
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    for (let i = 0; i <= 5; i++) {
      const value = yMin + (yRange * i) / 5
      const y = padding.top + chartHeight - (i / 5) * chartHeight
      ctx.fillText(Math.round(value).toLocaleString(), padding.left - 10, y)
    }

    // Draw x-axis labels
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#9CA3AF'

    data.forEach((item, index) => {
      const x = getX(index) + barWidth / 2
      ctx.fillText(item[xKey], x, padding.top + chartHeight + 10)
    })

    // Draw bars
    ctx.fillStyle = color
    data.forEach((item, index) => {
      const x = getX(index)
      const y = getY(item[yKey])
      const barHeight = chartHeight - (y - padding.top)

      // Create gradient
      const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartHeight)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, color + '80') // Add transparency

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // Add hover effect (simplified)
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, barWidth, barHeight)

      // Show values on bars
      if (showValues) {
        ctx.fillStyle = '#374151'
        ctx.font = '11px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(
          item[yKey].toLocaleString(),
          x + barWidth / 2,
          y - 5
        )
      }
    })

  }, [data, xKey, yKey, color, height, showGrid, showValues])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />
    </div>
  )
}
