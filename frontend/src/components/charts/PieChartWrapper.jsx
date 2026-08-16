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

export default function PieChartWrapper({ positive = 0, neutral = 0, negative = 0 }) {
  // Setup data array for Pie rendering
  const data = [
    { name: 'Positive', value: positive, color: '#03B5AA' }, // Pine Green
    { name: 'Neutral', value: neutral, color: '#FF8552' },  // Coral
    { name: 'Negative', value: negative, color: '#e66835' }  // Coral Dark
  ].filter(item => item.value > 0); // Hide 0% values

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
