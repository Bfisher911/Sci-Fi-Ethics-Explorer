/**
 * Vitest setup — runs once before each test file.
 *
 * Pulls in @testing-library/jest-dom matchers so tests can use
 * `.toBeInTheDocument()`, `.toHaveAttribute()`, etc. on rendered
 * components. No global mocks here — tests should be explicit about
 * what they fake.
 */

import '@testing-library/jest-dom/vitest';
