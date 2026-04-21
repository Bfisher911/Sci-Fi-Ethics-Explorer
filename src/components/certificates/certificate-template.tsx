'use client';

import type { Certificate } from '@/types';
import { Award, Users } from 'lucide-react';
import { effectiveTier } from '@/lib/certificate-tier';

interface CertificateTemplateProps {
  certificate: Certificate;
}

/**
 * A presentational sci-fi themed certificate. Branches visually on
 * tier:
 *   - OFFICIAL: the original cyan/Award look — platform-endorsed,
 *     carries "Certificate of Completion", full formal framing.
 *   - COMMUNITY: magenta/Users look, headed "Community Certificate
 *     of Completion", with a ribbon declaring peer-issuance and a
 *     footer disclosing it is not a platform-endorsed credential.
 *
 * Rendered at 11x8.5in landscape so print/PDF capture is correct.
 */
export function CertificateTemplate({ certificate }: CertificateTemplateProps) {
  const tier = effectiveTier(certificate);
  const isCommunity = tier === 'community';

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

  // Tier-specific styling tokens. Kept as explicit CSS vars so the
  // two variants are easy to read side by side.
  const accent = isCommunity ? 'hsl(var(--accent))' : 'hsl(var(--primary))';
  const accentSoft = isCommunity
    ? 'hsl(var(--accent) / 0.35)'
    : 'hsl(var(--primary) / 0.35)';
  const accentFaint = isCommunity
    ? 'hsl(var(--accent) / 0.4)'
    : 'hsl(var(--primary) / 0.4)';
  const HeaderIcon = isCommunity ? Users : Award;
  const headline = isCommunity
    ? 'Community Certificate of Completion'
    : 'Certificate of Completion';
  const eyebrow = isCommunity
    ? 'Sci-Fi Ethics Explorer · Community Path'
    : 'Sci-Fi Ethics Explorer';

  return (
    <div
      className="certificate-template relative bg-card rounded-lg overflow-hidden mx-auto"
      style={{
        width: '11in',
        height: '8.5in',
        maxWidth: '100%',
        aspectRatio: '11 / 8.5',
        border: `2px ${isCommunity ? 'dashed' : 'solid'} ${accent}`,
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
            <radialGradient id={`cert-glow-${tier}`} cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            {isCommunity ? (
              // Community variant: diagonal hatch pattern (distinct from
              // the grid used for official certs).
              <pattern
                id={`cert-hatch-${tier}`}
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="20"
                  stroke={accent}
                  strokeWidth="0.6"
                />
              </pattern>
            ) : (
              <pattern
                id={`cert-grid-${tier}`}
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={accent}
                  strokeWidth="0.5"
                />
              </pattern>
            )}
          </defs>
          <rect
            width="1100"
            height="850"
            fill={`url(#${isCommunity ? `cert-hatch-${tier}` : `cert-grid-${tier}`})`}
          />
          <rect width="1100" height="850" fill={`url(#cert-glow-${tier})`} />
          {/* Corner flourishes — same geometry, tier-colored */}
          <polyline
            points="20,20 140,20 140,40"
            fill="none"
            stroke={accent}
            strokeWidth="2"
          />
          <polyline
            points="1080,20 960,20 960,40"
            fill="none"
            stroke={accent}
            strokeWidth="2"
          />
          <polyline
            points="20,830 140,830 140,810"
            fill="none"
            stroke={accent}
            strokeWidth="2"
          />
          <polyline
            points="1080,830 960,830 960,810"
            fill="none"
            stroke={accent}
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Inner border */}
      <div
        className="absolute inset-4 rounded"
        style={{ border: `1px ${isCommunity ? 'dashed' : 'solid'} ${accentFaint}` }}
      />

      {/* Community-tier corner ribbon — makes the tier unmistakable
          even in a thumbnail. Positioned top-right, 45° rotation. */}
      {isCommunity && (
        <div
          className="absolute top-0 right-0 overflow-hidden pointer-events-none"
          style={{ width: 180, height: 180 }}
          aria-hidden="true"
        >
          <div
            className="absolute font-bold tracking-[0.25em] text-[11px] text-center"
            style={{
              background: 'hsl(var(--accent))',
              color: 'hsl(var(--accent-foreground, #fff))',
              width: 260,
              right: -70,
              top: 40,
              transform: 'rotate(45deg)',
              padding: '6px 0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
            }}
          >
            COMMUNITY
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-16 py-12">
        <div className="flex items-center gap-3 mb-6">
          <HeaderIcon className="h-10 w-10" style={{ color: accent }} />
          <span className="uppercase tracking-[0.4em] text-sm text-muted-foreground">
            {eyebrow}
          </span>
          <HeaderIcon className="h-10 w-10" style={{ color: accent }} />
        </div>

        <h1
          className="font-headline font-bold mb-2"
          style={{
            color: accent,
            fontSize: isCommunity ? '2.75rem' : '3rem',
          }}
        >
          {headline}
        </h1>
        <div
          className="w-24 h-0.5 my-4"
          style={{ background: accentSoft }}
        />

        <p className="text-lg text-muted-foreground mb-6">This certifies that</p>

        <h2
          className="text-4xl md:text-5xl font-serif italic text-foreground mb-6 px-8 break-words"
          style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
        >
          {certificate.userName || 'Anonymous Explorer'}
        </h2>

        <p className="text-lg text-muted-foreground mb-2">
          has successfully completed the {isCommunity ? 'community-authored ' : ''}curriculum
        </p>

        <h3
          className="text-2xl md:text-3xl font-semibold mb-4 px-8 break-words"
          style={{ color: accent }}
        >
          {certificate.curriculumTitle}
        </h3>

        {/* Issuer line — shows who authored the path. Only rendered
            when we know it (community certs in particular benefit). */}
        {certificate.issuerName && (
          <p className="text-sm text-muted-foreground mb-4">
            Authored by{' '}
            <span className="font-medium text-foreground">
              {certificate.issuerName}
            </span>
          </p>
        )}

        <p className="text-base text-muted-foreground">
          Awarded on{' '}
          <span className="font-medium text-foreground">{formattedDate}</span>
        </p>
      </div>

      {/* Footer — verification hash +, for community tier, an
          explicit disclosure so recipients understand the scope. */}
      <div className="absolute bottom-4 left-0 right-0 z-10 px-6 flex flex-col items-center gap-1">
        {isCommunity && (
          <p className="text-[11px] italic text-muted-foreground">
            Peer-issued credential. Not a platform-endorsed official certificate.
          </p>
        )}
        <p className="font-mono text-xs text-muted-foreground">
          Verify: {verifyUrl}
        </p>
      </div>
    </div>
  );
}
