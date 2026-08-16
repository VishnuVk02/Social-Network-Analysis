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
      <div className="glass-panel p-3 rounded-xl shadow-glass-md text-xs border border-slate-700/60 bg-dark-900/90 text-slate-300">
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
    { name: 'Positive Sentiment', value: positive, color: '#10b981' }, // Emerald
    { name: 'Neutral Sentiment', value: neutral, color: '#f59e0b' },  // Amber
    { name: 'Negative Sentiment', value: negative, color: '#ef4444' }  // Rose
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
              <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={2} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
