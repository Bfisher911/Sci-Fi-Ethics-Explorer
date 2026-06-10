import { describe, expect, it } from 'vitest';

import { isChunkLoadError } from './chunk-error';

describe('isChunkLoadError', () => {
  it('matches webpack ChunkLoadError by name', () => {
    const err = new Error('something failed');
    err.name = 'ChunkLoadError';
    expect(isChunkLoadError(err)).toBe(true);
  });

  it('matches "Loading chunk N failed" messages', () => {
    expect(
      isChunkLoadError(new Error('Loading chunk 6602 failed.')),
    ).toBe(true);
  });

  it('matches dynamic import failures (Safari/Firefox wording)', () => {
    expect(
      isChunkLoadError(
        new Error('Failed to fetch dynamically imported module: https://x'),
      ),
    ).toBe(true);
    expect(
      isChunkLoadError(new Error('Importing a module script failed.')),
    ).toBe(true);
  });

  it('does not match unrelated errors', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(
      false,
    );
    expect(isChunkLoadError(new Error('Network request failed'))).toBe(false);
  });
});
