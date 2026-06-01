'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import type { ActivityReport } from '@/types';
import {
  activityTypeLabel,
  badgeLabel,
  downloadLabel,
} from '@/lib/activity-reports/summary';
import { absoluteUrl } from '@/lib/site';
import { cn } from '@/lib/utils';

interface DownloadReportButtonProps {
  report: ActivityReport;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  /** Subtle call-to-action glow (post-completion screens). */
  glow?: boolean;
  /** Override the button label; defaults to a per-type download label. */
  label?: string;
}

/**
 * Downloads an activity report as a PDF via a print-ready, fully self-contained
 * HTML document (same approach as the certificate download — popup + print,
 * with an in-page fallback when popups are blocked).
 */
export function DownloadReportButton({
  report,
  variant = 'outline',
  size = 'sm',
  className,
  glow,
  label,
}: DownloadReportButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  function handleDownload(): void {
    if (!report?.id) return;
    setIsPrinting(true);
    try {
      const html = buildActivityReportHtml(report);
      const win = window.open('', '_blank', 'width=820,height=1000');
      if (!win) {
        inPagePrintFallback(html);
        setIsPrinting(false);
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        try {
          win.print();
        } catch (err) {
          console.error('[activity-report] print failed:', err);
        }
        setIsPrinting(false);
      }, 500);
    } catch (err) {
      console.error('[activity-report] download failed:', err);
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
      className={cn(glow && 'cta-glow', className)}
    >
      {isPrinting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {label ?? downloadLabel(String(report.activityType))}
    </Button>
  );
}

function esc(s: unknown): string {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(v: any): string {
  const d = v instanceof Date ? v : v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Render the type-specific `content` as readable labelled lines, skipping
 *  internal bookkeeping keys. Generic so any future activity prints sensibly. */
function renderContent(content: Record<string, any> | undefined): string {
  if (!content) return '';
  const skip = new Set([
    'reportId',
    'verificationHash',
    'activityType',
    'score',
    'passed',
    'passingThreshold',
  ]);
  const label = (k: string) =>
    k
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]+/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase());
  const rows: string[] = [];
  for (const [k, v] of Object.entries(content)) {
    if (skip.has(k) || v === null || v === undefined || v === '') continue;
    let val: string;
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      val = v
        .map((x) => (typeof x === 'string' ? x : JSON.stringify(x)))
        .join(' • ');
    } else if (typeof v === 'object') {
      continue;
    } else {
      val = String(v);
    }
    rows.push(
      `<tr><td class="k">${esc(label(k))}</td><td class="v">${esc(val)}</td></tr>`
    );
  }
  if (rows.length === 0) return '';
  return `<table class="content">${rows.join('')}</table>`;
}

function buildActivityReportHtml(report: ActivityReport): string {
  const PRIMARY = '#5b6cff';
  const INK = '#1a1d2b';
  const MUTED = '#5b6172';
  const verifyUrl = absoluteUrl(`/verify/report/${report.verificationHash}`);
  const scoreRow =
    typeof report.score === 'number'
      ? `<tr><td class="k">Score</td><td class="v">${report.score}%${
          typeof report.passingThreshold === 'number'
            ? ` (passing ${report.passingThreshold}%)`
            : ''
        }${
          report.passed === true
            ? ' — Passed'
            : report.passed === false
            ? ' — Not passed'
            : ''
        }</td></tr>`
      : '';

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<title>Activity Report — ${esc(report.activityTitle)}</title>
<style>
  @page { size: letter portrait; margin: 0.6in; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: ${INK}; margin: 0; }
  .wrap { max-width: 7.0in; margin: 0 auto; }
  .eyebrow { color: ${PRIMARY}; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }
  h1 { font-size: 24px; margin: 6px 0 2px; }
  .sub { color: ${MUTED}; font-size: 13px; }
  .badge { display: inline-block; margin-top: 8px; padding: 3px 10px; border: 1px solid ${PRIMARY}; color: ${PRIMARY}; border-radius: 999px; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; }
  hr { border: none; border-top: 1px solid #e3e5ee; margin: 18px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 0; vertical-align: top; font-size: 13px; }
  td.k { width: 32%; color: ${MUTED}; font-family: Arial, sans-serif; text-transform: uppercase; font-size: 10px; letter-spacing: 0.6px; padding-right: 14px; }
  td.v { width: 68%; }
  .summary { font-size: 14px; line-height: 1.6; }
  .content td.k { width: 32%; }
  .verify { margin-top: 24px; padding: 12px 14px; background: #f4f5fb; border-radius: 8px; font-family: Arial, sans-serif; font-size: 11px; color: ${MUTED}; }
  .code { font-family: 'Courier New', monospace; color: ${INK}; font-weight: 700; letter-spacing: 1px; }
  .void { margin-top: 14px; padding: 10px 12px; border: 1px solid #d9534f; color: #b02a25; border-radius: 8px; font-family: Arial, sans-serif; font-size: 12px; }
</style></head>
<body><div class="wrap">
  <div class="eyebrow">${esc(badgeLabel(String(report.activityType)))}</div>
  <h1>${esc(report.activityTitle)}</h1>
  <div class="sub">Sci-Fi Ethics Explorer · ${esc(activityTypeLabel(String(report.activityType)))}</div>
  <span class="badge">${esc(report.userName)}</span>
  ${report.voidedAt ? `<div class="void">This report has been voided${report.voidReason ? `: ${esc(report.voidReason)}` : '.'}</div>` : ''}
  <hr />
  <table>
    <tr><td class="k">Student</td><td class="v">${esc(report.userName)}</td></tr>
    <tr><td class="k">Activity type</td><td class="v">${esc(activityTypeLabel(String(report.activityType)))}</td></tr>
    <tr><td class="k">Completed</td><td class="v">${esc(fmtDate(report.completedAt))}</td></tr>
    ${scoreRow}
    ${report.communityName ? `<tr><td class="k">Community</td><td class="v">${esc(report.communityName)}${report.instructorName ? ` · ${esc(report.instructorName)}` : ''}</td></tr>` : ''}
    ${report.attempt > 1 ? `<tr><td class="k">Attempt</td><td class="v">#${report.attempt}</td></tr>` : ''}
  </table>
  <hr />
  <div class="eyebrow" style="color:${MUTED}">Summary</div>
  <p class="summary">${esc(report.summary)}</p>
  ${renderContent(report.content)}
  <div class="verify">
    Verify this report at <strong>${esc(verifyUrl)}</strong><br/>
    Verification code: <span class="code">${esc(report.verificationHash)}</span><br/>
    Report ID: ${esc(report.id)}
  </div>
</div></body></html>`;
}

/** Popup-blocked fallback: print the report in a hidden iframe. */
function inPagePrintFallback(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const idoc = iframe.contentWindow?.document;
  if (!idoc) {
    document.body.removeChild(iframe);
    return;
  }
  idoc.open();
  idoc.write(html);
  idoc.close();
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('[activity-report] fallback print failed:', err);
    }
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 500);
}
