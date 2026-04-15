'use client';

import { PerspectiveComparison } from '@/components/analysis/perspective-comparison';
import { Card, CardContent } from '@/components/ui/card';
import { Scale } from 'lucide-react';
import { PremiumGate } from '@/components/gating/premium-gate';

/**
 * Standalone page for comparing ethical perspectives on a scenario.
 */
export default function PerspectiveComparisonPage() {
  return (
    <PremiumGate featureName="Perspective Comparison">
      <PerspectiveComparisonPageInner />
    </PremiumGate>
  );
}

function PerspectiveComparisonPageInner() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold mb-2 text-primary font-headline flex items-center gap-3">
            <Scale className="h-9 w-9" />
            Perspective Comparison
          </h1>
          <p className="text-lg text-muted-foreground">
            See how different ethical frameworks evaluate the same scenario and
            your choice. Compare perspectives from Utilitarianism, Deontology,
            Virtue Ethics, and Social Contract Theory.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <PerspectiveComparison />
        </CardContent>
      </Card>
    </div>
  );
}
