import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest configuration.
 *
 * Test files live alongside source as `*.test.ts` / `*.test.tsx`.
 * Run via `npm run test` (single pass) or `npm run test:watch`.
 *
 * Globals are enabled so tests can use `describe` / `it` / `expect`
 * without imports — matching the Jest-flavored convention familiar to
 * most Next.js teams.
 *
 * The default jsdom environment lets us render React components in a
 * headless DOM. Pure logic tests can opt into 'node' via a `// @vitest-environment node` pragma at the top of the file.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      '.next',
      'out',
      'functions',
      'scifiethics',
      'scifiethicsexplorer',
    ],
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
