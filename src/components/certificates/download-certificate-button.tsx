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
 * Renders a download button that, when clicked, opens a print-ready window
 * containing just the certificate and triggers the browser's print dialog.
 * Users can then "Save as PDF" from the native dialog.
 *
 * This approach requires no extra dependencies. If `jspdf` / `html2canvas`
 * become available later, the click handler can be swapped to produce a
 * PDF directly.
 */
export function DownloadCertificateButton({
  certificate,
  variant = 'default',
  size = 'sm',
  className,
}: DownloadCertificateButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  function handleDownload(): void {
    setIsPrinting(true);
    try {
      const elementId = `certificate-${certificate.id}`;
      const source = document.getElementById(elementId);
      if (!source) {
        console.error(
          `[certificate] element #${elementId} not found — cannot print`
        );
        setIsPrinting(false);
        return;
      }

      // Collect current document styles so the print window looks correct
      // (Tailwind variables, fonts, etc.).
      const styleTags = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]')
      )
        .map((n) => n.outerHTML)
        .join('\n');

      const printWindow = window.open('', '_blank', 'width=1100,height=850');
      if (!printWindow) {
        // Popup blocked — fall back to in-page print using a scoped stylesheet.
        inPagePrint(elementId);
        setIsPrinting(false);
        return;
      }

      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Certificate - ${escapeHtml(certificate.curriculumTitle)}</title>
            <meta charset="utf-8" />
            ${styleTags}
            <style>
              html, body {
                margin: 0;
                padding: 0;
                background: #0a0a0a;
              }
              body {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 0.25in;
              }
              @page {
                size: 11in 8.5in;
                margin: 0;
              }
              @media print {
                body { background: #ffffff; padding: 0; }
              }
            </style>
          </head>
          <body class="dark">
            ${source.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();

      // Give the browser a moment to load styles + fonts before printing.
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (err) {
          console.error('[certificate] print failed:', err);
        }
        setIsPrinting(false);
      }, 400);
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Fallback used when popups are blocked: briefly toggle a print-only class
 * that hides everything except the certificate, then call window.print().
 */
function inPagePrint(elementId: string): void {
  const styleId = 'certificate-print-style';
  let style = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #${elementId}, #${elementId} * { visibility: visible !important; }
        #${elementId} {
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
  window.print();
}

/**
 * Renders the hidden certificate template for the download button to reference.
 * Place this alongside any DownloadCertificateButton instance.
 */
export function HiddenCertificate({
  certificate,
}: {
  certificate: Certificate;
}) {
  return (
    <div
      id={`certificate-${certificate.id}`}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '-10000px',
        top: 0,
        pointerEvents: 'none',
      }}
    >
      <CertificateTemplate certificate={certificate} />
    </div>
  );
}
