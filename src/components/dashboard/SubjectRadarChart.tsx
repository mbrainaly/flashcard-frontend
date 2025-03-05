import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { LearningStats } from '@/services/dashboard.service'

interface SubjectRadarChartProps {
  data: LearningStats
}

export default function SubjectRadarChart({ data }: SubjectRadarChartProps) {
  // Combine weak and strong areas for complete subject data
  const allSubjects = [...data.weakAreas, ...data.strongAreas]
    .reduce((acc, curr) => {
      // If subject already exists, take the higher score
      const existing = acc.find(item => item.subject === curr.subject)
      if (existing) {
        existing.score = Math.max(existing.score, curr.score)
      } else {
        acc.push({ ...curr })
      }
      return acc
    }, [] as { subject: string; score: number }[])
    .sort((a, b) => b.score - a.score)

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%">
          <PolarGrid stroke="#ffffff20" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#94a3b8' }}
          />
          <Radar
            name="Performance"
            dataKey="score"
            data={allSubjects}
            fill="#22c55e20"
            fillOpacity={0.6}
            stroke="#22c55e"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              color: '#fff'
            }}
            formatter={(value: number) => `${value}%`}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
} 