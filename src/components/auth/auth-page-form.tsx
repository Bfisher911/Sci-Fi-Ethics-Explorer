
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { createUserProfile } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Mail, Lock, User as UserIcon, ChromeIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthPageFormProps {
  mode: 'login' | 'signup';
}

/**
 * An optional CTA rendered inside the error alert. Used to nudge the
 * user toward the recovery action that matches their failure mode
 * (e.g. "Log in instead" when a signup hits an already-registered
 * email, or "Reset your password" when a login fails on credentials).
 */
type ErrorAction =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'reset-password'; label: string };

export function AuthPageForm({ mode }: AuthPageFormProps) {
  const [name, setName] = useState(''); // For display name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Only for signup
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string>('Error');
  const [errorAction, setErrorAction] = useState<ErrorAction | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Prefill the email field when arriving from a contextual CTA, e.g.
  // signup → "Go to log in" passes ?email=... so the user doesn't have
  // to type it twice.
  useEffect(() => {
    const prefill = searchParams?.get('email');
    if (prefill && !email) setEmail(prefill);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /**
   * Where to send the user after a successful sign-in / sign-up.
   * Honors an explicit `?next=...` on the URL (set by deep links that
   * bounced the user through login), otherwise lands them on the
   * dashboard — the real logged-in home.
   *
   * Only relative paths are accepted so an attacker can't craft a
   * login link like `?next=https://evil.example.com` to phish users.
   */
  function postAuthDestination(): string {
    const raw = searchParams?.get('next');
    if (raw && raw.startsWith('/') && !raw.startsWith('//')) {
      return raw;
    }
    return '/dashboard';
  }

  /**
   * Centralized error setter so every auth failure path renders the
   * same friendlier alert UI (title + description + optional CTA)
   * instead of a raw Firebase string.
   */
  function showError(err: any) {
    const desc = describeAuthError(err);
    setErrorTitle(desc.title);
    setError(desc.description);
    setErrorAction(desc.action ?? null);
    toast({ title: desc.title, description: desc.description, variant: 'destructive' });
  }

  function clearError() {
    setError(null);
    setErrorTitle('Error');
    setErrorAction(null);
  }

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError({ code: 'auth/passwords-do-not-match' });
      return;
    }
    setIsLoading(true);
    clearError();
    setMessage(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });

      // Attempt to create Firestore profile document via server action
      // The Cloud Function (createUserDoc) will act as a backup.
      const profileResult = await createUserProfile(user.uid, user.email, name);
      if (!profileResult.success) {
        console.warn("Client-side profile creation attempt failed (Cloud Function is backup):", profileResult.error);
        // Don't show error to user for this client-side attempt as CF will handle it
      }

      toast({ title: "Account Created", description: "Welcome to Sci-Fi Ethics Explorer!" });
      router.push(postAuthDestination());
    } catch (err: any) {
      showError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    setMessage(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push(postAuthDestination());
    } catch (err: any) {
      showError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      showError({ code: 'auth/missing-email-for-reset' });
      return;
    }
    setIsLoading(true);
    clearError();
    setMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(`Password reset email sent to ${email}. Check your inbox (and spam folder).`);
      toast({ title: "Password Reset", description: "Email sent. Check your inbox." });
    } catch (err: any) {
      showError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle a returning Google redirect flow (used when popup was blocked).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result || cancelled) return;
        const user = result.user;
        const profileResult = await createUserProfile(user.uid, user.email, user.displayName);
        if (!profileResult.success) {
          console.warn('Google redirect: profile creation fallback:', profileResult.error);
        }
        toast({ title: 'Signed in with Google', description: 'Welcome!' });
        router.push(postAuthDestination());
      } catch (err: any) {
        console.error('Google redirect sign-in error:', err);
        // Route through the centralized describeAuthError so the user
        // gets the same friendly title/description/CTA treatment as the
        // popup path.
        showError(err);
      }
    })();
    return () => { cancelled = true; };
  }, [router, toast]);

  /**
   * Map a raw Firebase Auth error code to a clear, actionable message
   * for the end user. The defaults Firebase ships with (e.g. "Firebase:
   * Error (auth/unauthorized-domain)") tell admins what's wrong but
   * leave end users staring at a stack-trace string.
   *
   * When the failure has an obvious recovery path (already-registered
   * email → log in instead, wrong password → reset password), include
   * an `action` so the alert can render a contextual CTA.
   */
  function describeAuthError(err: any): {
    title: string;
    description: string;
    action?: ErrorAction;
  } {
    const code: string = err?.code ?? '';
    const host =
      typeof window !== 'undefined' ? window.location.host : '(this domain)';
    switch (code) {
      // ── Email / password sign-up & sign-in failures ───────────────
      case 'auth/email-already-in-use':
        return {
          title: 'That email is already registered',
          description:
            `An account for ${email || 'that address'} already exists. ` +
            'Log in instead — once you sign in, any seat that was assigned to this email ' +
            'will be linked to your profile automatically.',
          action: {
            kind: 'link',
            label: 'Go to log in',
            href: `/login?email=${encodeURIComponent(email)}`,
          },
        };
      case 'auth/invalid-email':
        return {
          title: 'That email address looks invalid',
          description: 'Check for typos and try again.',
        };
      case 'auth/weak-password':
        return {
          title: 'Password is too weak',
          description:
            'Firebase requires at least 6 characters. Pick a longer password and try again.',
        };
      case 'auth/passwords-do-not-match':
        return {
          title: 'Passwords don\u2019t match',
          description:
            'The password and confirmation fields are different. Re-enter both to make sure they match.',
        };
      case 'auth/missing-email-for-reset':
        return {
          title: 'Enter your email first',
          description:
            'Type the email address you signed up with into the Email field, then click "Forgot Password?" again.',
        };
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return {
          title: 'Incorrect email or password',
          description:
            'Double-check the email and password you entered. If you originally signed up with Google, use "Continue with Google" instead.',
          action: { kind: 'reset-password', label: 'Reset your password' },
        };
      case 'auth/user-not-found':
        return {
          title: 'No account for that email',
          description:
            `We couldn\u2019t find an account for ${email || 'that address'}. ` +
            'Sign up to create one, or use "Continue with Google" if you used Google to sign in originally.',
          action: {
            kind: 'link',
            label: 'Create an account',
            href: `/signup?email=${encodeURIComponent(email)}`,
          },
        };
      case 'auth/too-many-requests':
        return {
          title: 'Too many failed attempts',
          description:
            'Firebase has temporarily blocked sign-ins from this device after repeated failures. ' +
            'Reset your password or wait a few minutes before trying again.',
          action: { kind: 'reset-password', label: 'Reset your password' },
        };
      case 'auth/user-disabled':
        return {
          title: 'Account disabled',
          description:
            'This account has been disabled by an administrator. Contact support if you think this is a mistake.',
        };
      // ── Google / provider configuration failures ──────────────────
      case 'auth/unauthorized-domain':
        return {
          title: 'Domain not authorized for Google sign-in',
          description:
            `This Firebase project doesn't have "${host}" in its Authorized Domains list. ` +
            `Open Firebase Console → Authentication → Settings → Authorized domains and add "${host}", ` +
            'then try again.',
        };
      case 'auth/operation-not-allowed':
        return {
          title: 'Google sign-in is not enabled',
          description:
            'The Google provider is disabled on this Firebase project. ' +
            'Open Firebase Console → Authentication → Sign-in method → Google and enable it, then try again.',
        };
      case 'auth/account-exists-with-different-credential':
        return {
          title: 'That email is registered with a different sign-in method',
          description:
            'This email was originally registered with email/password (or another provider). ' +
            'Sign in using the original method, then link Google from your profile if you want both.',
          action: {
            kind: 'link',
            label: 'Go to log in',
            href: `/login?email=${encodeURIComponent(email)}`,
          },
        };
      case 'auth/configuration-not-found':
        return {
          title: 'Auth provider not configured',
          description:
            'Firebase reports that no Google sign-in configuration was found for this project. ' +
            'Confirm Authentication is initialized in the Firebase console and that the Google provider is enabled.',
        };
      case 'auth/popup-blocked':
        return {
          title: 'Pop-up blocked',
          description:
            'Your browser blocked the Google sign-in popup. Switching to full-page redirect now…',
        };
      case 'auth/popup-closed-by-user':
        return {
          title: 'Sign-in cancelled',
          description: 'You closed the Google sign-in window before finishing.',
        };
      case 'auth/network-request-failed':
        return {
          title: 'Network error',
          description:
            'The browser could not reach Firebase. Check your connection and try again.',
        };
      case 'auth/internal-error':
        return {
          title: 'Firebase internal error',
          description:
            err?.message ||
            'Something went wrong on the Firebase side. Try again in a moment.',
        };
      default:
        return {
          title: 'Sign-in error',
          description:
            (code ? `[${code}] ` : '') +
            (err?.message || 'Sign-in failed. Please try again.'),
        };
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    // Quick pre-flight: if the deployed authDomain doesn't match the
    // Firebase project's authDomain, the popup will reliably reject with
    // auth/unauthorized-domain. Warn loud + early so the developer knows.
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      const isLocal = host.startsWith('localhost') || host.startsWith('127.');
      const fbAuthDomain =
        (auth as any)?.app?.options?.authDomain ?? '';
      if (!isLocal && fbAuthDomain && !host.endsWith(fbAuthDomain) &&
          host !== fbAuthDomain) {
        // This is OK *if* the host has been added to Firebase's
        // authorized-domains list. We still proceed — Firebase will
        // confirm/deny — but log a hint for the developer.
        console.info(
          '[GoogleSignIn] Host',
          host,
          'differs from Firebase authDomain',
          fbAuthDomain,
          '— ensure this host is added to Authentication → Settings → Authorized domains.'
        );
      }
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      const user = result.user;

      const profileResult = await createUserProfile(user.uid, user.email, user.displayName);
      if (!profileResult.success) {
        console.error('Google Sign-In: profile creation failed:', profileResult.error);
        toast({
          title: 'Signed in, but profile not saved',
          description:
            (profileResult.error || 'Unknown Firestore error') +
            ' — Auth worked but the users/{uid} document did not get created. Check Firestore rules.',
          variant: 'destructive',
          duration: 9000,
        });
      } else {
        toast({ title: 'Signed in with Google', description: 'Welcome!' });
      }
      router.push(postAuthDestination());
    } catch (err: any) {
      console.error('[GoogleSignIn] popup failed:', err);
      // Common failure modes that warrant a redirect-mode retry: the
      // browser blocked the popup, the user closed it, or the in-app
      // webview doesn't support popups.
      const code = err?.code ?? '';
      const shouldRedirect =
        code === 'auth/popup-blocked' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        code === 'auth/web-storage-unsupported';

      if (shouldRedirect) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: any) {
          console.error('[GoogleSignIn] redirect failed:', redirectErr);
          showError(redirectErr);
        }
      } else {
        showError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };


  const isLoginPage = mode === 'login';

  return (
    <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">
          {isLoginPage ? 'Welcome Back, Explorer!' : 'Join the Exploration'}
        </CardTitle>
        <CardDescription>
          {isLoginPage ? 'Log in to continue your journey.' : 'Create an account to begin.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={isLoginPage ? handleLogin : handleSignUp} className="space-y-4">
          {!isLoginPage && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required className="pl-10" />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
            </div>
          </div>
          {!isLoginPage && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10" />
              </div>
            </div>
          )}
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? (isLoginPage ? 'Logging In...' : 'Creating Account...') : (isLoginPage ? 'Login' : 'Sign Up')}
          </Button>
        </form>

        {isLoginPage && (
          <Button variant="link" onClick={handlePasswordReset} className="mt-2 w-full text-sm text-muted-foreground" disabled={isLoading}>
            Forgot Password?
          </Button>
        )}

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-muted-foreground/50"></div>
          <span className="mx-4 flex-shrink text-xs text-muted-foreground">OR</span>
          <div className="flex-grow border-t border-muted-foreground/50"></div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
          <ChromeIcon className="mr-2 h-4 w-4" />
          {isLoading ? 'Processing...' : 'Continue with Google'}
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{errorTitle}</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
              {errorAction?.kind === 'link' && (
                <Link
                  href={errorAction.href}
                  className="mt-2 inline-block font-semibold underline underline-offset-4"
                >
                  {errorAction.label} &rarr;
                </Link>
              )}
              {errorAction?.kind === 'reset-password' && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={isLoading}
                  className="mt-2 inline-block font-semibold underline underline-offset-4 disabled:opacity-50"
                >
                  {errorAction.label} &rarr;
                </button>
              )}
            </AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert variant="default" className="mt-4 bg-secondary text-secondary-foreground">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center text-sm">
        {isLoginPage ? (
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log In
            </Link>
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
