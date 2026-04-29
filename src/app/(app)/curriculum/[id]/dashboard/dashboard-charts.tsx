'use client';

/**
 * Recharts-backed visualisations for the curriculum dashboard.
 *
 * Pulled into its own client component so the parent page can
 * `next/dynamic` it with `ssr: false`. recharts is ~80 KB gzipped
 * and the dashboard is only ever opened by curriculum creators
 * and admins, so deferring it removes a sizeable chunk from the
 * initial JS bundle on this route.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ItemBarDatum {
  id: string;
  name: string;
  fullName: string;
  count: number;
  dim: boolean;
}

interface CompletionRateDatum {
  id: string;
  name: string;
  fullName: string;
  rate: number;
}

export function ItemCompletionChart({ data }: { data: ItemBarDatum[] }) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg text-primary">Items completed</CardTitle>
        <CardDescription>
          Number of users who have completed each item (low-completion items
          are dimmed).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, bottom: 40, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                angle={-30}
                textAnchor="end"
                interval={0}
                height={60}
                tick={{
                  fontSize: 11,
                  fill: 'hsl(var(--muted-foreground))',
                }}
              />
              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 12,
                  fill: 'hsl(var(--muted-foreground))',
                }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--popover-foreground))',
                }}
                labelFormatter={(_label, payload) =>
                  payload && payload[0]
                    ? (payload[0].payload as { fullName: string }).fullName
                    : ''
                }
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={
                      entry.dim
                        ? 'hsl(var(--primary) / 0.25)'
                        : 'hsl(var(--primary))'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompletionRateChart({
  data,
}: {
  data: CompletionRateDatum[];
}) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg text-primary">Completion rate</CardTitle>
        <CardDescription>
          % of enrolled users who completed each item.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="w-full"
          style={{ height: `${Math.max(240, data.length * 32)}px` }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{
                  fontSize: 11,
                  fill: 'hsl(var(--muted-foreground))',
                }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={160}
                interval={0}
                tick={{
                  fontSize: 11,
                  fill: 'hsl(var(--foreground))',
                }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--popover-foreground))',
                }}
                formatter={(v: number) => [`${v}%`, 'Completion rate']}
                labelFormatter={(_l, payload) =>
                  payload && payload[0]
                    ? (payload[0].payload as { fullName: string }).fullName
                    : ''
                }
              />
              <Bar
                dataKey="rate"
                radius={[0, 4, 4, 0]}
                fill="hsl(var(--accent))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
