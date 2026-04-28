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
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';

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

  // Three pillar hubs — every other admin link is reachable from one
  // of these three pages. The flat list of secondary cards below stays
  // available as deep-link shortcuts but the IA is now three columns.
  const pillarCards = [
    {
      title: 'Moderation',
      icon: Shield,
      href: '/admin/moderation',
      description:
        'Approve, flag, or revoke any user-submitted content (dilemmas, stories, comments, blog posts).',
      counts: [
        { label: 'In queue', value: moderationCount },
        { label: 'Pending dilemmas', value: pendingCount },
        { label: 'Pending articles', value: pendingBlogCount },
      ],
    },
    {
      title: 'Users',
      icon: Users,
      href: '/admin/users',
      description:
        'Browse the user roster, promote/demote admins, and manage license-group membership.',
      counts: [
        { label: 'Total users', value: usersCount },
      ],
    },
    {
      title: 'Library',
      icon: Award,
      href: '/admin/library',
      description:
        'Author the Professor Paradox blog, manage quizzes for every entity, and audit issued certificates.',
      counts: [
        { label: 'Total stories', value: storiesCount },
      ],
    },
  ];

  return (
    <div>
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary font-headline">
              Admin
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Three hubs: Moderation, Users, Library. Everything else is reachable
            from one of them.
          </p>
        </CardContent>
      </Card>

      {/* Three pillar hubs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {pillarCards.map((card, i) => (
          <RevealOnScroll
            key={card.title}
            from="up"
            delay={Math.min(i * 60, 240)}
            distance={14}
            duration={500}
          >
            <Link href={card.href} className="block h-full">
              <Card className="h-full bg-card/80 backdrop-blur-sm hover:bg-card/90 hover:-translate-y-0.5 transition-all cursor-pointer border-2 border-primary/20 hover:border-primary/50">
                <CardHeader className="flex flex-row items-start gap-3 pb-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <card.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-headline">
                      {card.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {card.counts.map((c) => (
                      <span key={c.label}>
                        <strong className="text-foreground font-bold">
                          {loading || c.value === null ? '—' : c.value}
                        </strong>{' '}
                        {c.label}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </RevealOnScroll>
        ))}
      </div>

      {/* Secondary deep-link shortcuts (kept for muscle memory) */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Shortcuts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {cards
          // Drop the cards already represented by a pillar card above.
          .filter(
            (c) =>
              c.href !== '/admin/moderation' &&
              c.href !== '/admin/users',
          )
          .map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-md border border-border/60 bg-background/30 p-3 text-sm flex items-center gap-3 hover:border-primary/40 transition-colors"
            >
              <card.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1 min-w-0 truncate">{card.title}</span>
              {!loading && card.count !== null && (
                <span className="text-xs font-mono text-muted-foreground">
                  {card.count}
                </span>
              )}
            </Link>
          ))}
      </div>
    </div>
  );
}
