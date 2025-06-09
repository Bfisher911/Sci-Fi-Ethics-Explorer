
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { createOrganization } from '@/app/actions/organizations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building, PlusCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CreateOrganizationForm() {
  const { user, claims, refreshClaims, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [organizationName, setOrganizationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTeam, setHasTeam] = useState(false);

  useEffect(() => {
    if (!authLoading && user && claims?.teamId) {
      setHasTeam(true);
    } else if (!authLoading && user && !claims?.teamId) {
      setHasTeam(false);
    }
  }, [user, claims, authLoading]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (authLoading) {
        toast({ title: "Please wait", description: "Authentication still loading.", variant: "default" });
        return;
    }
    if (!user) {
      setError("You must be logged in to create an organization.");
      toast({ title: "Authentication Error", description: "Please log in.", variant: "destructive" });
      router.push('/login');
      return;
    }
    if (claims?.teamId) {
      setError("You are already part of an organization. Creating multiple organizations is not supported in this version.");
      toast({ title: "Organization Limit", description: "You already belong to an organization.", variant: "default" });
      return;
    }
    if (!organizationName.trim()) {
      setError("Organization name cannot be empty.");
      toast({ title: "Validation Error", description: "Organization name is required.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await createOrganization(user.uid, organizationName);

    if (result.success && result.orgId) {
      toast({
        title: 'Organization Created!',
        description: `"${organizationName}" has been successfully created. Refreshing your session...`,
      });
      // Force token refresh to get new custom claims
      await user.getIdToken(true); 
      await refreshClaims(user); // Call refreshClaims from useAuth context
      
      // Wait a bit for claims to propagate if needed, then redirect.
      // This timeout is a pragmatic approach for client-side claim refresh.
      // A more robust solution might involve a listener or server-sent event for claim updates.
      setTimeout(() => {
          // router.push(`/team/dashboard`); // Phase 2 target
          router.push('/profile'); // For now, redirect to profile to see updated claims indirectly
          setIsLoading(false);
      }, 2000);


    } else {
      setError(result.error || 'Failed to create organization.');
      toast({
        title: 'Error Creating Organization',
        description: result.error || 'An unknown error occurred.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading user data...</p>
        </div>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You need to be logged in to create an organization.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/login')} className="w-full">Login</Button>
        </CardFooter>
      </Card>
    )
  }
  
  if (hasTeam && claims?.teamId) {
     return (
      <Card className="w-full max-w-lg mx-auto shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <Building className="mr-2 h-6 w-6" /> Organization Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You are already a member of an organization (ID: {claims.teamId}).
            Currently, creating or joining multiple organizations is not supported.
          </p>
          {/* In Phase 2, this would link to the team dashboard */}
           <Button onClick={() => router.push('/profile')} className="w-full mt-4" variant="outline">
            Go to Your Profile
          </Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl bg-card/80 backdrop-blur-sm">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <Building className="mr-2 h-6 w-6" /> Create New Organization
          </CardTitle>
          <CardDescription>
            Start a new team to manage content and members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="e.g., Alpha Explorers Inc."
              required
              disabled={isLoading}
              className="bg-background/50"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Creation Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || authLoading || hasTeam}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Organization
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
