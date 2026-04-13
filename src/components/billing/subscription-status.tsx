'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CreditCard, Building2, Users, Calendar } from 'lucide-react';
import type { Subscription, License } from '@/types';
import Link from 'next/link';

interface SubscriptionStatusProps {
  subscription?: Subscription | null;
  license?: License | null;
  onCancelSubscription?: (subscriptionId: string) => Promise<void>;
}

/**
 * Card showing current subscription or license status.
 * Includes cancel functionality and links to license management.
 */
export function SubscriptionStatus({
  subscription,
  license,
  onCancelSubscription,
}: SubscriptionStatusProps) {
  const [canceling, setCanceling] = useState(false);

  const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trial':
        return 'secondary';
      case 'past_due':
        return 'destructive';
      case 'canceled':
      case 'expired':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  function formatDate(date: Date | any): string {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  async function handleCancel(): Promise<void> {
    if (!subscription || !onCancelSubscription) return;
    setCanceling(true);
    try {
      await onCancelSubscription(subscription.id);
    } finally {
      setCanceling(false);
    }
  }

  // No subscription or license
  if (!subscription && !license) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            No Active Plan
          </CardTitle>
          <CardDescription>
            You do not have an active subscription or license.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/pricing">View Plans</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // License display
  if (license) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization License
            </CardTitle>
            <Badge variant={statusVariant(license.status)}>
              {license.status}
            </Badge>
          </div>
          <CardDescription>{license.organizationName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Term</p>
              <p className="font-medium capitalize">{license.term}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Seats</p>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {license.usedSeats} / {license.totalSeats} used
                </span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">{formatDate(license.startDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">End Date</p>
              <p className="font-medium">{formatDate(license.endDate)}</p>
            </div>
          </div>
          <Separator />
          <Button variant="outline" asChild>
            <Link href="/billing">Manage License</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Subscription display
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {subscription!.planId.includes('instructor') ? 'Instructor' : 'Student'} Plan
          </CardTitle>
          <Badge variant={statusVariant(subscription!.status)}>
            {subscription!.status}
            {subscription!.cancelAtPeriodEnd && ' (canceling)'}
          </Badge>
        </div>
        <CardDescription>
          Billing: {subscription!.billingPeriod}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Current Period Start
            </p>
            <p className="font-medium">{formatDate(subscription!.currentPeriodStart)}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Renewal / Expiry
            </p>
            <p className="font-medium">{formatDate(subscription!.currentPeriodEnd)}</p>
          </div>
        </div>
        <Separator />
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/pricing">Change Plan</Link>
          </Button>
          {!subscription!.cancelAtPeriodEnd && onCancelSubscription && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={canceling}>
                  {canceling ? 'Canceling...' : 'Cancel Subscription'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your subscription will remain active until the end of the current billing
                    period ({formatDate(subscription!.currentPeriodEnd)}). After that, you will
                    lose access to premium features.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
