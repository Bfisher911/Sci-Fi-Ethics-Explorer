'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getPendingDilemmas, getAllUsers, getAllStories } from '@/app/actions/admin';
import { FileText, Users, BookOpen, ShieldCheck } from 'lucide-react';

/**
 * Admin Dashboard landing page showing summary cards and quick links.
 */
export default function AdminDashboardPage() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [storiesCount, setStoriesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      const [dilemmasResult, usersResult, storiesResult] = await Promise.all([
        getPendingDilemmas(),
        getAllUsers(),
        getAllStories(),
      ]);

      if (dilemmasResult.success) setPendingCount(dilemmasResult.data.length);
      if (usersResult.success) setUsersCount(usersResult.data.length);
      if (storiesResult.success) setStoriesCount(storiesResult.data.length);

      setLoading(false);
    }

    fetchCounts();
  }, []);

  const cards = [
    {
      title: 'Pending Dilemmas',
      count: pendingCount,
      icon: FileText,
      href: '/admin/dilemmas',
      description: 'Dilemmas awaiting moderation',
    },
    {
      title: 'Total Users',
      count: usersCount,
      icon: Users,
      href: '/admin/users',
      description: 'Registered users',
    },
    {
      title: 'Total Stories',
      count: storiesCount,
      icon: BookOpen,
      href: '/admin/stories',
      description: 'All stories in the system',
    },
  ];

  return (
    <div>
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary font-headline">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Manage dilemmas, stories, and users from one place.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">{card.count ?? 0}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
