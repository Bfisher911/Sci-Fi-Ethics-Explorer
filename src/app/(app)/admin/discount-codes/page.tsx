'use client';

/**
 * Admin "Discount Codes" page.
 *
 * Shows every discount code (free-access, comped, pilot, beta,
 * institution, promotional, and Stripe-flow), lets admins create new
 * codes, deactivate existing ones, and inspect redemptions per code.
 *
 * Listed under the Admin → Library hub.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Plus, Ticket, AlertCircle } from 'lucide-react';
import type {
  DiscountCode,
  DiscountCodeAccessScope,
  DiscountCodeRedemption,
  DiscountCodeType,
} from '@/types';
import {
  createDiscountCode,
  listDiscountCodes,
  listRedemptionsForCode,
  setDiscountCodeActive,
} from '@/app/actions/discount-codes';
import { toDate } from '@/lib/discount-codes';

function formatDate(value: unknown): string {
  const d = toDate(value);
  if (!d) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminDiscountCodesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Inspection
  const [inspectCode, setInspectCode] = useState<DiscountCode | null>(null);
  const [redemptions, setRedemptions] = useState<DiscountCodeRedemption[]>([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<DiscountCodeType>('free_access');
  const [formScope, setFormScope] =
    useState<DiscountCodeAccessScope>('platform_course');
  const [formCourseName, setFormCourseName] = useState(
    'The Ethics of Technology through Science Fiction',
  );
  const [formPlatformName, setFormPlatformName] = useState('Off World Clause');
  const [formDurationMonths, setFormDurationMonths] = useState<string>('4');
  const [formMaxRedemptions, setFormMaxRedemptions] = useState<string>('');
  const [formOneUsePerUser, setFormOneUsePerUser] = useState(true);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formExpiresAt, setFormExpiresAt] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  async function refresh(): Promise<void> {
    if (!user) return;
    setLoading(true);
    const res = await listDiscountCodes(user.uid);
    if (res.success) {
      setCodes(res.data);
      setError(null);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  async function handleToggleActive(code: DiscountCode): Promise<void> {
    if (!user) return;
    const res = await setDiscountCodeActive({
      adminUid: user.uid,
      discountCodeId: code.id,
      isActive: !code.isActive,
    });
    if (res.success) {
      toast({
        title: code.isActive ? 'Code deactivated' : 'Code activated',
        description: `${code.code} is now ${code.isActive ? 'inactive' : 'active'}.`,
      });
      await refresh();
    } else {
      toast({
        title: 'Could not update code',
        description: res.error,
        variant: 'destructive',
      });
    }
  }

  async function openRedemptions(code: DiscountCode): Promise<void> {
    if (!user) return;
    setInspectCode(code);
    setRedemptions([]);
    setRedemptionsLoading(true);
    const res = await listRedemptionsForCode({
      adminUid: user.uid,
      discountCodeId: code.id,
    });
    if (res.success) {
      setRedemptions(res.data);
    } else {
      toast({
        title: 'Could not load redemptions',
        description: res.error,
        variant: 'destructive',
      });
    }
    setRedemptionsLoading(false);
  }

  async function handleSubmitCreate(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const months = parseInt(formDurationMonths, 10);
      const maxRedemptions = formMaxRedemptions.trim()
        ? parseInt(formMaxRedemptions, 10)
        : null;
      const expires = formExpiresAt ? new Date(formExpiresAt) : null;
      const res = await createDiscountCode({
        adminUid: user.uid,
        code: formCode,
        name: formName,
        description: formDescription || undefined,
        discountType: formType,
        accessScope: formScope,
        courseName:
          formScope !== 'platform' ? formCourseName || undefined : undefined,
        platformName: formPlatformName || undefined,
        accessDurationMonths: Number.isFinite(months) && months > 0 ? months : undefined,
        maxRedemptions,
        oneUsePerUser: formOneUsePerUser,
        isActive: formIsActive,
        expiresAt: expires,
      });
      if (res.success) {
        toast({
          title: 'Discount code created',
          description: `${res.data.code} is now ${res.data.isActive ? 'active' : 'inactive'}.`,
        });
        setCreateOpen(false);
        setFormCode('');
        setFormName('');
        setFormDescription('');
        setFormMaxRedemptions('');
        setFormExpiresAt('');
        await refresh();
      } else {
        toast({
          title: 'Could not create code',
          description: res.error,
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Discount Codes</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Free-access codes (class, pilot, beta, institutional, comped) grant
            access without any Stripe billing. Stripe-flow codes
            (percent_off / amount_off) carry a Stripe promotion code id and
            apply at Checkout.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create discount code</DialogTitle>
              <DialogDescription>
                Free-access codes create an internal grant. They do not touch
                Stripe and will never charge the user.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="form-code">Code text *</Label>
                  <Input
                    id="form-code"
                    placeholder="OFFWORLD-CLASS-2026"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="form-name">Name *</Label>
                  <Input
                    id="form-name"
                    placeholder="Ethics of Tech — Class Code"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="form-desc">Description</Label>
                <Input
                  id="form-desc"
                  placeholder="Internal description for admins"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="form-type">Type *</Label>
                  <Select
                    value={formType}
                    onValueChange={(v) => setFormType(v as DiscountCodeType)}
                  >
                    <SelectTrigger id="form-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free_access">Free access</SelectItem>
                      <SelectItem value="comped">Comped</SelectItem>
                      <SelectItem value="pilot">Pilot</SelectItem>
                      <SelectItem value="beta">Beta tester</SelectItem>
                      <SelectItem value="institution">Institution</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="form-scope">Access scope *</Label>
                  <Select
                    value={formScope}
                    onValueChange={(v) =>
                      setFormScope(v as DiscountCodeAccessScope)
                    }
                  >
                    <SelectTrigger id="form-scope">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platform">Platform</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="platform_course">
                        Platform + course
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="form-platform">Platform name</Label>
                  <Input
                    id="form-platform"
                    placeholder="Off World Clause"
                    value={formPlatformName}
                    onChange={(e) => setFormPlatformName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="form-course">Course name</Label>
                  <Input
                    id="form-course"
                    placeholder="The Ethics of Technology through Science Fiction"
                    value={formCourseName}
                    onChange={(e) => setFormCourseName(e.target.value)}
                    disabled={formScope === 'platform'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="form-months">Duration (months) *</Label>
                  <Input
                    id="form-months"
                    type="number"
                    min={1}
                    value={formDurationMonths}
                    onChange={(e) => setFormDurationMonths(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="form-max">Max redemptions</Label>
                  <Input
                    id="form-max"
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    value={formMaxRedemptions}
                    onChange={(e) => setFormMaxRedemptions(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="form-expires">Code expires</Label>
                  <Input
                    id="form-expires"
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
                <div>
                  <p className="text-sm font-medium">One use per user</p>
                  <p className="text-xs text-muted-foreground">
                    Prevent the same student from redeeming twice.
                  </p>
                </div>
                <Switch
                  checked={formOneUsePerUser}
                  onCheckedChange={setFormOneUsePerUser}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
                <div>
                  <p className="text-sm font-medium">Active immediately</p>
                  <p className="text-xs text-muted-foreground">
                    When off, the code exists but cannot be redeemed.
                  </p>
                </div>
                <Switch
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create code'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not load codes</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>All discount codes</CardTitle>
          <CardDescription>
            Click "Redemptions" to inspect who has redeemed a code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : codes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No discount codes yet. Click "New code" or run{' '}
              <code className="rounded bg-muted px-1.5 py-0.5">
                npx tsx src/scripts/seed-discount-codes.ts
              </code>{' '}
              to create the starter class codes.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Redemptions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-semibold">
                      {c.code}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{c.name}</div>
                      {c.courseName && (
                        <div className="text-xs text-muted-foreground">
                          {c.courseName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.discountType}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{c.accessScope}</TableCell>
                    <TableCell className="text-xs">
                      {c.accessDurationMonths
                        ? `${c.accessDurationMonths} months`
                        : c.accessDurationDays
                          ? `${c.accessDurationDays} days`
                          : c.expiresAt
                            ? `until ${formatDate(c.expiresAt)}`
                            : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.redemptionCount}
                      {typeof c.maxRedemptions === 'number'
                        ? ` / ${c.maxRedemptions}`
                        : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? 'default' : 'outline'}>
                        {c.isActive ? 'active' : 'inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openRedemptions(c)}
                      >
                        Redemptions
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(c)}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!inspectCode}
        onOpenChange={(open) => !open && setInspectCode(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Redemptions for {inspectCode?.code}
            </DialogTitle>
            <DialogDescription>
              {inspectCode?.name}. Showing newest first.
            </DialogDescription>
          </DialogHeader>
          {redemptionsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : redemptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              This code has not been redeemed yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Redeemed</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Scope</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.userEmail || r.userId}
                    </TableCell>
                    <TableCell>{formatDate(r.redeemedAt)}</TableCell>
                    <TableCell>{formatDate(r.accessExpiresAt)}</TableCell>
                    <TableCell className="text-xs">{r.accessScope}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
