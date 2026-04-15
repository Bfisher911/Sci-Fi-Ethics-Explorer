'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { useToast } from '@/hooks/use-toast';
import type { SubscriptionPlan } from '@/types';

type Tier =
  | {
      kind: 'free';
      name: string;
      price: string;
      frequency: string;
      description: string;
      features: { text: string; included: boolean }[];
      cta: string;
      href: string;
      isPrimary: false;
    }
  | {
      kind: 'paid';
      plan: SubscriptionPlan;
      name: string;
      price: string;
      frequency: string;
      description: string;
      features: { text: string; included: boolean }[];
      isPrimary: boolean;
      savingsLabel?: string;
    };

const premiumFeatures = [
  { text: 'Unlimited access to all dilemmas', included: true },
  { text: 'Advanced scenario analysis (unlimited)', included: true },
  { text: 'Submit and participate in community dilemmas', included: true },
  { text: 'Full ethical glossary & framework explorer access', included: true },
  { text: 'Unlimited AI Counselor interactions', included: true },
  { text: 'Submit unlimited dilemmas', included: true },
  { text: 'Priority support & early access to new features', included: true },
  { text: 'Participate in moderated debates', included: true },
];

const tiers: Tier[] = [
  {
    kind: 'free',
    name: 'Explorer (Free)',
    price: '$0',
    frequency: '/month',
    description: 'Start your journey into sci-fi ethics with core features.',
    features: [
      { text: 'Access to a selection of dilemmas', included: true },
      { text: 'Basic scenario analysis (limited)', included: true },
      { text: 'Read community dilemmas', included: true },
      { text: 'Ethical glossary access', included: true },
      { text: 'Limited AI Counselor interactions', included: true },
      { text: 'Submit up to 1 dilemma per month', included: true },
    ],
    cta: 'Start Exploring',
    href: '/stories',
    isPrimary: false,
  },
  {
    kind: 'paid',
    plan: 'monthly',
    name: 'Philosopher · Monthly',
    price: '$9.99',
    frequency: '/month',
    description: 'Unlock everything month-to-month. Cancel anytime.',
    features: premiumFeatures,
    isPrimary: false,
  },
  {
    kind: 'paid',
    plan: 'semester',
    name: 'Philosopher · Semester',
    price: '$29.99',
    frequency: ' / 4 months',
    description: 'Best for a single term. Save 25% vs. monthly.',
    features: premiumFeatures,
    isPrimary: true,
    savingsLabel: 'Save 25%',
  },
  {
    kind: 'paid',
    plan: 'annual',
    name: 'Philosopher · Annual',
    price: '$79.99',
    frequency: '/year',
    description: 'A full year of premium access. Save 33% vs. monthly.',
    features: premiumFeatures,
    isPrimary: false,
    savingsLabel: 'Save 33%',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { plan: currentPlan, isPremium, loading: subLoading } = useSubscription();
  const { toast } = useToast();
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);

  const checkoutState = searchParams.get('checkout');

  const handleBuy = async (plan: SubscriptionPlan) => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent('/pricing')}`);
      return;
    }

    setPendingPlan(plan);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Checkout failed (${res.status}).`);
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Checkout error:', err);
      toast({
        variant: 'destructive',
        title: 'Could not start checkout',
        description: err instanceof Error ? err.message : 'Please try again in a moment.',
      });
      setPendingPlan(null);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary font-headline">Choose Your Path</h1>
        <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
          Select a plan that suits your journey into the complex world of sci-fi ethics.
        </p>
      </div>

      {checkoutState === 'success' && (
        <Alert className="mb-8 max-w-2xl mx-auto border-green-500/50 bg-green-500/10">
          <AlertTitle className="text-green-300">Welcome to Philosopher!</AlertTitle>
          <AlertDescription>
            Your subscription is active. It may take a few seconds for premium features to unlock.
          </AlertDescription>
        </Alert>
      )}
      {checkoutState === 'cancel' && (
        <Alert className="mb-8 max-w-2xl mx-auto" variant="destructive">
          <AlertTitle>Checkout canceled</AlertTitle>
          <AlertDescription>No changes were made to your account.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {tiers.map((tier) => {
          const isCurrent =
            tier.kind === 'paid' && isPremium && currentPlan === tier.plan;
          const loading = tier.kind === 'paid' && pendingPlan === tier.plan;

          return (
            <Card
              key={tier.name}
              className={`flex flex-col shadow-xl hover:shadow-primary/40 transition-shadow duration-300 bg-card/80 backdrop-blur-sm ${
                tier.isPrimary ? 'border-2 border-accent ring-2 ring-accent/50' : ''
              }`}
            >
              <CardHeader className="text-center">
                {tier.isPrimary && (
                  <div className="text-sm font-semibold uppercase tracking-wider text-accent mb-2 flex items-center justify-center">
                    <Zap className="h-4 w-4 mr-1" /> Most Popular
                  </div>
                )}
                <CardTitle
                  className={`text-2xl font-bold ${
                    tier.isPrimary ? 'text-accent' : 'text-primary'
                  }`}
                >
                  {tier.name}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-extrabold text-foreground">{tier.price}</span>
                  <span className="text-base font-medium text-muted-foreground">
                    {tier.frequency}
                  </span>
                </div>
                {tier.kind === 'paid' && tier.savingsLabel && (
                  <div className="mt-1 text-xs font-semibold text-accent">{tier.savingsLabel}</div>
                )}
                <CardDescription className="mt-3 text-sm">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start">
                      {feature.included ? (
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={
                          feature.included ? 'text-foreground/90 text-sm' : 'text-muted-foreground text-sm'
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {tier.kind === 'free' ? (
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    disabled={loading || subLoading || isCurrent}
                    onClick={() => handleBuy(tier.plan)}
                    className={`w-full ${
                      tier.isPrimary
                        ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Redirecting…
                      </>
                    ) : isCurrent ? (
                      'Current plan'
                    ) : (
                      `Subscribe · ${tier.price}`
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-12 max-w-2xl mx-auto">
        Payments are processed securely by Stripe. You can cancel or change your plan at any
        time from your account.
      </p>
    </div>
  );
}
