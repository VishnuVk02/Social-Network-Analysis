import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-xl shadow-glass-md text-xs border border-midnight-700 bg-midnight-900/95 text-slate-200">
        <p className="font-semibold text-white mb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="flex justify-between space-x-4">
            <span style={{ color: item.color }} className="font-medium">{item.name}:</span>
            <span className="font-bold text-white">{item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LineChartWrapper({ data, dataKey, xKey, name = 'Value', strokeColor = '#03B5AA' }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
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
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            name={name} 
            stroke={strokeColor} 
            strokeWidth={3} 
            dot={{ r: 4, stroke: strokeColor, strokeWidth: 1, fill: '#011718' }}
            activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: strokeColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
