'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/config';
import { updateUserProfile } from '@/app/actions/user';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Loader2 } from 'lucide-react';

/**
 * Privacy settings card on the profile page. Currently exposes a single control:
 * whether the user appears on public leaderboards or is anonymized.
 *
 * The field stored on the user document is `anonymousOnLeaderboard`. The UI
 * label is inverted ("Show me on public leaderboards") so the toggle reads as
 * an affirmative privacy preference.
 */
export function PrivacySettingsCard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // "visible" = user wants to be shown on public leaderboards (default true).
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        const data = snapshot.data();
        // Default to visible (true) if the field is unset.
        setVisible(data?.anonymousOnLeaderboard !== true);
        setIsLoading(false);
      },
      (error) => {
        console.error('PrivacySettingsCard: snapshot error:', error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user, authLoading]);

  const handleToggle = async (checked: boolean) => {
    if (!user) return;
    // Optimistic update so the switch feels responsive.
    const previous = visible;
    setVisible(checked);
    setIsSaving(true);
    try {
      const result = await updateUserProfile(user.uid, {
        anonymousOnLeaderboard: !checked,
      });
      if (!result.success) {
        setVisible(previous);
        toast({
          title: 'Could not update privacy setting',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Privacy preference saved',
        description: checked
          ? 'You will appear on public leaderboards.'
          : 'You are now hidden on public leaderboards.',
      });
    } catch (error) {
      setVisible(previous);
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Could not update privacy setting',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Card className="max-w-2xl mx-auto mt-8 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lock className="h-5 w-5" /> Privacy
          </CardTitle>
          <CardDescription>Control how your profile appears to others.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!user) return null;

  return (
    <Card className="max-w-2xl mx-auto mt-8 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Lock className="h-5 w-5" /> Privacy
        </CardTitle>
        <CardDescription>Control how your profile appears to others.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
          <div className="space-y-1">
            <Label
              htmlFor="leaderboard-visibility"
              className="text-base font-medium"
            >
              Show me on public leaderboards
            </Label>
            <p className="text-sm text-muted-foreground">
              When off, your name and avatar are hidden on public leaderboards.
              Your rank and score still count.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Switch
              id="leaderboard-visibility"
              checked={visible}
              onCheckedChange={handleToggle}
              disabled={isSaving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
