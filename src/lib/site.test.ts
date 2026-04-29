// @vitest-environment node

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { absoluteUrl } from './site';

describe('absoluteUrl', () => {
  it('joins relative paths starting with /', async () => {
    const { absoluteUrl: au, SITE_URL } = await import('./site');
    expect(au('/foo')).toBe(`${SITE_URL}/foo`);
  });

  it('inserts a / when the path is missing one', async () => {
    const { absoluteUrl: au, SITE_URL } = await import('./site');
    expect(au('foo')).toBe(`${SITE_URL}/foo`);
  });

  it('returns the bare site URL when given an empty path', async () => {
    const { SITE_URL } = await import('./site');
    expect(absoluteUrl('')).toBe(SITE_URL);
  });

  it('preserves nested paths', async () => {
    const { absoluteUrl: au, SITE_URL } = await import('./site');
    expect(au('/textbook/chapters/01-foo')).toBe(
      `${SITE_URL}/textbook/chapters/01-foo`,
    );
  });
});
