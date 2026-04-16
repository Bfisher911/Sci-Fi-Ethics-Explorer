'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import {
  getPendingDilemmas,
  getAllUsers,
  getAllStories,
  getModerationQueue,
} from '@/app/actions/admin';
import { getPendingCommunityBlogPosts } from '@/app/actions/blog';
import {
  FileText,
  Users,
  BookOpen,
  ShieldCheck,
  Shield,
  History,
  Brain,
  Award,
  Newspaper,
} from 'lucide-react';

/**
 * Admin Dashboard landing page showing summary cards and quick links.
 */
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [storiesCount, setStoriesCount] = useState<number | null>(null);
  const [moderationCount, setModerationCount] = useState<number | null>(null);
  const [pendingBlogCount, setPendingBlogCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      const [
        dilemmasResult,
        usersResult,
        storiesResult,
        moderationResult,
        blogQueueResult,
      ] = await Promise.all([
        getPendingDilemmas(),
        getAllUsers(),
        getAllStories(),
        user ? getModerationQueue(user.uid) : Promise.resolve(null),
        user ? getPendingCommunityBlogPosts(user.uid) : Promise.resolve(null),
      ]);

      if (dilemmasResult.success) setPendingCount(dilemmasResult.data.length);
      if (usersResult.success) setUsersCount(usersResult.data.length);
      if (storiesResult.success) setStoriesCount(storiesResult.data.length);
      if (moderationResult && moderationResult.success) {
        const { stories, dilemmas, analyses, perspectives } = moderationResult.data;
        setModerationCount(
          stories.length +
            dilemmas.length +
            analyses.length +
            perspectives.length
        );
      } else {
        setModerationCount(0);
      }
      if (blogQueueResult && blogQueueResult.success) {
        setPendingBlogCount(blogQueueResult.data.length);
      } else {
        setPendingBlogCount(0);
      }

      setLoading(false);
    }

    if (user) fetchCounts();
  }, [user]);

  const cards = [
    {
      title: 'Moderation Queue',
      count: moderationCount,
      icon: Shield,
      href: '/admin/moderation',
      description: 'Items pending or flagged across all content types',
    },
    {
      title: 'Pending Dilemmas',
      count: pendingCount,
      icon: FileText,
      href: '/admin/dilemmas',
      description: 'Dilemmas awaiting moderation',
    },
    {
      title: 'Pending Community Articles',
      count: pendingBlogCount,
      icon: Newspaper,
      href: '/admin/community-blog',
      description: 'User-submitted blog posts awaiting review',
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
    {
      title: 'Audit Log',
      count: null,
      icon: History,
      href: '/admin/audit-log',
      description: 'Review every admin action',
    },
    {
      title: 'Quiz Library',
      count: null,
      icon: Brain,
      href: '/admin/quizzes',
      description: 'Generate and manage philosopher/theory quizzes',
    },
    {
      title: 'Certificates',
      count: null,
      icon: Award,
      href: '/admin/certificates',
      description: 'Review and revoke issued certificates',
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                {loading && card.count !== null ? (
                  <Skeleton className="h-8 w-16" />
                ) : card.count === null ? (
                  <div className="text-lg font-semibold text-primary">View →</div>
                ) : (
                  <div className="text-3xl font-bold">{card.count}</div>
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
