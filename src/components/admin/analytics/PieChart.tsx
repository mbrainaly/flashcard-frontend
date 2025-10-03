'use client'

import { useEffect, useRef } from 'react'

interface PieChartData {
  name: string
  value: number
  color: string
}

interface PieChartProps {
  data: PieChartData[]
  height?: number
  showLegend?: boolean
  showLabels?: boolean
}

export default function PieChart({ 
  data, 
  height = 300, 
  showLegend = true, 
  showLabels = false 
}: PieChartProps) {
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
    const centerX = rect.width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 40

    // Calculate total and angles
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = -Math.PI / 2 // Start from top

    // Draw pie slices
    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI
      
      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      
      // Create gradient for slice
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, item.color + 'CC')
      gradient.addColorStop(1, item.color)
      
      ctx.fillStyle = gradient
      ctx.fill()
      
      // Add stroke
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw labels if enabled
      if (showLabels) {
        const labelAngle = currentAngle + sliceAngle / 2
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)
        
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 12px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        const percentage = ((item.value / total) * 100).toFixed(1)
        ctx.fillText(`${percentage}%`, labelX, labelY)
      }

      currentAngle += sliceAngle
    })

    // Draw center circle for donut effect
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI)
    ctx.fillStyle = '#1F2937'
    ctx.fill()

    // Add center text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 16px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Total', centerX, centerY - 10)
    
    ctx.font = '14px system-ui'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText(total.toLocaleString(), centerX, centerY + 10)

  }, [data, height, showLabels])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />
      {showLegend && (
        <div className="flex flex-wrap items-center justify-center mt-4 gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600 dark:text-accent-silver">
                {item.name}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
