
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
import { User, Mail, Library, Tv, Save, Loader2, Edit3, BarChartHorizontalBig, BookOpenCheck, MessageSquarePlus } from 'lucide-react';
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

const genres = ["Cyberpunk", "Space Opera", "Post-Apocalyptic", "Biopunk", "Time Travel", "Utopian/Dystopian", "Military Sci-Fi", "Philosophical Sci-Fi"];

export function UserProfileCard() {
  const { user:authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editFavoriteGenre, setEditFavoriteGenre] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);


  useEffect(() => {
    if (authUser) {
      const fetchProfile = async () => {
        setIsLoadingProfile(true);
        try {
          const userProfileData = await getUserProfile(authUser.uid);
          if (userProfileData) {
            setProfile(userProfileData);
            setEditDisplayName(userProfileData.displayName || '');
            setEditFavoriteGenre(userProfileData.favoriteGenre || '');
            setEditAvatarUrl(userProfileData.avatarUrl || '');
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          toast({ title: "Error", description: "Could not load your profile.", variant: "destructive" });
        } finally {
          setIsLoadingProfile(false);
        }
      };
      fetchProfile();
    } else if (!authLoading) {
        setIsLoadingProfile(false); // Not logged in, not loading
    }
  }, [authUser, authLoading, toast]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!authUser || !profile) return;
    setIsUpdating(true);
    try {
      const updatedData: Partial<UserProfile> = {
        displayName: editDisplayName,
        favoriteGenre: editFavoriteGenre,
        avatarUrl: editAvatarUrl,
      };
      await updateUserProfile(authUser.uid, updatedData);
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      // setIsEditing(false); // Dialog will close itself via DialogClose
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ title: "Error", description: "Could not update your profile.", variant: "destructive" });
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

  if (!authUser || !profile) {
    return <p className="text-center text-muted-foreground">Please log in to view your profile.</p>;
  }

  const engagementStats = [
    { label: "Dilemmas Explored", value: profile.storiesCompleted || 0, icon: BookOpenCheck },
    { label: "Scenarios Analyzed", value: profile.dilemmasAnalyzed || 0, icon: BarChartHorizontalBig },
    { label: "Community Submissions", value: profile.communitySubmissions || 0, icon: MessageSquarePlus },
  ];

  return (
    <Card className="max-w-2xl mx-auto shadow-xl bg-card/70 backdrop-blur-sm">
      <CardHeader className="items-center text-center relative pb-4">
        <Avatar className="h-24 w-24 mb-4 border-4 border-primary shadow-lg">
          <AvatarImage src={profile.avatarUrl || undefined} alt={profile.displayName || 'User'} data-ai-hint="profile avatar" />
          <AvatarFallback className="text-3xl bg-muted text-muted-foreground">
            {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : <User />}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-3xl font-bold text-primary">{profile.displayName || 'Anonymous User'}</CardTitle>
        <CardDescription className="text-md text-muted-foreground flex items-center"><Mail className="mr-2 h-4 w-4"/>{profile.email}</CardDescription>
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
                    {profile.favoriteGenre || <span className="italic text-muted-foreground text-lg font-medium">Not yet specified</span>}
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
      <CardFooter className="border-t pt-4 mt-6">
         <p className="text-xs text-muted-foreground italic text-center w-full">Profile last updated: {profile.lastUpdated ? new Date(profile.lastUpdated.seconds * 1000).toLocaleDateString() : 'Not available'}</p>
      </CardFooter>
    </Card>
  );
}

// Helper to add lastUpdated to UserProfile if it's not already there
// For now, we'll assume it might come from Firestore but isn't strictly in UserProfile type
// Add it to UserProfile type if it's consistently used:
// export interface UserProfile {
//   // ... other fields
//   lastUpdated?: { seconds: number; nanoseconds: number } | Date; 
//   createdAt?: { seconds: number; nanoseconds: number } | Date; 
// }
// For this update, I am not modifying the types/index.ts
// The code will try to display lastUpdated if profile.lastUpdated exists,
// which means getUserProfile and updateUserProfile would need to handle it.
// For now, this only affects display. The `updateUserProfile` action already adds `lastUpdated`.
// `getUserProfile` would need to be modified to return it for display.
// I will assume `getUserProfile` might return it and handle its absence gracefully.
