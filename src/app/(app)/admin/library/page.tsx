'use client';

/**
 * /admin/library — single hub wrapping the three "what content exists
 * on the platform" admin surfaces: Blog · Quizzes · Certificates.
 *
 * The legacy routes (/admin/blog/edit, /admin/quizzes, /admin/certificates)
 * still work as deep links; this page gives them one home in the IA so
 * the admin sidebar doesn't sprawl.
 */

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Newspaper,
  Brain,
  Award,
  Library as LibraryIcon,
  ArrowRight,
} from 'lucide-react';

const VALID_TABS = ['blog', 'quizzes', 'certificates'] as const;
type LibraryTab = (typeof VALID_TABS)[number];

const DEFAULT_TAB: LibraryTab = 'blog';

export default function AdminLibraryPage() {
  return (
    <Suspense fallback={null}>
      <AdminLibraryInner />
    </Suspense>
  );
}

function AdminLibraryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams?.get('tab');
  const initialTab: LibraryTab = (VALID_TABS as readonly string[]).includes(queryTab ?? '')
    ? (queryTab as LibraryTab)
    : DEFAULT_TAB;

  const [tab, setTab] = useState<LibraryTab>(initialTab);

  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
    if (params.get('tab') !== tab) {
      params.set('tab', tab);
      router.replace(`/admin/library?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div>
      <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0 flex items-start gap-3">
          <LibraryIcon className="h-7 w-7 text-primary mt-1 shrink-0" />
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline">
              Library
            </h1>
            <p className="text-muted-foreground">
              Manage the platform&apos;s editable content &mdash; Professor
              Paradox blog posts, subject quizzes, and earned certificates.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as LibraryTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blog" className="gap-2">
            <Newspaper className="h-4 w-4" />
            <span>Blog</span>
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="gap-2">
            <Brain className="h-4 w-4" />
            <span>Quizzes</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-2">
            <Award className="h-4 w-4" />
            <span>Certificates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blog">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-headline font-semibold">
                  Professor Paradox Blog
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Author, edit, and publish official-author blog posts.
                </p>
              </div>
              <Button asChild>
                <Link href="/admin/blog/edit">
                  Open the editor <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-headline font-semibold">
                  Subject Quizzes
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate or audit per-philosopher / per-framework / per-media
                  quizzes. The platform ships static quizzes for every entity;
                  use this surface to override or regenerate any of them.
                </p>
              </div>
              <Button asChild>
                <Link href="/admin/quizzes">
                  Open the quiz dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-headline font-semibold">
                  Issued Certificates
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Review every certificate the platform has minted. Revoke
                  individual certificates when needed (audit-logged).
                </p>
              </div>
              <Button asChild>
                <Link href="/admin/certificates">
                  Open the certificate registry <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
