'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

interface FrameworkVerdictCardProps {
  framework: string;
  analysis: string;
  verdict: string;
  strength: 'supports' | 'opposes' | 'neutral';
}

/**
 * Card displaying a single ethical framework's analysis of a scenario.
 * Color-coded: green for supports, red for opposes, yellow for neutral.
 */
export function FrameworkVerdictCard({
  framework,
  analysis,
  verdict,
  strength,
}: FrameworkVerdictCardProps) {
  const strengthConfig = {
    supports: {
      border: 'border-green-500/50',
      bg: 'bg-green-500/10',
      icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
      label: 'Supports',
      labelColor: 'text-green-400',
    },
    opposes: {
      border: 'border-red-500/50',
      bg: 'bg-red-500/10',
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      label: 'Opposes',
      labelColor: 'text-red-400',
    },
    neutral: {
      border: 'border-yellow-500/50',
      bg: 'bg-yellow-500/10',
      icon: <MinusCircle className="h-5 w-5 text-yellow-400" />,
      label: 'Neutral',
      labelColor: 'text-yellow-400',
    },
  };

  const config = strengthConfig[strength];

  return (
    <Card className={cn('bg-card/80 backdrop-blur-sm', config.border)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{framework}</CardTitle>
          <div className={cn('flex items-center gap-1.5', config.labelColor)}>
            {config.icon}
            <span className="text-sm font-medium">{config.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">{analysis}</p>
        <div className={cn('rounded-lg p-3 text-sm', config.bg)}>
          <p className="font-medium">Verdict:</p>
          <p className="mt-1">{verdict}</p>
        </div>
      </CardContent>
    </Card>
  );
}
