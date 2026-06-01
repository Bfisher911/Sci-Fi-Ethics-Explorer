'use client';

/**
 * Renders the structured brief for a first-party debate: background, the
 * contested question, each good-faith position (with its strongest arguments,
 * counterarguments, and ethical frameworks), opening / rebuttal / closing
 * prompts, role cards, and the suggested deliverable. Shown above the live
 * pro/con argument threads on the debate detail page. Renders nothing for
 * legacy community debates that have no brief.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Scale,
  HelpCircle,
  ThumbsUp,
  ShieldAlert,
  Mic,
  Repeat,
  Flag,
  Users,
  ClipboardCheck,
} from 'lucide-react';
import { FRAMEWORK_META, normalizeFrameworkId } from '@/lib/ethics/frameworks';
import type { DebateBrief as DebateBriefData } from '@/types';

function FrameworkBadges({ ids }: { ids: string[] }): JSX.Element {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((raw) => {
        const id = normalizeFrameworkId(raw);
        const label = id ? FRAMEWORK_META[id].label : raw;
        return (
          <Badge key={raw} variant="outline" className="text-[10px]">
            {label}
          </Badge>
        );
      })}
    </div>
  );
}

function PromptList({
  icon: Icon,
  title,
  items,
  description,
}: {
  icon: typeof Mic;
  title: string;
  items: string[];
  description?: string;
}): JSX.Element {
  return (
    <div>
      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h4>
      {description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      )}
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/90">
        {items.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

export function DebateBrief({ brief }: { brief: DebateBriefData }): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Background + central question */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-primary">
            <Scale className="h-5 w-5" /> Debate Brief
          </CardTitle>
          <CardDescription>
            Read the brief, then argue a side in the threads below. You can argue
            more than one side in good faith.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
            {brief.background}
          </p>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <HelpCircle className="h-3.5 w-3.5" /> The question
            </div>
            <p className="mt-1 text-base font-medium">{brief.centralQuestion}</p>
          </div>
          {brief.frameworks.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Frameworks in play
              </div>
              <FrameworkBadges ids={brief.frameworks} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Positions */}
      <div className="grid gap-4 md:grid-cols-2">
        {brief.positions.map((pos) => (
          <Card key={pos.id} className="bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{pos.label}</CardTitle>
              <CardDescription>{pos.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-500">
                  <ThumbsUp className="h-3.5 w-3.5" /> Arguments for
                </h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground/90">
                  {pos.argumentsFor.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-500">
                  <ShieldAlert className="h-3.5 w-3.5" /> Counterarguments
                </h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground/90">
                  {pos.counterarguments.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
              <FrameworkBadges ids={pos.frameworks} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prompts + roles + deliverable */}
      <Card className="bg-card/60">
        <CardContent className="space-y-5 pt-6">
          <PromptList icon={Mic} title="Opening statement prompts" items={brief.openingPrompts} />
          <PromptList icon={Repeat} title="Rebuttal prompts" items={brief.rebuttalPrompts} />
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Flag className="h-4 w-4 text-primary" /> Closing reflection
            </h4>
            <p className="mt-2 text-sm text-foreground/90">{brief.closingPrompt}</p>
          </div>
          {brief.roleCards.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" /> Role cards
              </h4>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {brief.roleCards.map((rc, i) => (
                  <div key={i} className="rounded-md border border-border/60 bg-background/40 p-3">
                    <div className="text-sm font-medium">{rc.role}</div>
                    <div className="text-xs text-muted-foreground">{rc.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
              <ClipboardCheck className="h-3.5 w-3.5" /> Suggested deliverable
            </div>
            <p className="mt-1 text-sm text-foreground/90">{brief.deliverable}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
