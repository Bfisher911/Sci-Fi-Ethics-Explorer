/**
 * Shared types + constants for the AI ethical-journey report.
 *
 * These live OUTSIDE the `'use server'` flow file because a server-action
 * module may only export async functions — exporting a constant or a
 * type from it triggers a Next.js build error. Both the flow and the
 * client card import from here.
 */

/** Minimum decisions required before a meaningful report can be written. */
export const MIN_DECISIONS_FOR_REPORT = 3;

export type EthicsReportErrorCode =
  | 'missing_api_key'
  | 'rate_limited'
  | 'upstream_error'
  | 'insufficient_data'
  | 'empty_output'
  | 'parse_error';

export interface EthicsReport {
  /** 2–3 sentence headline characterizing the reader's ethical style. */
  reflectiveSummary: string;
  /** The reader's dominant frameworks, each with a grounded gloss. */
  dominantFrameworks: { framework: string; summary: string }[];
  /** Patterns observed across decisions. */
  patterns: string[];
  /** Concrete examples tied to specific choices the reader made. */
  examples: { choice: string; insight: string }[];
  /** Ethical tensions / tradeoffs evident in the choices. */
  tensions: string[];
  error?: string;
  errorCode?: EthicsReportErrorCode;
}

/** The two kinds of report a student can generate. */
export type ReportType = 'ethical_profile' | 'role_fit';

/**
 * Role Fit Reflection Report — translates a student's ethical
 * tendencies into possible technology-role strengths. Written
 * carefully as a REFLECTION tool, never a deterministic hiring test:
 * it always carries the educational caveat and frames strengths as
 * "may be useful," not "you are suited only for."
 */
export interface RoleFitReport {
  /** 2–3 sentence framing of how the student's ethical instincts might
   *  show up in technology work. */
  summary: string;
  /** The top ethical tendencies the role suggestions are grounded in. */
  topTendencies: string[];
  /** How those tendencies may show up in workplace decision-making. */
  workplaceBehaviors: string[];
  /** Possible strengths. */
  strengths: string[];
  /** Possible blind spots to stay aware of. */
  blindSpots: string[];
  /** Technology roles / responsibilities where these instincts may be useful. */
  roleAffinities: { role: string; why: string }[];
  /** Teams or decisions where the student may offer a helpful perspective. */
  helpfulPerspectiveFor: string[];
  /** Reflection questions for the student to sit with. */
  reflectionQuestions: string[];
  /** The mandatory educational caveat (reflection, not diagnosis/hiring). */
  caveat: string;
  error?: string;
  errorCode?: EthicsReportErrorCode;
}
