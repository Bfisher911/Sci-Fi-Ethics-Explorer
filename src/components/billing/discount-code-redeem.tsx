'use client';

/**
 * Reusable "Discount Code" redemption panel.
 *
 * Drop into signup, onboarding, billing, or any paywall. The user types
 * a code, hits Apply, and on success sees a confirmation message that
 * includes the exact expiration date and the explicit "you will not be
 * charged" assurance the platform owes them.
 *
 * Variants:
 *   - 'card'    — full Card with header (default; used on /onboarding)
 *   - 'inline'  — compact panel (used on /billing alongside other panels)
 *
 * The label is always "Discount Code" — never "Class Access Code" —
 * because the same panel powers pilots, beta, comped accounts, etc.
 */

import { useState, type FormEvent } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, Ticket, AlertCircle, Loader2 } from 'lucide-react';
import { redeemDiscountCode } from '@/app/actions/discount-codes';
import { useToast } from '@/hooks/use-toast';

export interface DiscountCodeRedeemProps {
  uid: string;
  email?: string | null;
  /** Visual variant. */
  variant?: 'card' | 'inline';
  /** Fired after a successful redemption — caller can navigate, refetch
   *  data, etc. The success message itself is already shown inline. */
  onRedeemed?: () => void;
}

interface SuccessState {
  message: string;
  expiresAt?: string;
}

export function DiscountCodeRedeem({
  uid,
  email,
  variant = 'card',
  onRedeemed,
}: DiscountCodeRedeemProps) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const { toast } = useToast();

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await redeemDiscountCode({
        uid,
        email: email ?? null,
        code: code.trim(),
      });
      if (result.success) {
        setSuccess({
          message: result.data.successMessage,
        });
        setCode('');
        toast({
          title: 'Discount code applied',
          description: 'Your access has been activated.',
        });
        onRedeemed?.();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  const body = (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="discount-code-input">Discount Code</Label>
          <div className="flex gap-2">
            <Input
              id="discount-code-input"
              autoComplete="off"
              placeholder="Enter your code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={submitting}
              aria-describedby="discount-code-helper"
            />
            <Button
              type="submit"
              disabled={!code.trim() || submitting}
              variant="secondary"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply'
              )}
            </Button>
          </div>
          <p
            id="discount-code-helper"
            className="text-xs text-muted-foreground"
          >
            Have a class, pilot, beta, or promotional code? Enter it here.
            You will not be asked for a credit card.
          </p>
        </div>
      </form>

      {success && (
        <Alert className="mt-4 border-primary/40 bg-primary/5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Code accepted</AlertTitle>
          <AlertDescription>{success.message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>We could not apply that code</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );

  if (variant === 'inline') {
    return <div className="space-y-2">{body}</div>;
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Ticket className="h-5 w-5 text-primary" />
          Have a discount code?
        </CardTitle>
        <CardDescription>
          Class access, pilot programs, beta testers, institutional trials,
          and promotional codes all redeem here.
        </CardDescription>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
