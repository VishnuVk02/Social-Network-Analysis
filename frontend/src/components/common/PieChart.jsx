import React from 'react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

export default function PieChart({ data, nameKey, valueKey, height = 300 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-slate-500 font-semibold">
        No dataset provided for pie chart rendering.
      </div>
    );
  }

  const defaultColors = ['#10b981', '#64748b', '#ef4444', '#f59e0b', '#3b82f6'];

  return (
    <div style={{ width: '100%', height }} className="flex items-center justify-center">
      <ResponsiveContainer>
        <RechartsPieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#fff'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
          />
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            outerRadius={90}
            innerRadius={45}
            paddingAngle={3}
            dataKey={valueKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || defaultColors[index % defaultColors.length]} 
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
