
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/types';
import { getUserProfile, updateUserProfile } from '@/app/actions/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Library, Tv, Save, Loader2, Edit3, BarChartHorizontalBig, BookOpenCheck, MessageSquarePlus, AlertTriangle, ShieldCheck, UserCog, Contact } from 'lucide-react';
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

const genres = ["Cyberpunk", "Space Opera", "Post-Apocalyptic", "Biopunk", "Time Travel", "Utopian/Dystopian", "Military Sci-Fi", "Philosophical Sci-Fi"];
const roles = ["Explorer", "Contributor", "Moderator", "Admin"];

export function UserProfileCard() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [editDisplayName, setEditDisplayName] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editFavoriteGenre, setEditFavoriteGenre] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editRole, setEditRole] = useState('Explorer');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (authUser) {
        console.log(`UserProfileCard useEffect: authUser found. UID: '${authUser.uid}', DisplayName: '${authUser.displayName}'`);
        setIsLoadingProfile(true);
        setProfileError(null);
        try {
          if (!authUser.uid) {
            console.error("UserProfileCard: authUser.uid is undefined or empty!");
            setProfileError("Authenticated user UID is missing.");
            setIsLoadingProfile(false);
            return;
          }
          const result = await getUserProfile(authUser.uid);
          if (result.success) {
            setProfile(result.data);
            const userProfileData = result.data;
            const nameParts = (userProfileData?.displayName || authUser.displayName || authUser.email?.split('@')[0] || '').trim().split(/\s+/);
            const defaultFirstName = userProfileData?.firstName || nameParts[0] || '';
            const defaultLastName = userProfileData?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

            setEditDisplayName(userProfileData?.displayName || authUser.displayName || authUser.email?.split('@')[0] || 'Anonymous Explorer');
            setEditFirstName(defaultFirstName);
            setEditLastName(defaultLastName);
            setEditFavoriteGenre(userProfileData?.favoriteGenre || '');
            setEditAvatarUrl(userProfileData?.avatarUrl || authUser.photoURL || '');
            setEditRole(userProfileData?.role || 'Explorer');
          } else {
            throw new Error(result.error);
          }
        } catch (error: any) {
          console.error("UserProfileCard: Failed to fetch profile:", error);
          const errorMessage = error.message || "Could not load your profile.";
          setProfileError(errorMessage);
          toast({ title: "Error Loading Profile", description: errorMessage, variant: "destructive" });

          const nameParts = (authUser.displayName || authUser.email?.split('@')[0] || '').trim().split(/\s+/);
          const defaultFirstName = nameParts[0] || '';
          const defaultLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          setEditDisplayName(authUser.displayName || authUser.email?.split('@')[0] || 'Anonymous Explorer');
          setEditFirstName(defaultFirstName);
          setEditLastName(defaultLastName);
          setEditFavoriteGenre('');
          setEditAvatarUrl(authUser.photoURL || '');
          setEditRole('Explorer');
        } finally {
          setIsLoadingProfile(false);
        }
      } else if (!authLoading) {
          setIsLoadingProfile(false);
          setProfile(null);
      }
    };
    fetchProfile();
  }, [authUser, authLoading, toast]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!authUser || !authUser.uid) {
      toast({ title: "Authentication Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    setIsUpdating(true);
    try {
      const updatedData: Partial<UserProfile> = {
        displayName: editDisplayName,
        firstName: editFirstName,
        lastName: editLastName,
        favoriteGenre: editFavoriteGenre,
        avatarUrl: editAvatarUrl,
        role: editRole,
      };
      const result = await updateUserProfile(authUser.uid, updatedData);
      
      if (result.success) {
        setProfile(prev => ({
          ...(prev || {
              uid: authUser.uid,
              email: authUser.email,
              storiesCompleted: 0,
              dilemmasAnalyzed: 0,
              communitySubmissions: 0,
              isAdmin: prev?.isAdmin || false,
              createdAt: prev?.createdAt || new Date(),
          }),
          ...updatedData,
          displayName: editDisplayName,
          firstName: editFirstName,
          lastName: editLastName,
          favoriteGenre: editFavoriteGenre,
          avatarUrl: editAvatarUrl,
          role: editRole,
          lastUpdated: new Date(),
        } as UserProfile));
        toast({ title: "Profile Updated", description: "Your changes have been saved." });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("UserProfileCard: Failed to update profile:", error);
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
  
  const defaultFirstNameForDisplay = editFirstName || (authUser.displayName?.trim().split(/\s+/)[0] || '');
  const defaultLastNameForDisplay = editLastName || (authUser.displayName?.trim().split(/\s+/).slice(1).join(' ') || '');

  const displayProfile: UserProfile = profile || {
    uid: authUser.uid,
    email: authUser.email,
    displayName: editDisplayName || authUser.displayName || authUser.email?.split('@')[0] || 'Anonymous Explorer',
    firstName: defaultFirstNameForDisplay,
    lastName: defaultLastNameForDisplay,
    avatarUrl: editAvatarUrl || authUser.photoURL || '',
    favoriteGenre: editFavoriteGenre || '',
    storiesCompleted: 0,
    dilemmasAnalyzed: 0,
    communitySubmissions: 0,
    role: editRole || 'Explorer',
    isAdmin: profile?.isAdmin || false,
    createdAt: profile?.createdAt,
    lastUpdated: profile?.lastUpdated,
  };
  
  const cardTitle = displayProfile.displayName || `${displayProfile.firstName} ${displayProfile.lastName}`.trim() || 'No Name Set';
  const fullNameDisplay = `${displayProfile.firstName} ${displayProfile.lastName}`.trim();
  const showFullNameLine = fullNameDisplay && fullNameDisplay !== displayProfile.displayName;

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

  const isPermissionError = profileError?.includes("Missing or insufficient permissions");

  return (
    <>
    {profileError && (
        <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto bg-card/80 backdrop-blur-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Profile</AlertTitle>
          <AlertDescription>
            We encountered an error trying to load your profile: {profileError}.
            {isPermissionError && (
              <strong className="block mt-2 text-destructive-foreground/90">
                This "Missing or insufficient permissions" error likely means your Firestore security rules
                in the Firebase Console need to be updated to allow reading your profile from the 'users' collection.
                Please check your Firestore rules.
              </strong>
            )}
             {!isPermissionError && !profileError.includes("User UID is required") && (
              <p className="mt-2">
                You can try to update and save your profile using the "Edit Profile" button below.
                This might create the profile if it's missing and your Firestore write permissions are correctly set.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
      {!profileError && !profile && authUser && (
        <Alert variant="info" className="mb-6 max-w-2xl mx-auto bg-card/80 backdrop-blur-sm">
          <UserCog className="h-4 w-4" />
          <AlertTitle>Complete Your Profile</AlertTitle>
          <AlertDescription>
            It seems your profile hasn't been fully saved to our database yet.
            Please use the "Edit Profile" button to create or save your details.
            If you encounter permission errors after attempting to save, please check your Firestore security rules in the Firebase Console.
          </AlertDescription>
        </Alert>
      )}

    <Card className="max-w-2xl mx-auto shadow-xl bg-card/70 backdrop-blur-sm">
      <CardHeader className="items-center text-center relative pb-4">
        <Avatar className="h-24 w-24 mb-4 border-4 border-primary shadow-lg">
          <AvatarImage src={displayProfile.avatarUrl || undefined} alt={cardTitle} data-ai-hint="profile avatar" />
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
            <Badge variant="secondary" className="text-sm">{displayProfile.role || 'Explorer'}</Badge>
            {displayProfile.isAdmin && <Badge variant="destructive" className="text-sm bg-accent text-accent-foreground"><ShieldCheck className="mr-1 h-4 w-4" />Admin</Badge>}
        </div>
        <CardDescription className="text-md text-muted-foreground flex items-center mt-1"><Mail className="mr-2 h-4 w-4"/>{displayProfile.email}</CardDescription>
         <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="absolute top-4 right-4 text-primary hover:text-accent border-primary hover:border-accent">
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border shadow-xl">
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
                     <div className="space-y-1.5">
                        <Label htmlFor="editRole" className="text-muted-foreground">Role</Label>
                        <select
                            id="editRole"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            disabled={!displayProfile.isAdmin && roles.includes('Admin') && editRole === 'Admin' && displayProfile.role !== 'Admin'}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {roles
                              .filter(r => displayProfile.isAdmin || r !== 'Admin' || r === displayProfile.role)
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
