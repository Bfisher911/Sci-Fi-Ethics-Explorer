'use client';

import { useState } from 'react';
import { PlanCard } from './plan-card';
import type { PlanConfig, BillingPeriodId, AccountRole } from '@/types';

interface PlanSelectorProps {
  plans: PlanConfig[];
  accountRole?: AccountRole;
  onSelect: (planId: string, periodId: BillingPeriodId) => void;
}

/**
 * Side-by-side plan comparison component.
 * Shows plans in a responsive grid and highlights the plan matching the user's role.
 */
export function PlanSelector({ plans, accountRole, onSelect }: PlanSelectorProps) {
  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, BillingPeriodId>>({});

  function handlePeriodChange(planId: string, periodId: BillingPeriodId): void {
    setSelectedPeriods((prev) => ({ ...prev, [planId]: periodId }));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {plans.map((plan) => {
        const isRoleMatch = accountRole ? plan.role === accountRole : undefined;

        return (
          <PlanCard
            key={plan.id}
            plan={plan}
            selectedPeriod={selectedPeriods[plan.id]}
            onSelectPeriod={(periodId) => handlePeriodChange(plan.id, periodId)}
            onSelect={onSelect}
            highlighted={isRoleMatch ?? plan.highlighted}
          />
        );
      })}
    </div>
  );
}
