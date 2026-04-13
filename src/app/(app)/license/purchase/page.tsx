'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SeatTierSelector } from '@/components/billing/license-purchase';
import { getSeatTiers } from '@/config/plans';
import { createLicense } from '@/app/actions/licenses';
import { useAuth } from '@/hooks/use-auth';
import {
  Building2,
  Calendar,
  Users,
  ShoppingCart,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import type { LicenseTerm } from '@/types';

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { number: 1, label: 'Organization' },
  { number: 2, label: 'Term' },
  { number: 3, label: 'Seats' },
  { number: 4, label: 'Review' },
] as const;

/**
 * License purchase page with a guided step-by-step flow.
 */
export default function LicensePurchasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Initialize from URL params if present
  const initialTerm = (searchParams.get('term') as LicenseTerm) || 'semester';
  const initialSeats = searchParams.get('seats') ? Number(searchParams.get('seats')) : undefined;

  const [step, setStep] = useState<Step>(1);
  const [orgName, setOrgName] = useState('');
  const [term, setTerm] = useState<LicenseTerm>(initialTerm);
  const [selectedSeats, setSelectedSeats] = useState<number | undefined>(initialSeats);
  const [submitting, setSubmitting] = useState(false);
  const [licenseId, setLicenseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seatTiers = getSeatTiers(term);
  const selectedTier = seatTiers.find((t) => t.seats === selectedSeats);

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return orgName.trim().length >= 2;
      case 2:
        return true;
      case 3:
        return selectedSeats !== undefined;
      case 4:
        return true;
      default:
        return false;
    }
  }

  function handleNext(): void {
    if (step < 4) {
      setStep((step + 1) as Step);
    } else {
      handlePurchase();
    }
  }

  function handleBack(): void {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  }

  async function handlePurchase(): Promise<void> {
    if (!user || !selectedTier) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await createLicense({
        organizationName: orgName.trim(),
        purchaserId: user.uid,
        purchaserName: user.displayName || user.email || 'Unknown',
        totalSeats: selectedTier.seats,
        term,
        priceTotal: selectedTier.totalPrice,
      });

      if (result.success) {
        setLicenseId(result.data);
        setStep(5);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Success State ───────────────────────────────────────────────
  if (step === 5 && licenseId) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-lg">
        <Card className="bg-card/80 backdrop-blur-sm border-green-500/50">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 p-4">
                <CheckCircle2 className="h-12 w-12 text-green-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">License Purchased!</h2>
              <p className="text-muted-foreground">
                Your organization license has been created successfully.
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">License ID</span>
                <span className="font-mono text-xs">{licenseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organization</span>
                <span className="font-medium">{orgName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats</span>
                <span className="font-medium">{selectedSeats}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Term</span>
                <span className="font-medium capitalize">{term}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => router.push('/communities/create')}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Create a Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => router.push('/billing')}>
                Go to Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary font-headline">
          Purchase Organization License
        </h1>
        <p className="text-muted-foreground mt-2">
          Set up seat-based licensing for your team or institution.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s.number
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s.number ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  s.number
                )}
              </div>
              <span
                className={`text-xs mt-1.5 ${
                  step >= s.number ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-2 mt-[-1rem] ${
                  step > s.number ? 'bg-accent' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 space-y-6">
          {/* Step 1: Organization Name */}
          {step === 1 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <Building2 className="h-8 w-8 mx-auto text-accent" />
                <h2 className="text-xl font-semibold">Organization Name</h2>
                <p className="text-sm text-muted-foreground">
                  Enter the name of your organization, school, or institution.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  placeholder="e.g., Springfield University"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Term */}
          {step === 2 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <Calendar className="h-8 w-8 mx-auto text-accent" />
                <h2 className="text-xl font-semibold">Select Term</h2>
                <p className="text-sm text-muted-foreground">
                  Choose the duration for your license.
                </p>
              </div>
              <RadioGroup
                value={term}
                onValueChange={(val) => {
                  setTerm(val as LicenseTerm);
                  setSelectedSeats(undefined);
                }}
                className="space-y-3"
              >
                <div
                  className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors ${
                    term === 'semester'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                  onClick={() => {
                    setTerm('semester');
                    setSelectedSeats(undefined);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="semester" id="purchase-semester" />
                    <div>
                      <Label htmlFor="purchase-semester" className="cursor-pointer font-medium text-base">
                        Semester
                      </Label>
                      <p className="text-sm text-muted-foreground">4-month access period</p>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors ${
                    term === 'annual'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                  onClick={() => {
                    setTerm('annual');
                    setSelectedSeats(undefined);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="annual" id="purchase-annual" />
                    <div>
                      <Label htmlFor="purchase-annual" className="cursor-pointer font-medium text-base">
                        Annual
                      </Label>
                      <p className="text-sm text-muted-foreground">12-month access period</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">Best Value</Badge>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Seats */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Users className="h-8 w-8 mx-auto text-accent" />
                <h2 className="text-xl font-semibold">Select Seats</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a seat tier. Larger tiers include volume discounts.
                </p>
              </div>
              <SeatTierSelector
                tiers={seatTiers}
                selectedTier={selectedSeats}
                onSelect={setSelectedSeats}
              />
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && selectedTier && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <ShoppingCart className="h-8 w-8 mx-auto text-accent" />
                <h2 className="text-xl font-semibold">Review Order</h2>
                <p className="text-sm text-muted-foreground">
                  Confirm the details of your license purchase.
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Organization</span>
                  <span className="font-medium">{orgName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Term</span>
                  <span className="font-medium capitalize">
                    {term} ({term === 'semester' ? '4 months' : '12 months'})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="font-medium">{selectedTier.seats}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per seat</span>
                  <span className="font-medium">${selectedTier.pricePerSeat.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-extrabold">${selectedTier.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Payment processing coming soon. Plans are currently simulated.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || submitting}
              className={
                step === 4
                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                  : ''
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : step === 4 ? (
                <>
                  Complete Purchase
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
