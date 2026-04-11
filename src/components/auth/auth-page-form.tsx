
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config'; // db import might not be needed here if using server actions
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

export function AuthPageForm({ mode }: AuthPageFormProps) {
  const [name, setName] = useState(''); // For display name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Only for signup
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast({ title: "Sign Up Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
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
      router.push('/stories'); // Or redirect to profile or a welcome page
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Sign Up Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/stories'); // Or previous page
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Login Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address to reset password.");
      toast({ title: "Password Reset Error", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
      toast({ title: "Password Reset", description: "Email sent. Check your inbox." });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Password Reset Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In (optional, but good to keep if already styled)
   const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Client-side attempt to create profile. Cloud Function is backup.
      const profileResult = await createUserProfile(user.uid, user.email, user.displayName);
       if (!profileResult.success) {
        console.warn("Google Sign-In: Client-side profile creation attempt failed (Cloud Function is backup):", profileResult.error);
      }

      toast({ title: "Signed in with Google", description: "Welcome!" });
      router.push('/stories');
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Google Sign-In Error", description: err.message, variant: "destructive" });
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
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
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
