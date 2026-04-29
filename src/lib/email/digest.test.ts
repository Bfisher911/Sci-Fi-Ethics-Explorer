// @vitest-environment node

/**
 * Tests for the weekly digest builder.
 *
 * Pure-function builder — no DB, no email send. We assert that:
 *   - the subject line and body adapt to streak / progress state
 *   - HTML escaping handles user-provided fields (no XSS leak)
 *   - the deep links use the supplied origin
 *   - opt-out / preference link is present
 */

import { describe, it, expect } from 'vitest';
import { buildDigestHtml, type DigestUserSummary, type DigestContext } from './digest';

const baseUser: DigestUserSummary = {
  userId: 'u1',
  email: 'jane@example.com',
  displayName: 'Jane Doe',
  chaptersPassedTotal: 3,
};

const baseCtx: DigestContext = {
  origin: 'https://test.example',
  openDebatesPreview: [],
  dilemma: null,
};

describe('buildDigestHtml', () => {
  it('greets the user by first name', () => {
    const { html, text, subject } = buildDigestHtml(baseUser, baseCtx);
    expect(html).toContain('Hi Jane,');
    expect(text).toContain('Hi Jane,');
    expect(subject).toMatch(/weekly Sci-Fi Ethics digest/i);
  });

  it('falls back to a generic greeting when display name is missing', () => {
    const { html } = buildDigestHtml(
      { ...baseUser, displayName: '' },
      baseCtx,
    );
    expect(html).toContain('Hi there,');
  });

  it('includes the streak in the subject when set', () => {
    const { subject, html } = buildDigestHtml(
      { ...baseUser, currentStreakDays: 5 },
      baseCtx,
    );
    expect(subject).toContain('5-day streak');
    expect(html).toContain('5-day streak');
  });

  it('omits the streak block when streak is zero', () => {
    const { subject, html } = buildDigestHtml(
      { ...baseUser, currentStreakDays: 0 },
      baseCtx,
    );
    expect(subject).not.toMatch(/streak/);
    expect(html).not.toMatch(/-day streak/);
  });

  it('builds absolute URLs against the supplied origin', () => {
    const { html, text } = buildDigestHtml(
      { ...baseUser, nextChapterSlug: '02-ethical-relativism' },
      baseCtx,
    );
    expect(html).toContain(
      'https://test.example/textbook/chapters/02-ethical-relativism',
    );
    expect(text).toContain(
      'https://test.example/textbook/chapters/02-ethical-relativism',
    );
  });

  it('falls back to the textbook landing when no next chapter is known', () => {
    const { html } = buildDigestHtml(baseUser, baseCtx);
    expect(html).toContain('https://test.example/textbook"');
  });

  it('escapes HTML in the display name to prevent injection', () => {
    const { html } = buildDigestHtml(
      { ...baseUser, displayName: '<script>alert(1)</script>Eve' },
      baseCtx,
    );
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders the dilemma section when one is provided', () => {
    const { html } = buildDigestHtml(baseUser, {
      ...baseCtx,
      dilemma: {
        id: 'd1',
        title: 'The Asimov Test',
        description: 'A short description.',
      },
    });
    expect(html).toContain('Dilemma of the day');
    expect(html).toContain('The Asimov Test');
    expect(html).toContain('https://test.example/stories/d1');
  });

  it('renders open debates when present', () => {
    const { html, text } = buildDigestHtml(baseUser, {
      ...baseCtx,
      openDebatesPreview: [
        { id: 'deb1', title: 'Should Skynet have a kill switch?' },
      ],
    });
    expect(html).toContain('Open debates');
    expect(html).toContain('Skynet');
    expect(html).toContain('https://test.example/debate-arena/deb1');
    expect(text).toContain('Skynet');
  });

  it('always exposes the preferences link in the footer', () => {
    const { html } = buildDigestHtml(baseUser, baseCtx);
    expect(html).toContain(
      'https://test.example/profile?tab=preferences',
    );
  });

  it('caps the dilemma description at 220 chars with an ellipsis', () => {
    const longDesc = 'x'.repeat(500);
    const { html } = buildDigestHtml(baseUser, {
      ...baseCtx,
      dilemma: {
        id: 'd2',
        title: 'Long one',
        description: longDesc,
      },
    });
    // Body should contain a 220-char truncation followed by an ellipsis.
    expect(html).toMatch(/x{220}…/);
    expect(html).not.toMatch(/x{221}/);
  });
});
