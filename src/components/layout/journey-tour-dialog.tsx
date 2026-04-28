'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Compass,
  Trophy,
  Sparkles,
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  ListChecks,
  Route as RouteIcon,
} from 'lucide-react';

interface JourneyTourDialogProps {
  trigger: ReactNode;
}

type Step = {
  icon: typeof BookOpen;
  label: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
};

const STEPS: Step[] = [
  {
    icon: Compass,
    label: 'Orientation',
    title: 'Welcome, future Technology Ethicist',
    description:
      "This site is a full course in the ethics of technology through science fiction. If you follow the path below end-to-end you'll finish with a Master Technology Ethicist certificate. Take it at your own pace — unlimited retakes on every quiz.",
  },
  {
    icon: BookOpenCheck,
    label: 'Step 1',
    title: 'Read the Textbook',
    description:
      'Start with the 12-chapter textbook. Each chapter pairs an essay with an original short story, a Knowledge Check quiz, reflections, and a chapter certificate. Pass all 12 Knowledge Checks to unlock the Textbook Final Exam — passing that earns the Textbook Master Certificate.',
    href: '/textbook',
    cta: 'Open the Textbook',
  },
  {
    icon: GraduationCap,
    label: 'Step 2',
    title: 'Complete the Official Learning Paths',
    description:
      "Official Learning Paths are platform-curated curricula aligned to the textbook. Each path walks you through a chapter, the philosophers and theories behind it, a story, a scenario for the Analyzer, and a reflection — and awards its own certificate on completion.",
    href: '/curriculum',
    cta: 'See the Official Paths',
  },
  {
    icon: ListChecks,
    label: 'Step 3',
    title: 'Apply the Tools Along the Way',
    description:
      "Use the Scenario Analyzer, Perspective Comparison, Framework Explorer, and Glossary as you go. Every Official Path points you back into these tools with concrete prompts. The AI Counselor and Devil's Advocate will push your reasoning.",
  },
  {
    icon: Trophy,
    label: 'Step 4',
    title: 'Take the Master Exam',
    description:
      'Once you hold the Textbook Master Certificate AND every Official Learning Path certificate, the Master Technology Ethicist Exam unlocks. It draws from the whole site — textbook chapters, ethical theories, sci-fi authors. Pass at 75% to earn the Master Certificate.',
    href: '/master-exam',
    cta: 'Preview the exam gate',
  },
  {
    icon: Sparkles,
    label: 'Capstone',
    title: 'Be recognized as a Master Technology Ethicist',
    description:
      'Your Master Certificate is a shareable, verifiable credential — a statement that you have studied the ethics of technology deeply, through philosophy AND through the science fiction that has been wrestling with these questions the longest.',
    href: '/certificates',
    cta: 'See your certificates',
  },
];

export function JourneyTourDialog({ trigger }: JourneyTourDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const Icon = s.icon;

  function reset() {
    setStep(0);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <Badge
            variant="outline"
            className="self-start text-[10px] border-primary/40 text-primary uppercase tracking-wider mb-2"
          >
            <RouteIcon className="h-3 w-3 mr-1" />
            {s.label}
          </Badge>
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-md bg-primary/10 p-2 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-primary">{s.title}</DialogTitle>
              <DialogDescription className="mt-2 text-foreground/80">
                {s.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 flex items-center gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i === step
                  ? 'bg-primary'
                  : i < step
                    ? 'bg-primary/50'
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex flex-wrap gap-2 items-center">
          {s.href && s.cta && (
            <Button asChild variant="outline">
              <Link href={s.href} onClick={() => setOpen(false)}>
                {s.cta}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          )}
          {/* Persistent "long read" link to the platform mental-model
              page. Visible on every step so the user can opt out of
              the tour into the calmer reading surface. */}
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
            <Link href="/help" onClick={() => setOpen(false)}>
              Read the full mental model
            </Link>
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setStep((i) => Math.max(0, i - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((i) => Math.min(STEPS.length - 1, i + 1))}>
                Next
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Button onClick={() => setOpen(false)}>
                Start the journey
                <BookOpen className="h-4 w-4 ml-1.5" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
