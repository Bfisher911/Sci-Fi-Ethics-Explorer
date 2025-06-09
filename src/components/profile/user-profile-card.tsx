'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/types';
// 🔁 PATCH: Use onSnapshot for real-time updates and client-side updateDoc (BF 2025-06-06)
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
// import { getUserProfile, updateUserProfile } from '@/app/actions/user'; // No longer using server actions for fetch/update here
// 🔁 END PATCH
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
// 🔁 PATCH: Add Edit2 for Bio icon (BF 2025-06-06)
import { User, Mail, Library, Tv, Save, Loader2, Edit3, BarChartHorizontalBig, BookOpenCheck, MessageSquarePlus, AlertTriangle, ShieldCheck, UserCog, Contact, Edit2 } from 'lucide-react';
// 🔁 END PATCH
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
import { Badge } from '@/components/ui/badge';
// 🔁 PATCH: Import Textarea for Bio (BF 2025-06-06)
import { Textarea } from '@/components/ui/textarea';
// 🔁 END PATCH

const genres = ["Cyberpunk", "Space Opera", "Post-Apocalyptic", "Biopunk", "Time Travel", "Utopian/Dystopian", "Military Sci-Fi", "Philosophical Sci-Fi"];
const roles = ["Explorer", "Contributor", "Moderator", "Admin"]; // 'Admin' role editing is restricted if not admin

export function UserProfileCard() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [editDisplayName, setEditDisplayName] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  // 🔁 PATCH: Add state for bio (BF 2025-06-06)
  const [editBio, setEditBio] = useState('');
  // 🔁 END PATCH
  const [editFavoriteGenre, setEditFavoriteGenre] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editRole, setEditRole] = useState('Explorer');
  const [isUpdating, setIsUpdating] = useState(false);

  // 🔁 PATCH: Real-time profile fetching with onSnapshot (BF 2025-06-06)
  useEffect(() => {
    if (authUser) {
      setIsLoadingProfile(true);
      setProfileError(null);
      const userDocRef = doc(db, 'users', authUser.uid);
      
      const unsubscribe = onSnapshot(userDocRef, 
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as UserProfile; // Assume data matches UserProfile
            // Convert Firestore timestamps to Date objects
            const firestoreDataToProfile = (d: any): UserProfile => ({
                ...d,
                // Ensure 'name' from Firestore (set by cloud function) maps to displayName
                displayName: d.name || d.displayName || '', 
                bio: d.bio || '',
                createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : undefined,
                lastUpdated: d.lastUpdated?.toDate ? d.lastUpdated.toDate() : undefined,
            });
            const userProfileData = firestoreDataToProfile(data);
            setProfile(userProfileData);

            setEditDisplayName(userProfileData.displayName || authUser.displayName || '');
            setEditFirstName(userProfileData.firstName || '');
            setEditLastName(userProfileData.lastName || '');
            setEditBio(userProfileData.bio || '');
            setEditFavoriteGenre(userProfileData.favoriteGenre || '');
            setEditAvatarUrl(userProfileData.avatarUrl || authUser.photoURL || '');
            setEditRole(userProfileData.role || 'Explorer');

          } else {
            // Document doesn't exist, might be a new user whose Cloud Function hasn't run yet,
            // or client-side creation failed and rules blocked.
            // Initialize form with Auth user data as fallback.
            setProfile(null); // Explicitly set to null
            const nameFromAuth = authUser.displayName || authUser.email?.split('@')[0] || '';
            const nameParts = nameFromAuth.trim().split(/\s+/);
            setEditDisplayName(nameFromAuth);
            setEditFirstName(nameParts[0] || '');
            setEditLastName(nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
            setEditBio(''); // Default empty bio
            setEditFavoriteGenre('');
            setEditAvatarUrl(authUser.photoURL || '');
            setEditRole('Explorer');
            // Optionally, inform the user or attempt to create the profile here if a CTA is desired
            // For now, editing and saving will create it.
             setProfileError("Profile document not found. Editing and saving will create it.");
          }
          setIsLoadingProfile(false);
        },
        (error) => {
          console.error("UserProfileCard: Error fetching profile with onSnapshot:", error);
          const errorMessage = error.message.toLowerCase().includes("permission") 
            ? "Could not fetch user profile due to permissions. Please check Firestore security rules."
            : "Could not load your profile.";
          setProfileError(errorMessage);
          setIsLoadingProfile(false);
          toast({ title: "Error Loading Profile", description: errorMessage, variant: "destructive" });
        }
      );
      return () => unsubscribe(); // Cleanup listener on component unmount
    } else if (!authLoading) {
      setIsLoadingProfile(false);
      setProfile(null);
    }
  }, [authUser, authLoading, toast]);
  // 🔁 END PATCH

  // 🔁 PATCH: Update profile using client-side updateDoc (BF 2025-06-06)
  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!authUser || !authUser.uid) {
      toast({ title: "Authentication Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    setIsUpdating(true);
    try {
      const userDocRef = doc(db, 'users', authUser.uid);
      const updatedData: Partial<UserProfile> & { lastUpdated: any, name?: string, uid: string } = {
        uid: authUser.uid, // Added this line
        name: editDisplayName, 
        displayName: editDisplayName, // Keep for local state if needed
        firstName: editFirstName,
        lastName: editLastName,
        bio: editBio,
        favoriteGenre: editFavoriteGenre,
        avatarUrl: editAvatarUrl,
        role: editRole,
        lastUpdated: serverTimestamp(), // Use server timestamp for updates
      };
      
      // If profile doesn't exist, setDoc will create it. Otherwise, updateDoc merges.
      // Using setDoc with merge:true for upsert behavior.
      await setDoc(userDocRef, updatedData, { merge: true });

      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      // No need to manually setProfile state, onSnapshot will pick up changes.
      if (profileError === "Profile document not found. Editing and saving will create it.") {
          setProfileError(null); // Clear the "not found" message after successful save
      }
    } catch (error: any) {
      console.error("UserProfileCard: Failed to update profile:", error);
      const errorMsg = error.message.toLowerCase().includes("permission")
        ? "Could not update profile due to permissions. Please check Firestore security rules."
        : (error.message || "Could not update your profile.");
      toast({ title: "Error Updating Profile", description: errorMsg, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };
  // 🔁 END PATCH

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
          {/* 🔁 PATCH: Skeleton for bio (BF 2025-06-06) */}
          <Skeleton className="h-24 w-full" />
          {/* 🔁 END PATCH */}
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
  
  // Fallback data for display if profile is null but authUser exists
  const displayData = profile || {
    uid: authUser.uid,
    email: authUser.email,
    displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Anonymous Explorer',
    firstName: editFirstName, // Use edit state as fallback if profile is null
    lastName: editLastName,   // Use edit state as fallback
    bio: editBio,             // Use edit state as fallback
    avatarUrl: authUser.photoURL || '',
    favoriteGenre: '',
    storiesCompleted: 0,
    dilemmasAnalyzed: 0,
    communitySubmissions: 0,
    role: 'Explorer',
    isAdmin: false,
    createdAt: undefined, // No reliable client-side creation date
    lastUpdated: undefined,
  };
  
  const cardTitle = displayData.displayName || `${displayData.firstName} ${displayData.lastName}`.trim() || 'No Name Set';
  const fullNameDisplay = `${displayData.firstName} ${displayData.lastName}`.trim();
  const showFullNameLine = fullNameDisplay && fullNameDisplay !== displayData.displayName;

  const engagementStats = [
    { label: "Dilemmas Explored", value: displayData.storiesCompleted || 0, icon: BookOpenCheck },
    { label: "Scenarios Analyzed", value: displayData.dilemmasAnalyzed || 0, icon: BarChartHorizontalBig },
    { label: "Community Submissions", value: displayData.communitySubmissions || 0, icon: MessageSquarePlus },
  ];

  const lastUpdatedText = displayData.lastUpdated instanceof Date
    ? displayData.lastUpdated.toLocaleDateString()
    : (displayData.lastUpdated ? 'Processing...' : 'Not yet saved');
  const createdAtText = displayData.createdAt instanceof Date
    ? displayData.createdAt.toLocaleDateString()
    : 'N/A';

  const isPermissionError = profileError?.includes("permission");

  return (
    <>
    {profileError && (
        <Alert variant={isPermissionError ? "destructive" : "info"} className="mb-6 max-w-2xl mx-auto bg-card/80 backdrop-blur-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{isPermissionError ? "Error Loading Profile" : "Profile Information"}</AlertTitle>
          <AlertDescription>
            {profileError}
            {isPermissionError && (
              <strong className="block mt-2 text-destructive-foreground/90">
                This likely means your Firestore security rules in the Firebase Console need to be updated to allow reading your profile.
              </strong>
            )}
          </AlertDescription>
        </Alert>
      )}
     
    <Card className="max-w-2xl mx-auto shadow-xl bg-card/70 backdrop-blur-sm">
      <CardHeader className="items-center text-center relative pb-4">
        <Avatar className="h-24 w-24 mb-4 border-4 border-primary shadow-lg">
          <AvatarImage src={displayData.avatarUrl || undefined} alt={cardTitle} data-ai-hint="profile avatar" />
          <AvatarFallback className="text-3xl bg-muted text-muted-foreground">
            {cardTitle ? cardTitle.charAt(0).toUpperCase() : <User />}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-3xl font-bold text-primary">{cardTitle}</CardTitle>
        {showFullNameLine && (
             <p className="text-md text-muted-foreground">
               (Full Name: {fullNameDisplay})
             </p>
        )}
        <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-sm">{displayData.role || 'Explorer'}</Badge>
            {displayData.isAdmin && <Badge variant="destructive" className="text-sm bg-accent text-accent-foreground"><ShieldCheck className="mr-1 h-4 w-4" />Admin</Badge>}
        </div>
        <CardDescription className="text-md text-muted-foreground flex items-center mt-1"><Mail className="mr-2 h-4 w-4"/>{displayData.email}</CardDescription>
         <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="absolute top-4 right-4 text-primary hover:text-accent border-primary hover:border-accent">
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card border-border shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-primary">Edit Your Profile</DialogTitle>
                    <DialogDescription>
                        Update your details. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="editDisplayName" className="text-muted-foreground">Display Name</Label>
                        <Input id="editDisplayName" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} className="bg-input" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="editFirstName" className="text-muted-foreground">First Name</Label>
                            <Input id="editFirstName" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="bg-input" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="editLastName" className="text-muted-foreground">Last Name</Label>
                            <Input id="editLastName" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="bg-input" />
                        </div>
                    </div>
                    {/* 🔁 PATCH: Add Bio field to edit dialog (BF 2025-06-06) */}
                    <div className="space-y-1.5">
                        <Label htmlFor="editBio" className="text-muted-foreground">Bio</Label>
                        <Textarea id="editBio" value={editBio} onChange={(e) => setEditBio(e.target.value)} className="bg-input" placeholder="Tell us a bit about yourself..." rows={3} />
                    </div>
                    {/* 🔁 END PATCH */}
                     <div className="space-y-1.5">
                        <Label htmlFor="editRole" className="text-muted-foreground">Role</Label>
                        <select
                            id="editRole"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            // Prevent non-admins from assigning themselves Admin role, unless they are already admin
                            disabled={!displayData.isAdmin && editRole === 'Admin' && displayData.role !== 'Admin'}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {roles
                              .filter(r => displayData.isAdmin || r !== 'Admin' || r === displayData.role)
                              .map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="editFavoriteGenre" className="text-muted-foreground">Favorite Sci-Fi Genre</Label>
                        <select
                            id="editFavoriteGenre"
                            value={editFavoriteGenre}
                            onChange={(e) => setEditFavoriteGenre(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Select Genre</option>
                            {genres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="editAvatarUrl" className="text-muted-foreground">Avatar URL</Label>
                        <Input id="editAvatarUrl" type="url" value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} className="bg-input" placeholder="https://example.com/avatar.png" />
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
        {/* 🔁 PATCH: Display Bio (BF 2025-06-06) */}
        <div>
            <h3 className="text-xl font-semibold text-accent mb-3 flex items-center">
                <Edit2 className="mr-2 h-5 w-5"/> Bio
            </h3>
            <div className="p-4 bg-muted/60 rounded-lg shadow-inner min-h-[60px]">
                <p className="text-md text-foreground whitespace-pre-wrap">
                    {displayData.bio || <span className="italic text-muted-foreground">No bio yet.</span>}
                </p>
            </div>
        </div>
        {/* 🔁 END PATCH */}
        <div>
            <h3 className="text-xl font-semibold text-accent mb-3 flex items-center">
                <Library className="mr-2 h-5 w-5"/>
                Favorite Sci-Fi Genre
            </h3>
            <div className="p-4 bg-muted/60 rounded-lg shadow-inner">
                <p className="text-xl font-bold text-primary text-center">
                    {displayData.favoriteGenre || <span className="italic text-muted-foreground text-lg font-medium">Not yet specified</span>}
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
