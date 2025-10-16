'use client'

import { useEffect, useRef } from 'react'

interface LineChartProps {
  data: any[]
  xKey: string
  yKeys: string[]
  colors: string[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
}

export default function LineChart({ 
  data, 
  xKey, 
  yKeys, 
  colors, 
  height = 300, 
  showGrid = true, 
  showLegend = true 
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data || !data.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Validate data structure
    const validData = data.filter(item => item && item[xKey] && yKeys.some(key => item[key] !== undefined))
    if (validData.length === 0) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height)

    // Chart dimensions
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Get data ranges
    const xValues = validData.map(d => new Date(d[xKey]).getTime())
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)

    const allYValues = yKeys.flatMap(key => validData.map(d => d[key] || 0))
    const yMin = Math.min(...allYValues)
    const yMax = Math.max(...allYValues)
    const yRange = yMax - yMin

    // Helper functions
    const getX = (value: number) => padding.left + ((value - xMin) / (xMax - xMin)) * chartWidth
    const getY = (value: number) => padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 0.5
      ctx.globalAlpha = 0.3

      // Vertical grid lines
      for (let i = 0; i <= 5; i++) {
        const x = padding.left + (i / 5) * chartWidth
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, padding.top + chartHeight)
        ctx.stroke()
      }

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

    const labelCount = Math.min(6, validData.length)
    for (let i = 0; i < labelCount; i++) {
      const dataIndex = Math.floor((i / (labelCount - 1)) * (validData.length - 1))
      const dataPoint = validData[dataIndex]
      if (dataPoint && dataPoint[xKey]) {
        const date = new Date(dataPoint[xKey])
        const x = getX(date.getTime())
        const label = date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
        ctx.fillText(label, x, padding.top + chartHeight + 10)
      }
    }

    // Draw lines
    yKeys.forEach((yKey, keyIndex) => {
      ctx.strokeStyle = colors[keyIndex] || '#3B82F6'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.beginPath()
      validData.forEach((point, index) => {
        if (point && point[xKey] && point[yKey] !== undefined) {
          const x = getX(new Date(point[xKey]).getTime())
          const y = getY(point[yKey] || 0)

          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      ctx.stroke()

      // Draw points
      ctx.fillStyle = colors[keyIndex] || '#3B82F6'
      validData.forEach(point => {
        if (point && point[xKey] && point[yKey] !== undefined) {
          const x = getX(new Date(point[xKey]).getTime())
          const y = getY(point[yKey] || 0)
          
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, 2 * Math.PI)
          ctx.fill()
        }
      })
    })

  }, [data, xKey, yKeys, colors, height, showGrid])

  // Show empty state if no valid data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="text-center">
          <p className="text-gray-500 dark:text-accent-silver/70">No data available</p>
          <p className="text-sm text-gray-400 dark:text-accent-silver/50 mt-1">Chart will appear when data is available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />
      {showLegend && (
        <div className="flex items-center justify-center mt-4 space-x-6">
          {yKeys.map((key, index) => (
            <div key={key} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index] || '#3B82F6' }}
              />
              <span className="text-sm text-gray-600 dark:text-accent-silver capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
