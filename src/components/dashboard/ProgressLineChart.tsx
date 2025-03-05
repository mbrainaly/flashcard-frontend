import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { LearningStats } from '@/services/dashboard.service'
import { format } from 'date-fns'

interface ProgressLineChartProps {
  data: LearningStats
}

interface ProgressData {
  date: string
  score: number
  mastered: number
}

export default function ProgressLineChart({ data }: ProgressLineChartProps) {
  // Generate sample progress data for the last 7 days
  // In a real implementation, this would come from historical data
  const progressData: ProgressData[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    
    return {
      date: format(date, 'MMM dd'),
      score: Math.min(100, data.averageScore + (Math.random() * 10 - 5)),
      mastered: Math.floor(data.masteredTopics * (0.7 + (i * 0.05)))
    }
  })

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={progressData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis 
            yAxisId="left"
            domain={[0, 100]}
            tick={{ fill: '#94a3b8' }}
            label={{ 
              value: 'Score (%)', 
              angle: -90, 
              position: 'insideLeft',
              fill: '#94a3b8'
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 'auto']}
            tick={{ fill: '#94a3b8' }}
            label={{
              value: 'Mastered Topics',
              angle: 90,
              position: 'insideRight',
              fill: '#94a3b8'
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              color: '#fff'
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="score"
            stroke="#22c55e"
            name="Average Score"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="mastered"
            stroke="#3b82f6"
            name="Mastered Topics"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 