
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/types';
import { getUserProfile, updateUserProfile } from '@/app/actions/user'; // Server Actions
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Library, Tv, Save, Loader2, Edit3, BarChartHorizontalBig, BookOpenCheck, MessageSquarePlus, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const genres = ["Cyberpunk", "Space Opera", "Post-Apocalyptic", "Biopunk", "Time Travel", "Utopian/Dystopian", "Military Sci-Fi", "Philosophical Sci-Fi"];

export function UserProfileCard() {
  const { user:authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editFavoriteGenre, setEditFavoriteGenre] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);


  useEffect(() => {
    const fetchProfile = async () => {
      if (authUser) {
        setIsLoadingProfile(true);
        setProfileError(null);
        try {
          const userProfileData = await getUserProfile(authUser.uid);
          setProfile(userProfileData);
          // Initialize edit fields from profile data or authUser fallbacks
          setEditDisplayName(userProfileData?.displayName || authUser.displayName || authUser.email?.split('@')[0] || 'Anonymous Explorer');
          setEditFavoriteGenre(userProfileData?.favoriteGenre || '');
          setEditAvatarUrl(userProfileData?.avatarUrl || authUser.photoURL || '');

        } catch (error: any) {
          console.error("Failed to fetch profile:", error);
          setProfileError(error.message || "Could not load your profile.");
          toast({ title: "Error Loading Profile", description: error.message || "Could not load your profile.", variant: "destructive" });
           // Initialize edit fields from authUser as a fallback if profile fetch fails but authUser exists
          setEditDisplayName(authUser.displayName || authUser.email?.split('@')[0] || 'Anonymous Explorer');
          setEditFavoriteGenre('');
          setEditAvatarUrl(authUser.photoURL || '');
        } finally {
          setIsLoadingProfile(false);
        }
      } else if (!authLoading) {
          setIsLoadingProfile(false); // Not logged in, not loading
          setProfile(null); // Clear profile if user logs out
      }
    };
    fetchProfile();
  }, [authUser, authLoading, toast]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    setIsUpdating(true);
    try {
      const updatedData: Partial<UserProfile> = {
        // uid is implicitly authUser.uid in the action
        displayName: editDisplayName,
        favoriteGenre: editFavoriteGenre,
        avatarUrl: editAvatarUrl,
      };
      await updateUserProfile(authUser.uid, updatedData);
      // Optimistically update local profile state or re-fetch
      setProfile(prev => ({
        ...(prev || { // Base structure if prev was null
            uid: authUser.uid,
            email: authUser.email,
            storiesCompleted: 0,
            dilemmasAnalyzed: 0,
            communitySubmissions: 0,
        }),
        ...updatedData,
        displayName: editDisplayName, // ensure direct state update
        favoriteGenre: editFavoriteGenre,
        avatarUrl: editAvatarUrl,
        lastUpdated: new Date(), // Optimistic update for UI
      } as UserProfile));
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      // Dialog will close itself via DialogClose if used within form submission
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast({ title: "Error Updating Profile", description: error.message || "Could not update your profile.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (authLoading || isLoadingProfile) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl bg-card/70 backdrop-blur-sm">
        <CardHeader className="items-center text-center">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  if (!authUser) {
    return (
        <Card className="max-w-2xl mx-auto shadow-xl bg-card/70 backdrop-blur-sm p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Please log in to view or edit your profile.</p>
        </Card>
    );
  }
  
  // authUser exists, but profile might be null (if fetch failed or document doesn't exist)
  const displayProfile = profile || {
    uid: authUser.uid,
    email: authUser.email,
    displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Anonymous Explorer',
    avatarUrl: authUser.photoURL || '',
    favoriteGenre: '',
    storiesCompleted: 0,
    dilemmasAnalyzed: 0,
    communitySubmissions: 0,
    createdAt: undefined, // Will be undefined if profile is null
    lastUpdated: undefined,
  };


  const engagementStats = [
    { label: "Dilemmas Explored", value: displayProfile.storiesCompleted || 0, icon: BookOpenCheck },
    { label: "Scenarios Analyzed", value: displayProfile.dilemmasAnalyzed || 0, icon: BarChartHorizontalBig },
    { label: "Community Submissions", value: displayProfile.communitySubmissions || 0, icon: MessageSquarePlus },
  ];

  const lastUpdatedText = displayProfile.lastUpdated 
    ? new Date(displayProfile.lastUpdated).toLocaleDateString() 
    : (profile ? 'Not available' : 'Profile not yet saved');
  const createdAtText = displayProfile.createdAt
    ? new Date(displayProfile.createdAt).toLocaleDateString()
    : 'N/A';


  return (
    <>
    {profileError && !profile && (
        <Alert variant="warning" className="mb-6 max-w-2xl mx-auto bg-card/80 backdrop-blur-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Profile Data Missing</AlertTitle>
          <AlertDescription>
            We couldn't load your saved profile data from the database. This might be because it wasn't created correctly during sign-up.
            You can try to save your profile information by using the "Edit Profile" button.
            Error details: {profileError}
          </AlertDescription>
        </Alert>
      )}
      {!profileError && !profile && authUser && (
        <Alert variant="info" className="mb-6 max-w-2xl mx-auto bg-card/80 backdrop-blur-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Profile Not Found</AlertTitle>
          <AlertDescription>
            It seems your profile hasn't been saved to our database yet. 
            Please use the "Edit Profile" button to create and save your details.
          </AlertDescription>
        </Alert>
      )}

    <Card className="max-w-2xl mx-auto shadow-xl bg-card/70 backdrop-blur-sm">
      <CardHeader className="items-center text-center relative pb-4">
        <Avatar className="h-24 w-24 mb-4 border-4 border-primary shadow-lg">
          <AvatarImage src={editAvatarUrl || displayProfile.avatarUrl || undefined} alt={displayProfile.displayName || 'User'} data-ai-hint="profile avatar" />
          <AvatarFallback className="text-3xl bg-muted text-muted-foreground">
            {displayProfile.displayName ? displayProfile.displayName.charAt(0).toUpperCase() : <User />}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-3xl font-bold text-primary">{displayProfile.displayName || 'Anonymous Explorer'}</CardTitle>
        <CardDescription className="text-md text-muted-foreground flex items-center"><Mail className="mr-2 h-4 w-4"/>{displayProfile.email}</CardDescription>
         <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="absolute top-4 right-4 text-primary hover:text-accent border-primary hover:border-accent">
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-card border-border shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-primary">Edit Your Profile</DialogTitle>
                    <DialogDescription>
                        Update your display name, favorite genre, and avatar. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-muted-foreground">Display Name</Label>
                        <Input id="displayName" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} className="bg-input" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="favoriteGenre" className="text-muted-foreground">Favorite Sci-Fi Genre</Label>
                        <select 
                            id="favoriteGenre" 
                            value={editFavoriteGenre} 
                            onChange={(e) => setEditFavoriteGenre(e.target.value)} 
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Select Genre</option>
                            {genres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="avatarUrl" className="text-muted-foreground">Avatar URL</Label>
                        <Input id="avatarUrl" type="url" value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} className="bg-input" placeholder="https://example.com/avatar.png" />
                    </div>
                    <DialogFooter className="pt-4">
                      <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                      <Button type="submit" disabled={isUpdating} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                      </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div>
            <h3 className="text-xl font-semibold text-accent mb-3 flex items-center">
                <Library className="mr-2 h-5 w-5"/>
                Favorite Sci-Fi Genre
            </h3>
            <div className="p-4 bg-muted/60 rounded-lg shadow-inner">
                <p className="text-xl font-bold text-primary text-center">
                    {displayProfile.favoriteGenre || <span className="italic text-muted-foreground text-lg font-medium">Not yet specified</span>}
                </p>
            </div>
        </div>
        
        <div>
            <h3 className="text-xl font-semibold text-accent mb-4 flex items-center">
                <Tv className="mr-2 h-5 w-5"/>
                Engagement Dashboard
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {engagementStats.map(stat => (
                    <div key={stat.label} className="p-4 bg-muted/60 rounded-lg text-center shadow-inner">
                        <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary"/>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 mt-6 flex flex-col sm:flex-row justify-between text-xs text-muted-foreground italic">
         <p>Joined: {createdAtText}</p>
         <p>Last updated: {lastUpdatedText}</p>
      </CardFooter>
    </Card>
    </>
  );
}
