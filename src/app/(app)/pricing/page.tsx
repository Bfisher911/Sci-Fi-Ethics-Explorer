'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PlanSelector } from '@/components/billing/plan-selector';
import { SeatTierSelector } from '@/components/billing/license-purchase';
import {
  ALL_INDIVIDUAL_PLANS,
  LICENSE_PLAN,
  getSeatTiers,
} from '@/config/plans';
import { useSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/hooks/use-auth';
import { createCheckoutSession } from '@/app/actions/stripe';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  Building2,
  Users,
  Check,
  ArrowRight,
  Info,
} from 'lucide-react';
import type { BillingPeriodId, LicenseTerm } from '@/types';

/**
 * Pricing page with two tabs: Individual Plans and Organization Licenses.
 */
export default function PricingPage() {
  const router = useRouter();
  const { accountRole } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Organization license state
  const [licenseTerm, setLicenseTerm] = useState<LicenseTerm>('semester');
  const [selectedSeats, setSelectedSeats] = useState<number | undefined>();

  const seatTiers = getSeatTiers(licenseTerm);
  const selectedTier = seatTiers.find((t) => t.seats === selectedSeats);

  async function handleIndividualSelect(_planId: string, periodId: BillingPeriodId): Promise<void> {
    if (!user) {
      router.push(`/login?next=/pricing`);
      return;
    }
    if (periodId !== 'monthly' && periodId !== 'semester' && periodId !== 'annual') {
      toast({
        title: 'Unsupported billing period',
        description: 'Choose monthly, semester, or annual.',
        variant: 'destructive',
      });
      return;
    }
    setIsCheckingOut(true);
    try {
      const result = await createCheckoutSession({
        uid: user.uid,
        email: user.email,
        period: periodId,
      });
      if (!result.success) {
        toast({
          title: 'Checkout unavailable',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      window.location.href = result.data.url;
    } finally {
      setIsCheckingOut(false);
    }
  }

  function handleLicensePurchase(): void {
    if (!selectedSeats) return;
    router.push(`/license/purchase?term=${licenseTerm}&seats=${selectedSeats}`);
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-primary font-headline">
          Choose Your Path
        </h1>
        <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
          Full access to the Sci-Fi Ethics Explorer for individuals and organizations.
        </p>
      </div>

      <Tabs defaultValue="individual" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Individual Plans
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
        </TabsList>

        {/* ─── Individual Plan ───────────────────────────────────── */}
        <TabsContent value="individual">
          <div className="text-center mb-8">
            <p className="text-muted-foreground flex items-center justify-center gap-1.5">
              <Info className="h-4 w-4" />
              One member tier. Anyone can create a community, join others, and use every tool.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <PlanSelector
              plans={ALL_INDIVIDUAL_PLANS}
              accountRole={accountRole}
              onSelect={handleIndividualSelect}
            />
          </div>
        </TabsContent>

        {/* ─── Organization License ─────────────────────────────── */}
        <TabsContent value="organization">
          <div className="max-w-5xl mx-auto space-y-10">
            {/* Header */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-primary font-headline">
                Organization &amp; Institution Licenses
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Purchase seats for your team. Invited members join at no individual cost.
              </p>
            </div>

            {/* Term Selector */}
            <div className="flex flex-col items-center space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Select Term</p>
              <RadioGroup
                value={licenseTerm}
                onValueChange={(val) => {
                  setLicenseTerm(val as LicenseTerm);
                  setSelectedSeats(undefined);
                }}
                className="flex gap-4"
              >
                <div
                  className={`flex items-center gap-2 rounded-lg border px-5 py-3 cursor-pointer transition-colors ${
                    licenseTerm === 'semester'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                  onClick={() => {
                    setLicenseTerm('semester');
                    setSelectedSeats(undefined);
                  }}
                >
                  <RadioGroupItem value="semester" id="term-semester" />
                  <Label htmlFor="term-semester" className="cursor-pointer font-medium">
                    Semester (4 months)
                  </Label>
                </div>
                <div
                  className={`flex items-center gap-2 rounded-lg border px-5 py-3 cursor-pointer transition-colors ${
                    licenseTerm === 'annual'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                  onClick={() => {
                    setLicenseTerm('annual');
                    setSelectedSeats(undefined);
                  }}
                >
                  <RadioGroupItem value="annual" id="term-annual" />
                  <Label htmlFor="term-annual" className="cursor-pointer font-medium">
                    Annual
                  </Label>
                  <Badge variant="secondary" className="text-xs ml-1">
                    Best Value
                  </Badge>
                </div>
              </RadioGroup>
            </div>

            {/* Seat Tier Selector */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Select Seats</h3>
              <SeatTierSelector
                tiers={seatTiers}
                selectedTier={selectedSeats}
                onSelect={setSelectedSeats}
              />
            </div>

            {/* Selected Tier Summary */}
            {selectedTier && (
              <Card className="bg-card/80 backdrop-blur-sm border-accent/50 max-w-lg mx-auto">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="font-semibold flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> {selectedTier.seats}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Price per seat</span>
                    <span className="font-semibold">${selectedTier.pricePerSeat.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Total</span>
                    <span className="text-2xl font-extrabold text-foreground">
                      ${selectedTier.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {licenseTerm === 'semester' ? '4-month term' : '12-month term'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card className="bg-card/80 backdrop-blur-sm max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-lg">What&apos;s Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {LICENSE_PLAN.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center">
              <Button
                size="lg"
                disabled={!selectedSeats}
                onClick={handleLicensePurchase}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
              >
                Purchase License
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-center text-sm text-muted-foreground mt-12 max-w-lg mx-auto">
        Secure checkout powered by Stripe. Promo codes supported at checkout.
      </p>
      {/* Soft pointer for the most-confused prospect: "I have an invite
          code from my school — do I need to buy anything?" The answer
          lives on /onboarding (where the invite-code field is), not
          here. */}
      <p className="text-center text-xs text-muted-foreground mt-3 max-w-lg mx-auto">
        Already have an invite code from a school or organization?{' '}
        <a
          href="/onboarding"
          className="text-primary hover:underline"
        >
          You don&apos;t need to buy anything &mdash; redeem it here.
        </a>
      </p>
      {isCheckingOut && (
        <p className="text-center text-xs text-muted-foreground mt-2">
          Redirecting to secure checkout…
        </p>
      )}
    </div>
  );
}
