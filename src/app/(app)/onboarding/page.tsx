
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { MEMBER_PLAN } from '@/config/plans';
import { createSubscription } from '@/app/actions/subscriptions';
import { joinCommunityByCode } from '@/app/actions/communities';
import type { BillingPeriod, BillingPeriodId } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Crown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Post-signup onboarding page where users select a billing period and
 * start their subscription. Also supports invite codes and license info.
 */
export default function OnboardingPage() {
  const { user } = useAuth();
  const { loading: subLoading } = useSubscription();
  const router = useRouter();
  const { toast } = useToast();

  // Single-tier platform: every account uses the unified Member plan.
  const plan = MEMBER_PLAN;

  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriodId | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joiningCommunity, setJoiningCommunity] = useState(false);

  if (subLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          Please sign in to continue.
        </p>
      </div>
    );
  }

  const displayName =
    user.displayName || user.email?.split('@')[0] || 'Explorer';

  const handleStartPlan = async () => {
    if (!selectedPeriod) return;

    const period = plan.billingPeriods.find(
      (p: BillingPeriod) => p.id === selectedPeriod
    );
    if (!period) return;

    setIsCreating(true);
    const result = await createSubscription(
      user.uid,
      plan.id,
      selectedPeriod,
      period.months
    );

    if (result.success) {
      toast({
        title: 'Plan activated',
        description: 'You now have full access. Welcome!',
      });
      router.push('/communities');
    } else {
      toast({
        title: 'Something went wrong',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsCreating(false);
  };

  const handleJoinCommunity = async () => {
    if (!inviteCode.trim() || !user) return;
    setJoiningCommunity(true);
    const result = await joinCommunityByCode(inviteCode.trim(), user.uid);
    if (result.success) {
      toast({
        title: 'Joined community',
        description: 'You have been added to the community.',
      });
      setInviteCode('');
    } else {
      toast({
        title: 'Invalid code',
        description: result.error,
        variant: 'destructive',
      });
    }
    setJoiningCommunity(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      {/* Welcome */}
      <div className="text-center space-y-2">
        <Crown className="mx-auto h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold">Welcome, {displayName}!</h1>
        <p className="text-muted-foreground">
          Choose a billing period to unlock the full {plan.name} experience.
        </p>
      </div>

      {/* Plan details */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{plan.name} Plan</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features */}
          <ul className="grid gap-2 text-sm">
            {plan.features.map((f: string) => (
              <li key={f} className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {/* Billing period selector */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Select billing period
            </Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {plan.billingPeriods.map((period: BillingPeriod) => {
                const isSelected = selectedPeriod === period.id;
                return (
                  <button
                    key={period.id}
                    type="button"
                    onClick={() => setSelectedPeriod(period.id)}
                    className={cn(
                      'relative rounded-lg border p-4 text-left transition-all',
                      isSelected
                        ? 'border-2 border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    {period.savings && (
                      <span className="absolute -top-2.5 right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        {period.savings}
                      </span>
                    )}
                    <p className="font-semibold text-sm">{period.label}</p>
                    <p className="text-lg font-bold text-primary">
                      ${period.pricePerMonth.toFixed(2)}
                      <span className="text-xs font-normal text-muted-foreground">
                        /mo
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${period.priceTotal.toFixed(2)} total
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!selectedPeriod || isCreating}
            onClick={handleStartPlan}
          >
            {isCreating ? 'Setting up your plan...' : 'Start Plan'}
          </Button>
        </CardContent>
      </Card>

      {/* Invite code */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Have an invite code?</CardTitle>
          <CardDescription>
            Enter a community invite code to join right away.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="e.g. ABC123"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <Button
            variant="outline"
            disabled={!inviteCode.trim() || joiningCommunity}
            onClick={handleJoinCommunity}
          >
            {joiningCommunity ? 'Joining...' : 'Join'}
          </Button>
        </CardContent>
      </Card>

      {/* License info */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Your organization is paying?{' '}
          <a
            href="/pricing#licenses"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Learn about license-based access
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  );
}
