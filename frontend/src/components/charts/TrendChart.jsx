import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-xl shadow-glass-md text-xs border border-slate-700/60 bg-dark-900/90 text-slate-300">
        <p className="font-semibold text-white mb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="flex justify-between space-x-4">
            <span style={{ color: item.color }} className="font-medium">{item.name}:</span>
            <span className="font-bold text-white">{item.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data, xKey = 'date', yKey = 'upvotes', name = 'Upvotes', color = '#10b981' }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
          <Area 
            type="monotone" 
            dataKey={yKey} 
            name={name} 
            stroke={color} 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#areaColor)"
            activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
