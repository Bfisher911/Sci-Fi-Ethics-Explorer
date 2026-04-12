'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface EthicalImpactRadarProps {
  dimensions: { name: string; score: number }[];
}

/**
 * 6-axis radar chart showing ethical impact scores across dimensions:
 * Empathy, Justice, Autonomy, Utility, Virtue, Courage.
 * Styled to match the dark theme.
 */
export function EthicalImpactRadar({ dimensions }: EthicalImpactRadarProps) {
  if (!dimensions || dimensions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No impact data available yet. Complete more activities to see your
        ethical profile.
      </p>
    );
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dimensions}>
          <PolarGrid
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.3}
          />
          <PolarAngleAxis
            dataKey="name"
            tick={{
              fill: 'hsl(var(--foreground))',
              fontSize: 12,
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 10,
            }}
            axisLine={false}
          />
          <Radar
            name="Ethical Impact"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.25}
            strokeWidth={2}
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
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
