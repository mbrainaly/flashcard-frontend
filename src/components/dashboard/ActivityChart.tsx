import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyActivity } from '@/services/dashboard.service';

interface ActivityChartProps {
  data: DailyActivity[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8"
            tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
          />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="decks"
            name="Flashcards"
            stroke="#fbbf24"
            strokeWidth={2}
            dot={{ fill: '#fbbf24' }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="notes"
            name="Notes"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={{ fill: '#94a3b8' }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="quizzes"
            name="Quizzes"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e' }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 