'use client';

/**
 * Email preferences card.
 *
 * For now, exposes a single toggle: opt in/out of the weekly digest.
 * Persists to `users.{uid}.emailDigestOptIn`.
 *
 * The "Send a sample to me" button hits `/api/cron/digest?preview=1`
 * with the user's UID, which returns the digest HTML rendered as the
 * page response — useful for verifying what you'd receive without
 * waiting for the next cron run.
 */

import { useEffect, useState } from 'react';
import { Mail, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUserProfile } from '@/app/actions/user';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function EmailPreferencesCard(): JSX.Element {
  const { user } = useAuth();
  const { toast } = useToast();
  const [optedIn, setOptedIn] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getUserProfile(user.uid).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        // The flag isn't on the typed UserProfile yet — read defensively.
        const raw = (res.data as unknown as { emailDigestOptIn?: boolean })
          .emailDigestOptIn;
        setOptedIn(raw === true);
      } else {
        setOptedIn(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleToggle(next: boolean) {
    if (!user) return;
    setSaving(true);
    setOptedIn(next); // optimistic
    try {
      const res = await updateUserProfile(user.uid, {
        // Cast through unknown — the field isn't yet on UserProfile.
        // Storing it is safe; reads guard with the same defensive cast.
        ...({ emailDigestOptIn: next } as unknown as Partial<
          import('@/types').UserProfile
        >),
      });
      if (!res.success) throw new Error(res.error);
      toast({
        title: next ? 'Subscribed to weekly digest' : 'Unsubscribed',
        description: next
          ? "You'll get a weekly recap on Monday mornings."
          : 'No more digests until you flip this back on.',
      });
    } catch (err) {
      setOptedIn(!next); // revert
      toast({
        variant: 'destructive',
        title: 'Could not save preference',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  }

  function openSample() {
    if (!user) return;
    const url = `/api/cron/digest?preview=1&userId=${encodeURIComponent(user.uid)}`;
    window.open(url, '_blank', 'noopener');
  }

  if (!user) {
    return (
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email preferences
          </CardTitle>
          <CardDescription>Sign in to manage email preferences.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Email preferences
        </CardTitle>
        <CardDescription>
          Control which emails the platform sends you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-start gap-4">
          {optedIn === null ? (
            <Skeleton className="h-6 w-11 rounded-full" />
          ) : (
            <Switch
              id="email-digest-opt-in"
              checked={optedIn}
              disabled={saving}
              onCheckedChange={handleToggle}
            />
          )}
          <div className="flex-1">
            <Label
              htmlFor="email-digest-opt-in"
              className="cursor-pointer text-base font-medium"
            >
              Weekly digest
            </Label>
            <p className="text-sm text-muted-foreground">
              A short recap every Monday: your streak, chapters earned this
              week, the latest Dilemma of the Day, and the most active debates.
              No marketing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-background/40 p-3">
          <div className="flex-1 text-xs text-muted-foreground">
            Curious what it looks like? Open a personalized sample in a new tab
            without sending anything.
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openSample}
            disabled={!user}
          >
            {saving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-3.5 w-3.5" />
            )}
            Preview my digest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
