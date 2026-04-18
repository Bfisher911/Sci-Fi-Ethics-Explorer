'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Users, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { getLicense } from '@/app/actions/licenses';
import type { License } from '@/types';

function formatDate(d: any): string {
  if (!d) return '—';
  const date = d instanceof Date ? d : d.seconds ? new Date(d.seconds * 1000) : new Date(d);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Visible-on-profile summary of the user's seat license. Renders only
 * when an `activeLicenseId` is set on the profile, so unpaid users
 * never see this card. The big "Manage seats" button is the user's
 * shortcut into the seat-assignment UI at /billing.
 */
export function LicenseStatusCard() {
  const { user } = useAuth();
  const { activeLicenseId, subscriptionStatus, loading: subLoading } =
    useSubscription();
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subLoading) return;
    if (!activeLicenseId) {
      setLicense(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    getLicense(activeLicenseId).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) setLicense(res.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeLicenseId, subLoading]);

  if (subLoading || loading) return <Skeleton className="h-40 w-full mb-6" />;
  if (!activeLicenseId || !license) return null;

  const usedPct =
    !license.unmetered && license.totalSeats > 0
      ? Math.round((license.usedSeats / license.totalSeats) * 100)
      : 0;

  return (
    <Card className="mb-6 bg-card/80 backdrop-blur-sm border-2 border-primary/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Active Seat License
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className="bg-primary/20 text-primary border-primary/40"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {subscriptionStatus === 'active' ? 'Active' : subscriptionStatus}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {license.term}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            {license.organizationName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Expires {formatDate(license.endDate)}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Seats used
            </span>
            <span className="font-mono">
              {license.unmetered
                ? `${license.usedSeats} \u00b7 unlimited`
                : `${license.usedSeats} / ${license.totalSeats} (${usedPct}%)`}
            </span>
          </div>
          {!license.unmetered && (
            <Progress value={usedPct} className="h-2" />
          )}
          {license.unmetered && (
            <p className="text-[11px] text-muted-foreground italic">
              Platform owner license &mdash; no seat cap.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/billing">
              <Users className="h-4 w-4 mr-2" />
              Manage seats
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/communities/create">
              Create a community
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
