import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-xl shadow-glass-md text-xs border border-midnight-700 bg-midnight-900/95 text-slate-200">
        <p className="font-semibold text-white mb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="flex justify-between space-x-4">
            <span style={{ color: item.color || item.fill }} className="font-medium">{item.name}:</span>
            <span className="font-bold text-white">{item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BarChartWrapper({ data, xKey, yKey, name = 'Value', barColor = '#03B5AA' }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(3, 181, 170, 0.15)" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} 
          />
          <Bar 
            dataKey={yKey} 
            name={name} 
            fill={barColor} 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || barColor} 
                opacity={0.85} 
                className="hover:opacity-100 transition-opacity cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
