'use client';

/**
 * Last-resort error boundary. Catches errors thrown inside the root
 * `<RootLayout>` itself — i.e. errors so early they bypass the
 * authenticated `(app)` shell's error.tsx. When this fires, the layout
 * has crashed, so we rebuild a minimal `<html>`/`<body>` ourselves.
 *
 * Keep dependencies minimal: no providers, no Tailwind utilities that
 * rely on layout context. Inline styles only.
 */

import { useEffect } from 'react';
import { reportError } from '@/lib/observability/report';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[global-error]', error);
    reportError(error, {
      where: 'app/global-error',
      digest: error.digest,
      severity: 'fatal',
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: '#0a0e1a',
          color: '#e8ecf5',
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <main
          role="main"
          style={{
            maxWidth: 520,
            textAlign: 'center',
          }}
        >
          <div
            aria-hidden
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#66f9ff',
              marginBottom: 16,
              lineHeight: 1,
            }}
          >
            ⚠
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              margin: '0 0 12px 0',
              color: '#ffffff',
            }}
          >
            Something went badly wrong
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: '#a8b2c8',
              margin: '0 0 24px 0',
            }}
          >
            The site hit an unrecoverable error. We've been notified. You can
            try reloading, or head back to the home page.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 11,
                color: '#5e6a85',
                marginBottom: 24,
                fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                background: '#66f9ff',
                color: '#0a0e1a',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                background: 'transparent',
                color: '#66f9ff',
                border: '1px solid #66f9ff',
                padding: '10px 20px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
