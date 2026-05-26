import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import AppLayout from './layout';

vi.mock('next/navigation', () => ({
  usePathname: () => '/scifi-media/blade-runner',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', email: 'student@example.com' },
    claims: {},
    loading: false,
  }),
}));

vi.mock('@/hooks/use-subscription', () => ({
  useSubscription: () => ({
    subscriptionStatus: 'active',
    loading: false,
    isPaid: true,
    activeLicenseId: 'license-1',
  }),
}));

vi.mock('@/components/layout/app-header', () => ({
  AppHeader: () => <header>Header</header>,
}));

vi.mock('@/components/layout/app-sidebar', () => ({
  AppSidebar: () => <aside>Sidebar</aside>,
}));

vi.mock('@/components/layout/theme-switcher', () => ({
  ThemeVariantHydrator: () => null,
}));

vi.mock('@/components/admin/impersonation-banner', () => ({
  ImpersonationBanner: () => null,
}));

describe('AppLayout', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the signed-in shell without React list key warnings', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AppLayout>
        <div>Sci-Fi Media Detail</div>
      </AppLayout>,
    );

    expect(
      consoleError.mock.calls.some((call) =>
        String(call[0]).includes('Each child in a list should have a unique "key" prop'),
      ),
    ).toBe(false);
  });

  it('keeps authenticated shell siblings explicitly keyed for Next dev overlays', () => {
    const source = readFileSync(join(__dirname, 'layout.tsx'), 'utf8');

    expect(source).toContain('<ImpersonationBanner key="app-impersonation-banner" />');
    expect(source).toContain('<AppHeader key="app-header" />');
    expect(source).toContain('key="app-main-content"');
    expect(source).toContain('key="page-content"');
  });
});
