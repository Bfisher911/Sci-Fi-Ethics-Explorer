'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SubscriptionStatus } from '@/components/billing/subscription-status';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import {
  getUserSubscription,
  cancelSubscription,
} from '@/app/actions/subscriptions';
import {
  getUserLicenses,
  getLicenseSeats,
  assignSeat,
  revokeSeat,
} from '@/app/actions/licenses';
import {
  CreditCard,
  Users,
  UserPlus,
  Trash2,
  Loader2,
  Clock,
} from 'lucide-react';
import type { Subscription, License, SeatAssignment } from '@/types';
import Link from 'next/link';

/**
 * Billing management page showing subscription/license status,
 * seat management, and billing history placeholder.
 */
export default function BillingPage() {
  const { user } = useAuth();
  const { activeLicenseId } = useSubscription();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [seats, setSeats] = useState<SeatAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Assign seat dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignEmail, setAssignEmail] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load subscription
      const subResult = await getUserSubscription(user.uid);
      if (subResult.success) {
        setSubscription(subResult.data ?? null);
      }

      // Load licenses
      const licResult = await getUserLicenses(user.uid);
      if (licResult.success && licResult.data.length > 0) {
        const activeLicense = licResult.data[0];
        setLicense(activeLicense);

        // Load seats for the license
        const seatsResult = await getLicenseSeats(activeLicense.id);
        if (seatsResult.success) {
          setSeats(seatsResult.data);
        }
      }
    } catch (err) {
      console.error('Failed to load billing data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCancelSubscription(subscriptionId: string): Promise<void> {
    if (!user) return;
    const result = await cancelSubscription(subscriptionId, user.uid);
    if (result.success) {
      await loadData();
    }
  }

  async function handleAssignSeat(): Promise<void> {
    if (!license || !user || !assignEmail.trim()) return;
    setAssigning(true);
    setAssignError(null);

    try {
      const result = await assignSeat({
        licenseId: license.id,
        userId: assignEmail.trim(), // In production, look up user by email first
        userEmail: assignEmail.trim(),
      });

      if (result.success) {
        setAssignDialogOpen(false);
        setAssignEmail('');
        await loadData();
      } else {
        setAssignError(result.error);
      }
    } catch (err) {
      setAssignError(String(err));
    } finally {
      setAssigning(false);
    }
  }

  async function handleRevokeSeat(seatId: string): Promise<void> {
    if (!user) return;
    const result = await revokeSeat(seatId, user.uid);
    if (result.success) {
      await loadData();
    }
  }

  function formatDate(date: Date | any): string {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-primary font-headline">Billing &amp; Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your plan, license, and seat assignments.
        </p>
      </div>

      {/* Subscription / License Status */}
      <SubscriptionStatus
        subscription={subscription}
        license={license}
        onCancelSubscription={handleCancelSubscription}
      />

      {/* Seat Management (license holders only) */}
      {license && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Seat Management
                </CardTitle>
                <CardDescription className="mt-1">
                  {license.usedSeats} of {license.totalSeats} seats assigned
                </CardDescription>
              </div>
              <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={license.usedSeats >= license.totalSeats}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Seat
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign a Seat</DialogTitle>
                    <DialogDescription>
                      Enter the email address of the person you want to assign a seat to.
                      They will get full platform access under your organization license.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="seat-email">Email Address</Label>
                      <Input
                        id="seat-email"
                        type="email"
                        placeholder="user@example.com"
                        value={assignEmail}
                        onChange={(e) => setAssignEmail(e.target.value)}
                      />
                    </div>
                    {assignError && (
                      <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                        {assignError}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAssignDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAssignSeat}
                      disabled={!assignEmail.trim() || assigning}
                    >
                      {assigning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        'Assign Seat'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Seat usage bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Seats used</span>
                <span className="font-medium">
                  {license.usedSeats} / {license.totalSeats}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-accent rounded-full h-2.5 transition-all"
                  style={{
                    width: `${Math.min((license.usedSeats / license.totalSeats) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Seats Table */}
            {seats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seats.map((seat) => (
                    <TableRow key={seat.id}>
                      <TableCell className="font-medium">
                        {seat.userEmail || seat.userId}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(seat.assignedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={seat.status === 'active' ? 'default' : 'outline'}>
                          {seat.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Seat?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove {seat.userEmail || 'this user'}&apos;s access
                                under your organization license. They will need an individual
                                subscription to continue using the platform.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRevokeSeat(seat.id)}>
                                Revoke Seat
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No seats assigned yet.</p>
                <p className="text-sm">
                  Use the &quot;Assign Seat&quot; button to add team members.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Billing History Placeholder */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            Your past invoices and payment history will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No billing history yet.</p>
            <p className="text-sm">
              Payment processing is coming soon. Plans are currently simulated.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Change Plan Link */}
      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href="/pricing">
            Change Plan
          </Link>
        </Button>
      </div>
    </div>
  );
}
