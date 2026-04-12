'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ImpactScoreHistoryProps {
  history: {
    date: string;
    dimensions: { name: string; score: number }[];
  }[];
}

const DIMENSION_COLORS: Record<string, string> = {
  Empathy: '#60a5fa',
  Justice: '#f59e0b',
  Autonomy: '#34d399',
  Utility: '#a78bfa',
  Virtue: '#fb7185',
  Courage: '#f97316',
};

/**
 * Line chart showing ethical impact score changes over time.
 * Each dimension is plotted as a separate line.
 */
export function ImpactScoreHistory({ history }: ImpactScoreHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No score history available yet. Your scores will appear here as you
        continue exploring.
      </p>
    );
  }

  // Transform data for recharts: flatten dimensions into per-date objects
  const chartData = history.map((entry) => {
    const point: Record<string, string | number> = { date: entry.date };
    for (const dim of entry.dimensions) {
      point[dim.name] = dim.score;
    }
    return point;
  });

  // Get unique dimension names
  const dimensionNames = history[0]?.dimensions.map((d) => d.name) ?? [];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.2}
          />
          <XAxis
            dataKey="date"
            tick={{
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 11,
            }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: '12px',
            }}
          />
          {dimensionNames.map((name) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={DIMENSION_COLORS[name] ?? '#888'}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
