
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { createUserProfile } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Mail, Lock, User, ChromeIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AuthForms() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  // Single-tier platform: every signup creates a "member" account.
  const selectedRole = 'member' as const;
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const profileResult = await createUserProfile(user.uid, user.email, displayName || user.displayName, undefined, undefined, user.photoURL || '', selectedRole);
      if (!profileResult.success) {
        // If profile creation failed, we should probably inform the user or retry.
        // For now, we'll log the error and still proceed to redirect,
        // as the auth user IS created. Profile can be completed later.
        console.error("Sign up: Auth user created, but profile creation failed:", profileResult.error);
        setError(`Account created, but profile setup failed: ${profileResult.error}. You can complete your profile later.`);
        toast({ title: "Account Created with Issues", description: `Authentication successful, but profile setup encountered an error: ${profileResult.error}. Please try updating your profile.`, variant: "destructive", duration: 7000 });
      } else {
        toast({ title: "Account Created", description: "Welcome to Sci-Fi Ethics Explorer!" });
      }
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Sign Up Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/stories');
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
      return;
    }
    setError(null);
    setMessage(null);
    setIsLoading(true);
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
  
  const handleGoogleSignIn = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        const profileResult = await createUserProfile(user.uid, user.email, user.displayName, user.photoURL || '');
        if (!profileResult.success) {
            console.error("Google Sign-In: New user, but profile creation failed:", profileResult.error);
            setError(`Signed in, but profile setup failed: ${profileResult.error}. You can complete your profile later.`);
            toast({ title: "Signed In with Issues", description: `Authentication successful, but profile setup encountered an error: ${profileResult.error}. Please try updating your profile.`, variant: "destructive", duration: 7000 });
        } else {
            toast({ title: "Signed in with Google", description: "Welcome!" });
        }
      } else {
        toast({ title: "Signed in with Google", description: "Welcome back!" });
      }
      router.push('/stories');
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Google Sign-In Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Sci-Fi Ethics Explorer</CardTitle>
          <CardDescription>Explore the moral quandaries of tomorrow, today.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                  {isLoading ? 'Logging In...' : 'Login'}
                </Button>
              </form>
              <Button variant="link" onClick={handlePasswordReset} className="mt-2 w-full text-sm text-muted-foreground" disabled={isLoading}>
                Forgot Password?
              </Button>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name (Optional)</Label>
                   <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-name" type="text" placeholder="Your Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-muted-foreground/50"></div>
            <span className="mx-4 flex-shrink text-xs text-muted-foreground">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-muted-foreground/50"></div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
            <ChromeIcon className="mr-2 h-4 w-4" />
            {isLoading ? 'Processing...' : 'Sign in with Google'}
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
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
