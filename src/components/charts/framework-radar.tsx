'use client';

/**
 * Framework Radar — the only place in the app that uses recharts.
 * Pulled into its own file so callers can next/dynamic it and avoid
 * shipping ~80KB of recharts on every page that mounts a profile.
 *
 * Used by:
 *   - /users/[id]                 (public profile radar)
 *   - /me  (Phase 7)              (your own profile radar over time)
 */

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface RadarPoint {
  name: string;
  score: number;
}

interface FrameworkRadarProps {
  data: RadarPoint[];
  /** Optional secondary series for over-time overlay (Phase 4 §4.4). */
  previous?: RadarPoint[] | null;
  /** Color of the primary series. Defaults to --primary cyan. */
  color?: string;
  /** Height in px. Default 380. */
  height?: number;
}

export function FrameworkRadar({
  data,
  previous,
  color = 'hsl(var(--primary))',
  height = 380,
}: FrameworkRadarProps): JSX.Element {
  // Merge data + previous on `name` so the radar plots both as
  // separate series (current solid, previous dashed/translucent).
  const merged = previous
    ? data.map((d) => ({
        name: d.name,
        score: d.score,
        previousScore: previous.find((p) => p.name === d.name)?.score ?? 0,
      }))
    : data;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={merged}>
          <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            axisLine={false}
          />
          {previous && (
            <Radar
              name="Earlier"
              dataKey="previousScore"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.08}
              strokeWidth={1.5}
            />
          )}
          <Radar
            name="Framework alignment"
            dataKey="score"
            stroke={color}
            fill={color}
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
