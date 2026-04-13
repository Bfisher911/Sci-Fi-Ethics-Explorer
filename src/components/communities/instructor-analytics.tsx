'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Mail, BarChart3, CheckCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { CommunityMemberInfo, CommunityInvite } from '@/types';

interface InstructorAnalyticsProps {
  communityId: string;
  members: CommunityMemberInfo[];
  invites: CommunityInvite[];
}

const PIE_COLORS = ['#22c55e', '#eab308', '#6b7280'];

/**
 * Analytics dashboard component showing community participation,
 * member status, and invite tracking.
 */
export function InstructorAnalytics({
  communityId,
  members,
  invites,
}: InstructorAnalyticsProps) {
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const paidMembers = members.filter(
      (m) =>
        m.subscriptionStatus === 'active' ||
        m.subscriptionStatus === 'trial' ||
        !!m.activeLicenseId
    ).length;
    const licensedMembers = members.filter((m) => !!m.activeLicenseId).length;
    const unpaidMembers = totalMembers - paidMembers;
    const instructors = members.filter((m) => m.role === 'instructor').length;

    const totalInvites = invites.length;
    const acceptedInvites = invites.filter((i) => i.status === 'accepted').length;
    const pendingInvites = invites.filter((i) => i.status === 'pending').length;
    const declinedInvites = invites.filter((i) => i.status === 'declined').length;
    const acceptanceRate =
      totalInvites > 0 ? Math.round((acceptedInvites / totalInvites) * 100) : 0;

    return {
      totalMembers,
      paidMembers,
      licensedMembers,
      unpaidMembers,
      instructors,
      totalInvites,
      acceptedInvites,
      pendingInvites,
      declinedInvites,
      acceptanceRate,
    };
  }, [members, invites]);

  const memberStatusData = useMemo(
    () => [
      { name: 'Active (Paid/Licensed)', value: stats.paidMembers },
      { name: 'Pending Payment', value: stats.unpaidMembers },
    ].filter((d) => d.value > 0),
    [stats]
  );

  const inviteStatusData = useMemo(
    () => [
      { name: 'Accepted', value: stats.acceptedInvites },
      { name: 'Pending', value: stats.pendingInvites },
      { name: 'Declined', value: stats.declinedInvites },
    ].filter((d) => d.value > 0),
    [stats]
  );

  const roleDistribution = useMemo(
    () => [
      { role: 'Instructors', count: stats.instructors },
      { role: 'Members', count: stats.totalMembers - stats.instructors },
    ],
    [stats]
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.paidMembers}</p>
                <p className="text-xs text-muted-foreground">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalInvites}</p>
                <p className="text-xs text-muted-foreground">Invites Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.acceptanceRate}%</p>
                <p className="text-xs text-muted-foreground">Acceptance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Status Pie */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Member Status</CardTitle>
          </CardHeader>
          <CardContent>
            {memberStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={memberStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {memberStatusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No member data yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Role Distribution Bar */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roleDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="role" stroke="#888" />
                <YAxis stroke="#888" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid #333',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Invite Tracker */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Invite Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No invites sent yet.
            </p>
          ) : (
            <>
              {inviteStatusData.length > 0 && (
                <div className="flex gap-4 mb-4">
                  {inviteStatusData.map((d) => (
                    <Badge key={d.name} variant="outline">
                      {d.name}: {d.value}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="text-sm">{invite.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {invite.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invite.status === 'accepted'
                                ? 'default'
                                : invite.status === 'declined'
                                ? 'destructive'
                                : 'outline'
                            }
                            className={
                              invite.status === 'accepted'
                                ? 'bg-green-600 text-white'
                                : invite.status === 'pending'
                                ? 'border-yellow-500 text-yellow-500'
                                : ''
                            }
                          >
                            {invite.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
