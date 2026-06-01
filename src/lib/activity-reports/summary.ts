/**
 * Pure activity-report summary builder.
 *
 * Turns the standardized completion data each activity screen passes in into a
 * human-readable evidence summary. No Firestore, no React — unit-testable. The
 * `activity-reports` service calls this; nothing else needs report logic.
 */

import type { ActivityReportType } from '@/types';

/** Standardized completion data every activity screen passes to the service. */
export interface ActivityReportInput {
  userId: string;
  userName: string;
  activityType: ActivityReportType;
  /** e.g. quiz subjectType ('philosopher' | 'book-chapter' | …). */
  activitySubtype?: string;
  activityId: string;
  activityTitle: string;
  score?: number;
  passingThreshold?: number;
  passed?: boolean;
  /** ISO; the service defaults to now when omitted. */
  completedAt?: string;
  /** Type-specific evidence (choices, response, frameworkAlignment, …). */
  content?: Record<string, any>;
  /**
   * Per-playthrough token. When present, the report doc id is scoped to this
   * attempt so each replay is its own immutable record (used by stories).
   * Omit for idempotent activities (one report per user+activity).
   */
  attemptKey?: string;
}

function asList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}
function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}
function truncate(s: string, n = 160): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

/**
 * Build a clear, type-specific summary of what the student did. Defensive about
 * missing content fields so any activity can call it.
 */
export function buildReportSummary(input: ActivityReportInput): string {
  const c = input.content ?? {};
  const title = input.activityTitle || 'this activity';

  switch (input.activityType) {
    case 'story': {
      const choices = asList(c.choices).length ? asList(c.choices) : asList(c.decisionPath);
      const reflection = str(c.reflection);
      const outcome = str(c.outcome) || str(c.endingText);
      const frameworks = asList(c.frameworkBreakdown).length
        ? asList(c.frameworkBreakdown)
        : str(c.frameworkAlignment)
          ? [str(c.frameworkAlignment)]
          : [];
      const parts = [`Completed the interactive story "${title}".`];
      if (choices.length) {
        parts.push(
          `Made ${choices.length} ${choices.length === 1 ? 'choice' : 'choices'}: ${truncate(choices.join(' → '))}.`
        );
      }
      if (outcome) parts.push(`Outcome: ${truncate(outcome)}`);
      if (frameworks.length) {
        parts.push(`Ethical frameworks: ${truncate(frameworks.join(', '), 120)}.`);
      }
      if (reflection) parts.push(`Reflection: ${truncate(reflection)}`);
      return parts.join(' ');
    }
    case 'quiz': {
      const score = typeof input.score === 'number' ? `${input.score}%` : 'an attempt';
      const thr =
        typeof input.passingThreshold === 'number'
          ? ` (passing ${input.passingThreshold}%)`
          : '';
      const status =
        input.passed === true ? 'passed' : input.passed === false ? 'did not pass' : 'completed';
      return `Completed the "${title}" quiz with ${score}${thr} — ${status}.`;
    }
    case 'dilemma': {
      const opt = str(c.selectedOption) || str(c.choice);
      const reasoning = str(c.reasoning) || str(c.response);
      const parts = [`Worked through the ethical dilemma "${title}".`];
      if (opt) parts.push(`Chose: ${truncate(opt, 120)}.`);
      if (reasoning) parts.push(`Reasoning: ${truncate(reasoning)}`);
      return parts.join(' ');
    }
    case 'debate': {
      const position = str(c.position);
      const parts = [`Participated in the debate "${title}".`];
      if (position) parts.push(`Argued the ${position} position.`);
      const args = asList(c.arguments);
      if (args.length) parts.push(`Key argument: ${truncate(args[0])}`);
      const reflection = str(c.reflection);
      if (reflection) parts.push(`Reflection: ${truncate(reflection)}`);
      return parts.join(' ');
    }
    case 'studio_analysis': {
      const scenario = str(c.scenario) || str(c.prompt);
      const parts = ['Completed a Studio scenario analysis.'];
      if (scenario) parts.push(`Scenario: ${truncate(scenario)}`);
      const tags = asList(c.tags).concat(asList(c.applicableEthicalTheories));
      if (tags.length) parts.push(`Frameworks/themes: ${tags.slice(0, 5).join(', ')}.`);
      return parts.join(' ');
    }
    case 'studio_compare': {
      const scenario = str(c.scenario) || str(c.prompt);
      const choice = str(c.userChoice);
      const parts = ['Completed a Studio perspective comparison.'];
      if (scenario) parts.push(`Scenario: ${truncate(scenario)}`);
      if (choice) parts.push(`Their position: ${truncate(choice, 120)}.`);
      return parts.join(' ');
    }
    case 'studio_reflect': {
      const prompt = str(c.prompt) || title;
      const response = str(c.response) || str(c.reflection);
      const parts = [`Completed a Studio reflection on "${truncate(prompt, 100)}".`];
      if (response) parts.push(`Response: ${truncate(response)}`);
      return parts.join(' ');
    }
    case 'framework_explorer': {
      const fw = str(c.frameworkAlignment);
      const parts = [`Completed the Framework Explorer activity "${title}".`];
      if (fw) parts.push(`Leading ethical framework: ${fw}.`);
      return parts.join(' ');
    }
    case 'media_reflection': {
      const prompt = str(c.prompt);
      const response = str(c.response) || str(c.reflection);
      const parts = [`Completed an ethical reflection on "${title}".`];
      if (prompt) parts.push(`Prompt: ${truncate(prompt, 120)}`);
      if (response) parts.push(`Response: ${truncate(response)}`);
      return parts.join(' ');
    }
    default:
      return `Completed "${title}".`;
  }
}

/** Short label for an activity type, used in lists + the PDF. */
export function activityTypeLabel(type: string): string {
  const map: Record<string, string> = {
    story: 'Story',
    quiz: 'Quiz',
    dilemma: 'Dilemma',
    debate: 'Debate',
    studio_analysis: 'Studio Analysis',
    studio_compare: 'Studio Compare',
    studio_reflect: 'Studio Reflect',
    framework_explorer: 'Framework Explorer',
    media_reflection: 'Media Reflection',
    other: 'Activity',
  };
  return map[type] ?? 'Activity';
}

/**
 * Title for the printed badge/certificate — distinguishes the smaller evidence
 * badges (story, quiz, module) from the major milestone certificates. Used as
 * the PDF heading + the evidence panel heading.
 */
export function badgeLabel(type: string): string {
  const map: Record<string, string> = {
    story: 'Story Completion Badge',
    quiz: 'Quiz Completion Certificate',
    framework_explorer: 'Framework Explorer Module Certificate',
    dilemma: 'Dilemma Activity Report',
    debate: 'Debate Activity Report',
    studio_analysis: 'Studio Analysis Report',
    studio_compare: 'Studio Comparison Report',
    studio_reflect: 'Studio Reflection Report',
    media_reflection: 'Media Reflection Report',
    other: 'Activity Completion Report',
  };
  return map[type] ?? 'Activity Completion Report';
}

/** Download-button label per activity type. */
export function downloadLabel(type: string): string {
  const map: Record<string, string> = {
    story: 'Download Story Badge',
    quiz: 'Download Quiz Certificate',
    framework_explorer: 'Download Module Certificate',
  };
  return map[type] ?? 'Download PDF';
}
