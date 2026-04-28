'use client';

/**
 * /studio — single hub consolidating the four AI surfaces:
 *
 *   Chat     · open-ended conversation with the AI Counselor
 *   Analyze  · one-shot analysis of a scenario you describe
 *   Compare  · multi-framework verdict comparison on a scenario + choice
 *   Reflect  · personalized reflection on a story / decision (free-form)
 *
 * All four previously lived as their own routes. Behavior inside each
 * tab is identical to the standalone routes; this is purely an IA
 * consolidation. The legacy routes still exist as thin wrappers around
 * the same Tab components so existing deep links / emails keep working.
 *
 * The active tab is reflected in the URL via ?tab=chat|analyze|compare|reflect
 * so users can deep-link directly to a mode (and so the sidebar can
 * preselect a tab when navigating in).
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  MessageSquare,
  FlaskConical,
  GitCompare,
  Sparkles,
} from 'lucide-react';
import { ChatTab } from '@/components/studio/chat-tab';
import { AnalyzeTab } from '@/components/studio/analyze-tab';
import { CompareTab } from '@/components/studio/compare-tab';
import { ReflectTab } from '@/components/studio/reflect-tab';
import { PremiumGate } from '@/components/gating/premium-gate';

const VALID_TABS = ['chat', 'analyze', 'compare', 'reflect'] as const;
type StudioTab = (typeof VALID_TABS)[number];

const DEFAULT_TAB: StudioTab = 'chat';

export default function StudioPage() {
  return (
    <PremiumGate featureName="Studio">
      <Suspense fallback={null}>
        <StudioPageInner />
      </Suspense>
    </PremiumGate>
  );
}

function StudioPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams?.get('tab');
  const initialTab: StudioTab = (VALID_TABS as readonly string[]).includes(queryTab ?? '')
    ? (queryTab as StudioTab)
    : DEFAULT_TAB;

  const [tab, setTab] = useState<StudioTab>(initialTab);

  // Keep URL in sync when the user clicks a tab — without piling up
  // history entries (replace, not push).
  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
    if (params.get('tab') !== tab) {
      params.set('tab', tab);
      router.replace(`/studio?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6 max-w-6xl">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold mb-2 text-primary font-headline flex items-center gap-3">
            <Sparkles className="h-9 w-9" />
            Studio
          </h1>
          <p className="text-lg text-muted-foreground">
            Four AI tools, one workspace. Switch modes without losing your
            place &mdash; each tab keeps its state while you&apos;re here.
          </p>
        </CardContent>
      </Card>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as StudioTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="analyze" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            <span>Analyze</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <GitCompare className="h-4 w-4" />
            <span>Compare</span>
          </TabsTrigger>
          <TabsTrigger value="reflect" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Reflect</span>
          </TabsTrigger>
        </TabsList>

        {/* Each TabsContent stays mounted so internal state (chat history,
            an in-progress analysis) doesn't reset when switching tabs.
            The mount cost is reasonable given there are only four. */}
        <TabsContent value="chat" forceMount={true} hidden={tab !== 'chat'}>
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <ChatTab />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analyze" forceMount={true} hidden={tab !== 'analyze'}>
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <AnalyzeTab />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="compare" forceMount={true} hidden={tab !== 'compare'}>
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <CompareTab />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reflect" forceMount={true} hidden={tab !== 'reflect'}>
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <ReflectTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
