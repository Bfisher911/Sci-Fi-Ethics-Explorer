'use client';

import type { Certificate } from '@/types';
import { Award } from 'lucide-react';

interface CertificateTemplateProps {
  certificate: Certificate;
}

/**
 * A presentational sci-fi themed certificate of completion. Rendered at an
 * A4-ish landscape aspect ratio (11x8.5 inches) so it looks correct when
 * printed or captured as a PDF.
 */
export function CertificateTemplate({ certificate }: CertificateTemplateProps) {
  const issuedAt =
    certificate.issuedAt instanceof Date
      ? certificate.issuedAt
      : new Date(certificate.issuedAt);
  const formattedDate = issuedAt.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const verifyUrl = `scifi-ethics-explorer.netlify.app/verify/${certificate.verificationHash}`;

  return (
    <div
      className="certificate-template relative bg-card border-2 border-primary rounded-lg overflow-hidden mx-auto"
      style={{
        width: '11in',
        height: '8.5in',
        maxWidth: '100%',
        aspectRatio: '11 / 8.5',
      }}
    >
      {/* Sci-fi geometric background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        aria-hidden="true"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1100 850"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="cert-glow" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <pattern id="cert-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1100" height="850" fill="url(#cert-grid)" />
          <rect width="1100" height="850" fill="url(#cert-glow)" />
          {/* Corner flourishes */}
          <polyline
            points="20,20 140,20 140,40"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <polyline
            points="1080,20 960,20 960,40"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <polyline
            points="20,830 140,830 140,810"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <polyline
            points="1080,830 960,830 960,810"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Inner border */}
      <div className="absolute inset-4 border border-primary/40 rounded" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-16 py-12">
        <div className="flex items-center gap-3 mb-6">
          <Award className="h-10 w-10 text-primary" />
          <span className="uppercase tracking-[0.4em] text-sm text-muted-foreground">
            Sci-Fi Ethics Explorer
          </span>
          <Award className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-5xl font-headline font-bold text-primary mb-2">
          Certificate of Completion
        </h1>
        <div className="w-24 h-0.5 bg-primary/60 my-4" />

        <p className="text-lg text-muted-foreground mb-6">This certifies that</p>

        <h2
          className="text-4xl md:text-5xl font-serif italic text-foreground mb-6 px-8 break-words"
          style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
        >
          {certificate.userName || 'Anonymous Explorer'}
        </h2>

        <p className="text-lg text-muted-foreground mb-2">
          has successfully completed the curriculum
        </p>

        <h3 className="text-2xl md:text-3xl font-semibold text-primary mb-8 px-8 break-words">
          {certificate.curriculumTitle}
        </h3>

        <p className="text-base text-muted-foreground">
          Awarded on{' '}
          <span className="font-medium text-foreground">{formattedDate}</span>
        </p>
      </div>

      {/* Verification footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="font-mono text-xs text-muted-foreground">
          Verify: {verifyUrl}
        </p>
      </div>
    </div>
  );
}
