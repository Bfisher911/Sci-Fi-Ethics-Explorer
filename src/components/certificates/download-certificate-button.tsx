'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import type { Certificate } from '@/types';
import { CertificateTemplate } from './certificate-template';

interface DownloadCertificateButtonProps {
  certificate: Certificate;
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Opens a print-ready window containing a fully self-contained HTML
 * certificate (inline styles, no external CSS dependencies) and triggers
 * the browser's print dialog. The user can then "Save as PDF".
 *
 * The previous implementation cloned the React-rendered DOM via outerHTML,
 * which inherited the off-screen positioning of the hidden source element
 * AND depended on Tailwind/CSS-variable resolution that often failed in
 * the popup. This version builds the certificate HTML from scratch so it
 * always renders correctly regardless of theme tokens or external CSS.
 */
export function DownloadCertificateButton({
  certificate,
  variant = 'default',
  size = 'sm',
  className,
}: DownloadCertificateButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  function handleDownload(): void {
    if (!certificate || !certificate.id) {
      console.error('[certificate] missing certificate data — cannot print');
      return;
    }

    setIsPrinting(true);
    try {
      const html = buildCertificateHtml(certificate);
      const printWindow = window.open('', '_blank', 'width=1100,height=850');
      if (!printWindow) {
        console.warn('[certificate] popup blocked — falling back to in-page print');
        inPagePrintFallback(certificate);
        setIsPrinting(false);
        return;
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();

      // Wait for layout/fonts/SVG to settle before triggering print.
      // 600ms is generous; the user can still cancel the dialog.
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (err) {
          console.error('[certificate] print failed:', err);
        }
        setIsPrinting(false);
      }, 600);
    } catch (err) {
      console.error('[certificate] download failed:', err);
      setIsPrinting(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isPrinting}
      className={className}
    >
      {isPrinting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Download PDF
    </Button>
  );
}

function escapeHtml(s: string | undefined | null): string {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatIssuedAt(certificate: Certificate): string {
  const date =
    certificate.issuedAt instanceof Date
      ? certificate.issuedAt
      : new Date(certificate.issuedAt as any);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Build a fully self-contained certificate HTML document. All styling is
 * inline so no external CSS or theme tokens are required.
 */
function buildCertificateHtml(certificate: Certificate): string {
  const userName = escapeHtml(certificate.userName || 'Anonymous Explorer');
  const curriculumTitle = escapeHtml(
    certificate.curriculumTitle || 'Curriculum'
  );
  const formattedDate = escapeHtml(formatIssuedAt(certificate));
  const verifyUrl = `https://scifi-ethics-explorer.netlify.app/verify/${escapeHtml(
    certificate.verificationHash || ''
  )}`;
  const verifyDisplay = `scifi-ethics-explorer.netlify.app/verify/${escapeHtml(
    certificate.verificationHash || ''
  )}`;
  const docTitle = `Certificate - ${curriculumTitle}`;

  // Theme constants — chosen so the certificate looks polished without
  // depending on any CSS variable.
  const PRIMARY = '#7DF9FF'; // electric blue
  const PRIMARY_GLOW = '#7DF9FF';
  const BG = '#0a0e27'; // deep navy
  const CARD = '#0d1530';
  const TEXT = '#e6f1ff';
  const MUTED = '#8a9bbc';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(docTitle)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,500;1,700&family=JetBrains+Mono:wght@400&display=swap"
      rel="stylesheet"
    />
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        background: ${BG};
        color: ${TEXT};
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 0.25in;
      }
      .certificate {
        position: relative;
        width: 11in;
        height: 8.5in;
        background: ${CARD};
        border: 2px solid ${PRIMARY};
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 0 80px ${PRIMARY_GLOW}33;
      }
      .grid-bg {
        position: absolute;
        inset: 0;
        opacity: 0.18;
        pointer-events: none;
      }
      .inner-border {
        position: absolute;
        inset: 0.25in;
        border: 1px solid ${PRIMARY}66;
        border-radius: 6px;
        pointer-events: none;
      }
      .content {
        position: relative;
        z-index: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 0.75in 1in;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 28px;
        text-transform: uppercase;
        letter-spacing: 0.4em;
        font-size: 11px;
        color: ${MUTED};
      }
      .brand-icon { color: ${PRIMARY}; font-size: 24px; line-height: 1; }
      h1 {
        margin: 0 0 8px;
        font-size: 48px;
        font-weight: 700;
        color: ${PRIMARY};
        letter-spacing: -0.02em;
      }
      .divider {
        width: 96px;
        height: 2px;
        background: ${PRIMARY}99;
        margin: 16px auto 28px;
      }
      .label {
        margin: 0 0 12px;
        font-size: 16px;
        color: ${MUTED};
      }
      .name {
        margin: 0 0 28px;
        font-family: 'Playfair Display', Georgia, serif;
        font-style: italic;
        font-weight: 500;
        font-size: 56px;
        color: ${TEXT};
        line-height: 1.1;
        word-wrap: break-word;
      }
      .curriculum {
        margin: 0 0 36px;
        font-size: 28px;
        font-weight: 600;
        color: ${PRIMARY};
        line-height: 1.2;
        word-wrap: break-word;
      }
      .date-line {
        margin: 0;
        font-size: 16px;
        color: ${MUTED};
      }
      .date-line strong { color: ${TEXT}; font-weight: 500; }
      .verify {
        position: absolute;
        bottom: 0.4in;
        left: 0;
        right: 0;
        text-align: center;
        z-index: 1;
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        font-size: 11px;
        color: ${MUTED};
      }
      .verify a { color: ${MUTED}; text-decoration: none; }
      @page { size: 11in 8.5in; margin: 0; }
      @media print {
        body { background: white; padding: 0; min-height: auto; }
        .certificate {
          box-shadow: none;
          border-radius: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="certificate">
      <svg
        class="grid-bg"
        viewBox="0 0 1100 850"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="cert-glow" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stop-color="${PRIMARY}" stop-opacity="0.35" />
            <stop offset="100%" stop-color="${PRIMARY}" stop-opacity="0" />
          </radialGradient>
          <pattern id="cert-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${PRIMARY}" stroke-width="0.5" />
          </pattern>
        </defs>
        <rect width="1100" height="850" fill="url(#cert-grid)" />
        <rect width="1100" height="850" fill="url(#cert-glow)" />
        <polyline points="20,20 140,20 140,40" fill="none" stroke="${PRIMARY}" stroke-width="2" />
        <polyline points="1080,20 960,20 960,40" fill="none" stroke="${PRIMARY}" stroke-width="2" />
        <polyline points="20,830 140,830 140,810" fill="none" stroke="${PRIMARY}" stroke-width="2" />
        <polyline points="1080,830 960,830 960,810" fill="none" stroke="${PRIMARY}" stroke-width="2" />
      </svg>

      <div class="inner-border"></div>

      <div class="content">
        <div class="brand">
          <span class="brand-icon">◆</span>
          Sci-Fi Ethics Explorer
          <span class="brand-icon">◆</span>
        </div>

        <h1>Certificate of Completion</h1>
        <div class="divider"></div>

        <p class="label">This certifies that</p>
        <h2 class="name">${userName}</h2>

        <p class="label">has successfully completed the curriculum</p>
        <h3 class="curriculum">${curriculumTitle}</h3>

        <p class="date-line">Awarded on <strong>${formattedDate}</strong></p>
      </div>

      <div class="verify">
        <a href="${verifyUrl}">Verify: ${verifyDisplay}</a>
      </div>
    </div>
    <script>
      // If the parent calls window.print() before fonts load, the certificate
      // could render with fallback fonts. Ensure fonts are ready first.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.catch(function () {});
      }
    </script>
  </body>
</html>`;
}

/**
 * Fallback used when popups are blocked: render the React template inline
 * (positioned, not off-screen) and trigger an in-page print.
 */
function inPagePrintFallback(certificate: Certificate): void {
  const id = `certificate-print-overlay-${certificate.id}`;
  let host = document.getElementById(id) as HTMLDivElement | null;
  if (host) host.remove();

  // Inject a print stylesheet that hides everything else.
  const styleId = `certificate-print-style-${certificate.id}`;
  let style = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #${id}, #${id} * { visibility: visible !important; }
        #${id} {
          position: fixed !important;
          inset: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 999999 !important;
        }
        @page { size: 11in 8.5in; margin: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Use the inline self-contained HTML so styles/colors are preserved.
  host = document.createElement('div');
  host.id = id;
  host.style.position = 'fixed';
  host.style.inset = '0';
  host.style.zIndex = '-1';
  host.style.visibility = 'hidden';
  host.innerHTML = buildCertificateHtml(certificate);
  document.body.appendChild(host);

  setTimeout(() => {
    try {
      window.print();
    } finally {
      // Clean up after a short delay so the print preview can render.
      setTimeout(() => {
        host?.remove();
        style?.remove();
      }, 1000);
    }
  }, 200);
}

/**
 * Kept for backward compatibility; the new download flow does not require
 * a hidden DOM source. This component renders nothing now but stays
 * exported so existing imports don't break.
 */
export function HiddenCertificate(_: { certificate: Certificate }) {
  // No-op: download builds the certificate HTML from data, not the DOM.
  return null;
}
