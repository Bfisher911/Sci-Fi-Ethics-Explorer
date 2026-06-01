import { describe, expect, it } from 'vitest';

import { buildReportSummary, activityTypeLabel, type ActivityReportInput } from './summary';

function input(overrides: Partial<ActivityReportInput>): ActivityReportInput {
  return {
    userId: 'u1',
    userName: 'Ada',
    activityType: 'other',
    activityId: 'a1',
    activityTitle: 'Untitled',
    ...overrides,
  } as ActivityReportInput;
}

describe('buildReportSummary', () => {
  it('summarizes a story with choices + reflection', () => {
    const s = buildReportSummary(
      input({
        activityType: 'story',
        activityTitle: 'The Last Upload',
        content: { choices: ['Refuse', 'Negotiate'], reflection: 'I valued autonomy.' },
      })
    );
    expect(s).toContain('The Last Upload');
    expect(s).toContain('2 choices');
    expect(s).toContain('Refuse → Negotiate');
    expect(s).toContain('autonomy');
  });

  it('includes outcome + framework breakdown for a story when present', () => {
    const s = buildReportSummary(
      input({
        activityType: 'story',
        activityTitle: 'The Forecast Division',
        content: {
          choices: ['Delay the notice'],
          outcome: 'I held the notice and investigated the context myself.',
          frameworkBreakdown: ['Virtue Ethics (50%)', 'Ethics of Care (30%)'],
          reflection: 'I refused to act on a number alone.',
        },
      })
    );
    expect(s).toContain('Outcome:');
    expect(s).toContain('Ethical frameworks:');
    expect(s).toContain('Virtue Ethics (50%)');
  });

  it('summarizes a passed quiz with score + threshold', () => {
    const s = buildReportSummary(
      input({
        activityType: 'quiz',
        activityTitle: 'Chapter 3 Knowledge Check',
        score: 86,
        passingThreshold: 70,
        passed: true,
      })
    );
    expect(s).toContain('86%');
    expect(s).toContain('passing 70%');
    expect(s).toContain('passed');
  });

  it('marks a failed quiz as did not pass', () => {
    const s = buildReportSummary(
      input({ activityType: 'quiz', activityTitle: 'Q', score: 40, passed: false })
    );
    expect(s).toContain('did not pass');
  });

  it('summarizes a dilemma with choice + reasoning', () => {
    const s = buildReportSummary(
      input({
        activityType: 'dilemma',
        activityTitle: 'The Trolley Update',
        content: { selectedOption: 'Pull the lever', reasoning: 'Fewer harmed.' },
      })
    );
    expect(s).toContain('Pull the lever');
    expect(s).toContain('Fewer harmed');
  });

  it('summarizes a debate with position', () => {
    const s = buildReportSummary(
      input({
        activityType: 'debate',
        activityTitle: 'AI Personhood',
        content: { position: 'pro', arguments: ['Sentience implies rights.'] },
      })
    );
    expect(s).toContain('pro position');
    expect(s).toContain('Sentience');
  });

  it('is defensive when content is missing', () => {
    const s = buildReportSummary(input({ activityType: 'story', activityTitle: 'X' }));
    expect(s).toContain('Completed the interactive story "X"');
  });

  it('labels activity types', () => {
    expect(activityTypeLabel('studio_reflect')).toBe('Studio Reflect');
    expect(activityTypeLabel('quiz')).toBe('Quiz');
    expect(activityTypeLabel('mystery')).toBe('Activity');
  });
});
