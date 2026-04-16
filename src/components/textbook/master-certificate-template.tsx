'use client';

import type { Certificate } from '@/types';
import { Award, Sparkles } from 'lucide-react';

interface MasterCertificateTemplateProps {
  certificate: Certificate;
  /** Optional list of completed chapters to render on the certificate. */
  chapters?: Array<{ number: number; title: string }>;
}

/**
 * Premium master-certificate variant for the textbook capstone. Same
 * 11x8.5 aspect-ratio convention as <CertificateTemplate> so it can be
 * captured to PDF the same way.
 */
export function MasterCertificateTemplate({
  certificate,
  chapters,
}: MasterCertificateTemplateProps) {
  const issuedAt =
    certificate.issuedAt instanceof Date
      ? certificate.issuedAt
      : new Date(certificate.issuedAt as string | number);
  const formattedDate = issuedAt.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const verifyUrl = `scifi-ethics-explorer.netlify.app/verify/${certificate.verificationHash}`;

  return (
    <div
      className="master-certificate relative overflow-hidden mx-auto rounded-lg border-2"
      style={{
        width: '11in',
        height: '8.5in',
        maxWidth: '100%',
        aspectRatio: '11 / 8.5',
        background:
          'radial-gradient(circle at 30% 20%, hsl(var(--primary) / 0.18), transparent 60%), radial-gradient(circle at 80% 80%, hsl(var(--accent) / 0.15), transparent 55%), hsl(var(--card))',
        borderColor: 'hsl(var(--primary))',
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-25" aria-hidden>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1100 850"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="master-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="master-gold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect width="1100" height="850" fill="url(#master-grid)" />
          {/* Decorative bracket flourishes */}
          <path
            d="M 60 60 L 200 60 M 60 60 L 60 200"
            stroke="url(#master-gold)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 1040 60 L 900 60 M 1040 60 L 1040 200"
            stroke="url(#master-gold)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 60 790 L 200 790 M 60 790 L 60 650"
            stroke="url(#master-gold)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 1040 790 L 900 790 M 1040 790 L 1040 650"
            stroke="url(#master-gold)"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>

      <div className="absolute inset-5 border border-primary/40 rounded" />
      <div className="absolute inset-7 border border-accent/30 rounded" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-12 py-10">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-7 w-7 text-accent" />
          <Award className="h-12 w-12 text-primary" />
          <Sparkles className="h-7 w-7 text-accent" />
        </div>
        <p className="uppercase tracking-[0.5em] text-xs text-muted-foreground mb-3">
          Sci-Fi Ethics Explorer · Master Credential
        </p>
        <h1
          className="text-4xl md:text-5xl font-headline font-bold text-primary mb-1"
          style={{
            backgroundImage:
              'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Master Certificate
        </h1>
        <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-primary/80 to-transparent my-3" />

        <p className="text-base text-muted-foreground mb-3">This certifies that</p>
        <h2
          className="text-3xl md:text-4xl italic text-foreground mb-3 px-6 break-words"
          style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
        >
          {certificate.userName || 'Anonymous Explorer'}
        </h2>
        <p className="text-base text-muted-foreground mb-1">
          has read every chapter, passed every Knowledge Check, and completed the cumulative final exam for
        </p>
        <h3 className="text-xl md:text-2xl font-semibold text-primary mb-4 px-6 break-words">
          The Ethics of Technology Through Science Fiction
        </h3>

        {chapters && chapters.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1 text-[10px] text-muted-foreground/90 max-w-2xl">
            {chapters.map((c) => (
              <div key={c.number} className="truncate">
                Ch. {c.number}: {c.title}
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-4">
          Awarded on{' '}
          <span className="font-medium text-foreground">{formattedDate}</span>
        </p>
      </div>

      <div className="absolute bottom-3 left-0 right-0 text-center z-10">
        <p className="font-mono text-[10px] text-muted-foreground">Verify: {verifyUrl}</p>
      </div>
    </div>
  );
}
