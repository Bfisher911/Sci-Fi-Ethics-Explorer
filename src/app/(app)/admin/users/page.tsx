'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types';
import { getAllUsers, setUserAdmin } from '@/app/actions/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Inbox, AlertCircle, ShieldCheck } from 'lucide-react';

/**
 * Admin page for managing users and toggling admin status.
 */
export default function AdminUsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (targetUser: UserProfile) => {
    if (!user) return;
    const newAdminStatus = !targetUser.isAdmin;
    const result = await setUserAdmin(targetUser.uid, newAdminStatus, user.uid);
    if (result.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUser.uid ? { ...u, isAdmin: newAdminStatus } : u
        )
      );
      toast({
        title: 'Admin Status Updated',
        description: `${targetUser.displayName || targetUser.email} is ${
          newAdminStatus ? 'now an admin' : 'no longer an admin'
        }.`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold text-primary font-headline">
              User Management
            </h1>
          </div>
          <p className="text-muted-foreground">
            View all registered users and manage admin privileges.
          </p>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="text-center py-12">
          <Inbox className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground">
            No Users Found
          </h2>
          <p className="text-md text-muted-foreground/80 mt-2">
            No registered users in the system yet.
          </p>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell className="font-medium">
                    {u.displayName || 'N/A'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.email || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{u.role || 'user'}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.isAdmin ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={u.isAdmin ? 'destructive' : 'outline'}
                      onClick={() => handleToggleAdmin(u)}
                    >
                      {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
