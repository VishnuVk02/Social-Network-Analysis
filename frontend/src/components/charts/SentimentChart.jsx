import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-xl shadow-glass-md text-xs border border-midnight-700 bg-midnight-900/95 text-slate-200">
        <p className="font-semibold text-white mb-1">{payload[0].name}</p>
        <p className="flex justify-between space-x-4">
          <span className="font-medium">Ratio:</span>
          <span className="font-bold text-white" style={{ color: payload[0].payload.color }}>
            {payload[0].value}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function SentimentChart({ positive = 0, neutral = 0, negative = 0 }) {
  const data = [
    { name: 'Positive Sentiment', value: positive, color: '#03B5AA' }, // Pine Green
    { name: 'Neutral Sentiment', value: neutral, color: '#2adcd0' },  // Pine Light
    { name: 'Negative Sentiment', value: negative, color: '#FF8552' }  // Coral
  ].filter(item => item.value > 0);

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} 
          />
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(1, 23, 24, 0.9)" strokeWidth={2} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
