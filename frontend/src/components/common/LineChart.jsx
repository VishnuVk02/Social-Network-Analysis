import React from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function LineChart({ data, xKey, series, height = 300 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-slate-500 font-semibold">
        No dataset provided for line chart rendering.
      </div>
    );
  }

  // Define default HSL tailwind colors if not specified
  const defaultColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => {
              if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M';
              if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
              return val;
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#fff'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
          {series.map((s, idx) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name || s.key}
              stroke={s.color || defaultColors[idx % defaultColors.length]}
              strokeWidth={2.5}
              dot={{ strokeWidth: 1, r: 3 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
