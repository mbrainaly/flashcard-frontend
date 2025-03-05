import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { StudyProgress } from '@/services/dashboard.service'

interface StudyTimeChartProps {
  data: StudyProgress
}

export default function StudyTimeChart({ data }: StudyTimeChartProps) {
  // Calculate time spent on each activity type
  const studyTimeData = [
    {
      name: 'Quizzes',
      value: data.subjectProgress.reduce((total, subject) => {
        return total + (subject.quizTime || 0)
      }, 0),
      color: '#22c55e' // accent-neon
    },
    {
      name: 'Flashcards',
      value: data.subjectProgress.reduce((total, subject) => {
        return total + (subject.flashcardTime || 0)
      }, 0),
      color: '#fbbf24' // accent-gold
    },
    {
      name: 'Notes',
      value: data.subjectProgress.reduce((total, subject) => {
        return total + (subject.noteTime || 0)
      }, 0),
      color: '#94a3b8' // accent-silver
    }
  ].filter(item => item.value > 0) // Only show activities with time spent

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={studyTimeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {studyTimeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              color: '#fff'
            }}
            formatter={(value: number) => `${Math.round(value / 60)} minutes`}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-accent-silver">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
} 