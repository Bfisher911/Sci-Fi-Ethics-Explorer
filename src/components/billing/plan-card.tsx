'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, Crown, Gem } from 'lucide-react';
import type { PlanConfig, BillingPeriodId } from '@/types';

interface PlanCardProps {
  plan: PlanConfig;
  selectedPeriod?: BillingPeriodId;
  onSelectPeriod?: (periodId: BillingPeriodId) => void;
  onSelect?: (planId: string, periodId: BillingPeriodId) => void;
  highlighted?: boolean;
}

/**
 * Reusable plan display card showing plan details, billing period selector,
 * pricing, and a CTA button.
 */
export function PlanCard({
  plan,
  selectedPeriod,
  onSelectPeriod,
  onSelect,
  highlighted,
}: PlanCardProps) {
  const [internalPeriod, setInternalPeriod] = useState<BillingPeriodId>(
    selectedPeriod ?? plan.billingPeriods[0]?.id ?? 'monthly'
  );

  const activePeriod = selectedPeriod ?? internalPeriod;
  const currentBilling = plan.billingPeriods.find((bp) => bp.id === activePeriod) ?? plan.billingPeriods[0];
  const isHighlighted = highlighted ?? plan.highlighted;

  function handlePeriodChange(value: string): void {
    const periodId = value as BillingPeriodId;
    setInternalPeriod(periodId);
    onSelectPeriod?.(periodId);
  }

  function handleSelect(): void {
    onSelect?.(plan.id, activePeriod);
  }

  const RoleIcon = plan.role === 'instructor' ? Crown : Gem;

  return (
    <Card
      className={`flex flex-col shadow-xl hover:shadow-primary/40 transition-shadow duration-300 bg-card/80 backdrop-blur-sm ${
        isHighlighted ? 'border-2 border-accent ring-2 ring-accent/50' : ''
      }`}
    >
      <CardHeader className="text-center">
        {isHighlighted && (
          <div className="text-sm font-semibold uppercase tracking-wider text-accent mb-2 flex items-center justify-center">
            <RoleIcon className="h-4 w-4 mr-1" /> Recommended
          </div>
        )}
        <CardTitle
          className={`text-3xl font-bold ${isHighlighted ? 'text-accent' : 'text-primary'}`}
        >
          {plan.name}
        </CardTitle>
        <CardDescription className="mt-2 text-md">{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-6">
        {/* Billing Period Selector */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Billing Period</p>
          <RadioGroup
            value={activePeriod}
            onValueChange={handlePeriodChange}
            className="space-y-2"
          >
            {plan.billingPeriods.map((bp) => (
              <div
                key={bp.id}
                className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                  activePeriod === bp.id
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
                onClick={() => handlePeriodChange(bp.id)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={bp.id} id={`${plan.id}-${bp.id}`} />
                  <Label htmlFor={`${plan.id}-${bp.id}`} className="cursor-pointer font-medium">
                    {bp.label}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    ${bp.pricePerMonth.toFixed(2)}/mo
                  </span>
                  {bp.savings && (
                    <Badge variant="secondary" className="text-xs">
                      {bp.savings}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Price Display */}
        <div className="text-center py-4 rounded-lg bg-muted/30">
          <div className="text-4xl font-extrabold text-foreground">
            ${currentBilling.pricePerMonth.toFixed(2)}
            <span className="text-base font-medium text-muted-foreground">/mo</span>
          </div>
          {currentBilling.months > 1 && (
            <p className="text-sm text-muted-foreground mt-1">
              ${currentBilling.priceTotal.toFixed(2)} total for {currentBilling.months} months
            </p>
          )}
        </div>

        {/* Feature List */}
        <ul className="space-y-2.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground/90">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          size="lg"
          className={`w-full ${
            isHighlighted
              ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
          onClick={handleSelect}
        >
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
}
