import { UserProfileCard } from '@/components/profile/user-profile-card';
import { Card, CardContent } from '@/components/ui/card';
import { auth } from '@/lib/firebase/config';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/app/actions/user';
import type { UserProfile } from '@/types';

export default async function ProfilePage() {
  // This is a server component, so we can't use useAuth hook directly.
  // For RSC, auth state needs to be handled differently, e.g. passed from layout or using a server-side helper.
  // Or, make UserProfileCard a client component that uses useAuth and fetches data.
  // For simplicity here, we'll assume `getUserProfile` can get the current user from server context if available,
  // or rely on the client component to pass UID after auth check.

  // The (app) layout already protects this route.
  // `auth.currentUser` is not reliable on the server in Next.js App Router.
  // We need a server-side way to get the user or make UserProfileCard fully client-side data fetching.
  // Let's make UserProfileCard handle its data fetching on the client.

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <h1 className="text-4xl font-bold mb-4 text-primary font-headline">Your Profile</h1>
          <p className="text-lg text-muted-foreground">
            Manage your account details, preferences, and track your ethical explorations.
          </p>
        </CardContent>
      </Card>
      <UserProfileCard />
    </div>
  );
}
