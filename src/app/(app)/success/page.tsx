'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, FlaskConical, MessageSquare, Scale, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { reconcileCheckoutSession } from '@/app/actions/stripe';

type ScanState = 'scanning' | 'granted' | 'pending';

/**
 * Post-checkout "Neural Link Established" landing page.
 * Shows a brief scanning animation that resolves into a green checkmark
 * once the user's subscription is detected, then surfaces three entry
 * points into premium tools.
 */
export default function SuccessPage(): JSX.Element {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const { user } = useAuth();
  const { isPaid, loading } = useSubscription();
  const [scan, setScan] = useState<ScanState>('scanning');

  useEffect(() => {
    // Kick off best-effort reconciliation: webhook should have already
    // promoted the user, but when webhooks lag or local dev skips them
    // this lets the success page still flip the subscription on.
    if (sessionId && user?.uid) {
      reconcileCheckoutSession(sessionId, user.uid).catch(() => undefined);
    }
  }, [sessionId, user?.uid]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      setScan(isPaid ? 'granted' : 'pending');
    }, 1200);
    return () => clearTimeout(timer);
  }, [loading, isPaid]);

  return (
    <div className="container mx-auto py-16 px-4 flex flex-col items-center text-center">
      <div className="relative mb-8 h-32 w-32 flex items-center justify-center">
        {/* Scanning ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
            scan === 'scanning'
              ? 'border-primary/70 animate-ping'
              : scan === 'granted'
              ? 'border-green-400/70'
              : 'border-yellow-400/70'
          }`}
        />
        <div
          className={`absolute inset-2 rounded-full border transition-colors duration-500 ${
            scan === 'granted'
              ? 'border-green-400'
              : scan === 'pending'
              ? 'border-yellow-400'
              : 'border-primary'
          }`}
        />
        <div
          className={`absolute inset-6 rounded-full blur-2xl transition-colors duration-700 ${
            scan === 'granted'
              ? 'bg-green-400/40'
              : scan === 'pending'
              ? 'bg-yellow-400/30'
              : 'bg-primary/30'
          }`}
        />
        {scan === 'scanning' && (
          <Loader2 className="h-12 w-12 text-primary animate-spin relative" />
        )}
        {scan === 'granted' && (
          <CheckCircle2 className="h-16 w-16 text-green-400 relative animate-in zoom-in-50 duration-300" />
        )}
        {scan === 'pending' && (
          <CheckCircle2 className="h-16 w-16 text-yellow-400 relative" />
        )}
      </div>

      <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-3 tracking-tight">
        {scan === 'granted' ? 'Full Access Granted.' : 'Neural Link Establishing…'}
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl mb-2">
        {scan === 'granted'
          ? 'The moral maze of the future is now fully open to you, Explorer.'
          : scan === 'pending'
          ? 'Payment confirmed. Your subscription is syncing — this usually takes only a few seconds.'
          : 'Verifying authorization signal…'}
      </p>
      {sessionId && (
        <p className="text-[11px] text-muted-foreground/60 font-mono mb-8">
          Session {sessionId.slice(0, 18)}…
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-4">
        <EntryTile
          href="/analyzer"
          icon={<FlaskConical className="h-6 w-6" />}
          title="Analyze a Scenario"
          body="Run deep ethical analysis on any dilemma."
        />
        <EntryTile
          href="/ai-counselor"
          icon={<MessageSquare className="h-6 w-6" />}
          title="Consult the AI"
          body="Talk through a decision with the AI Counselor."
        />
        <EntryTile
          href="/debate-arena"
          icon={<Scale className="h-6 w-6" />}
          title="Join the Debate"
          body="Pick a side, post your argument, vote."
        />
      </div>

      <div className="mt-10 flex gap-3">
        <Button asChild variant="outline">
          <Link href="/billing">Manage subscription</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/stories">Continue exploring</Link>
        </Button>
      </div>
    </div>
  );
}

function EntryTile({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}): JSX.Element {
  return (
    <Link href={href} className="block group">
      <Card className="h-full bg-card/80 backdrop-blur-sm border-primary/20 transition-all duration-200 group-hover:border-primary/70 group-hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.6)]">
        <CardContent className="p-5 text-left space-y-2">
          <div className="flex items-center gap-2 text-primary">
            {icon}
            <span className="font-semibold">{title}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
