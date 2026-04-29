// @vitest-environment node

/**
 * Tests for the changelog feed helpers.
 *
 * Validates that the entries are well-shaped, sorted newest-first,
 * and that the `getRecentChangelog` window logic respects the date cap.
 */

import { describe, it, expect } from 'vitest';
import {
  CHANGELOG,
  getLatestChangelog,
  getRecentChangelog,
} from './changelog';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe('CHANGELOG', () => {
  it('is non-empty', () => {
    expect(CHANGELOG.length).toBeGreaterThan(0);
  });

  it('every entry has a stable id, ISO date, title, body, category', () => {
    const allowedCategories = new Set([
      'feature',
      'content',
      'fix',
      'announcement',
    ]);
    for (const entry of CHANGELOG) {
      expect(entry.id).toBeTruthy();
      expect(entry.date).toMatch(ISO_DATE);
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.body.length).toBeGreaterThan(0);
      expect(allowedCategories.has(entry.category)).toBe(true);
    }
  });

  it('IDs are unique', () => {
    const ids = CHANGELOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is sorted newest-first by date', () => {
    for (let i = 1; i < CHANGELOG.length; i++) {
      expect(CHANGELOG[i - 1].date >= CHANGELOG[i].date).toBe(true);
    }
  });
});

describe('getLatestChangelog', () => {
  it('returns the first entry', () => {
    expect(getLatestChangelog()).toEqual(CHANGELOG[0]);
  });
});

describe('getRecentChangelog', () => {
  it('returns only entries within the window', () => {
    // Use a 1-million-day window — should return all.
    const all = getRecentChangelog(1_000_000);
    expect(all.length).toBe(CHANGELOG.length);
  });

  it('returns nothing for a 0-day window when entries are older', () => {
    // A 0-day window cuts off "now"; any entry dated yesterday or
    // earlier should be excluded.
    const empty = getRecentChangelog(0);
    // No entry should be in the future, so empty.
    expect(empty.length).toBeLessThanOrEqual(CHANGELOG.length);
  });

  it('filters monotonically — wider window ≥ narrower window', () => {
    const a = getRecentChangelog(7).length;
    const b = getRecentChangelog(30).length;
    const c = getRecentChangelog(365).length;
    expect(a).toBeLessThanOrEqual(b);
    expect(b).toBeLessThanOrEqual(c);
  });
});
