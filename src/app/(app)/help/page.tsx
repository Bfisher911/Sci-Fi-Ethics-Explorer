import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookText,
  GraduationCap,
  Trophy,
  Award,
  Microscope,
  Compass,
  GitCompare,
  MessageSquare,
  FlaskConical,
  Users,
  Scale,
  Library,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

/**
 * Help & Mental Model
 *
 * The single page that answers "what is this site, and how do I think about
 * it?" — the answer the sidebar can't give without crowding. Linked from
 * the user-menu Help item and from the journey tour.
 */
export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary font-headline">
              How this works
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Sci-Fi Ethics Explorer is a course in the ethics of technology,
            taught through the science fiction that&apos;s been wrestling with
            these questions for two centuries. Here&apos;s the shape of the
            platform in five paragraphs.
          </p>
        </CardContent>
      </Card>

      <section className="space-y-4 text-foreground/90 leading-relaxed">
        <p>
          <strong className="text-primary">Learn</strong> is the core of the
          experience: a 12-chapter <strong>textbook</strong> paired with{' '}
          <strong>learning paths</strong> &mdash; curated journeys that thread
          chapters, philosophers, frameworks, and stories into one coherent
          arc. Each chapter ends with a knowledge check that earns you a
          certificate. The capstone <strong>Master Exam</strong> unlocks once
          you&apos;ve completed the textbook and a breadth of activity across
          the platform; passing it earns you the{' '}
          <strong>Master Certificate</strong>.
        </p>

        <p>
          <strong className="text-primary">Practice</strong> is where you do
          the work: read interactive <strong>stories</strong> that branch
          based on choices you make, run a <strong>scenario</strong> through
          the <strong>Scenario Analyzer</strong>, take the{' '}
          <strong>Framework Explorer</strong> quiz to find your dominant
          ethical lens, compare frameworks side-by-side in{' '}
          <strong>Perspectives</strong>, or chat with the{' '}
          <strong>AI Counselor</strong> for an open-ended conversation. Every
          one of these activities counts toward your Master Exam progress.
        </p>

        <p>
          <strong className="text-primary">Community</strong> is where the
          platform stops being a textbook and starts being a place. Submit
          your own <strong>dilemmas</strong> for others to engage with, start
          or argue in <strong>debates</strong>, join live{' '}
          <strong>workshops</strong>, message other explorers directly, and
          join <strong>Communities</strong> &mdash; cohorts (often a class)
          that share progress dashboards and graded assignments.
        </p>

        <p>
          <strong className="text-primary">Library</strong> is the reference
          shelf: 22 <strong>philosophers</strong>, 18 ethical{' '}
          <strong>frameworks</strong>, 10+ <strong>sci-fi authors</strong>,
          and 66 <strong>sci-fi media artifacts</strong> with quizzes on every
          one. The <strong>blog</strong> publishes essays from{' '}
          <strong>Professor Paradox</strong> &mdash; the platform&apos;s
          official author identity &mdash; and the community.
        </p>

        <p>
          <strong className="text-primary">Roles &amp; access.</strong> Most
          users are <em>Members</em> &mdash; full access to everything above.{' '}
          <em>License admins</em> manage seats for an organization (a school,
          a department) and have admin tooling scoped to their license group
          only. The platform <em>super-admin</em> holds the keys to
          everything. If you&apos;re reading this, you&apos;re almost
          certainly a Member, and that&apos;s the entire design intent.
        </p>
      </section>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Where to go next</CardTitle>
          <CardDescription>
            Six entry points, ordered by what most people pick first.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <HelpLink
            href="/textbook"
            icon={BookText}
            title="Start the textbook"
            blurb="Chapter 1, ~30 minutes. The natural first move."
          />
          <HelpLink
            href="/framework-explorer"
            icon={Compass}
            title="Find your framework"
            blurb="A 10-minute quiz that names your dominant ethical lens."
          />
          <HelpLink
            href="/stories"
            icon={Microscope}
            title="Read a story"
            blurb="Branching sci-fi shorts with a personalized reflection at the end."
          />
          <HelpLink
            href="/curriculum"
            icon={GraduationCap}
            title="Pick a learning path"
            blurb="Six official paths, each ending in its own certificate."
          />
          <HelpLink
            href="/master-exam"
            icon={Trophy}
            title="Check Master Exam progress"
            blurb="The capstone exam and your activity-based prerequisites."
          />
          <HelpLink
            href="/communities"
            icon={Users}
            title="Join a community"
            blurb="Class or cohort? Find yours, or start one."
          />
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> Glossary of platform terms
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <Term name="Story" def="A piece of interactive sci-fi the platform publishes (Professor Paradox or community). Reading a story can branch on your choices and ends with a personalized reflection." />
          <Term name="Scenario" def="A free-form ethical situation you describe to the Scenario Analyzer for a multi-framework analysis." />
          <Term name="Dilemma" def="A short prompt a community member submits, scoped to a community. Lives under Community → Dilemmas." />
          <Term name="Learning Path" def="A curated curriculum that strings together chapters, philosophers, frameworks, stories, and exercises. Awards a certificate on completion." />
          <Term name="Framework Explorer" def="A self-assessment quiz that scores you across the major ethical frameworks and identifies your dominant one." />
          <Term name="Perspectives" def="A side-by-side comparison: how would Utilitarianism vs Deontology vs Virtue Ethics evaluate the same choice?" />
          <Term name="AI Counselor" def="An open-ended chat with an AI ethics counselor. Two modes: standard counsel, and a devil's-advocate mode that argues against you." />
          <Term name="Master Certificate" def="The capstone credential. Earned by passing the Master Exam after clearing the activity prerequisites." />
          <Term name="Professor Paradox" def="The platform's official author identity for first-party content (textbook, official paths, official stories, blog essays)." />
          <Term name="Community" def="A cohort (often a classroom) with shared progress and graded assignments. Different from a Workshop, which is a live event with a fixed time window." />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Still stuck? Your course administrator (the person who assigned you a
        seat) is the fastest route. Or message any platform admin from the{' '}
        <Link href="/directory" className="text-primary hover:underline">
          People directory
        </Link>
        .
      </p>
    </div>
  );
}

function HelpLink({
  href,
  icon: Icon,
  title,
  blurb,
}: {
  href: string;
  icon: typeof BookText;
  title: string;
  blurb: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-auto justify-start py-3 text-left"
    >
      <Link href={href} className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <span className="flex-1 min-w-0">
          <span className="block font-semibold">{title}</span>
          <span className="block text-xs font-normal text-muted-foreground line-clamp-2">
            {blurb}
          </span>
        </span>
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </Button>
  );
}

function Term({ name, def }: { name: string; def: string }) {
  return (
    <div>
      <div className="font-semibold text-foreground">{name}</div>
      <div className="text-muted-foreground">{def}</div>
    </div>
  );
}
