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
