/**
 * generate-textbook-svgs.ts
 *
 * Produces 13 thematic SVG illustrations for the textbook section:
 *
 *   public/textbook/hero.svg
 *   public/textbook/chapter-{01..12}.svg
 *
 * The output is fully static, deterministic, and matches the site's
 * dark cyan-on-navy palette. No external services required.
 *
 * For raster AI-generated alternatives, see generate-textbook-images.ts
 * (Genkit / Imagen-backed). This script is the always-available
 * fallback so production builds never break for missing imagery.
 *
 * Usage:
 *   npx tsx src/scripts/generate-textbook-svgs.ts
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, 'public', 'textbook');

type ChapterTheme = {
  number: number;
  title: string;
  motif: 'circuit' | 'orbit' | 'mesh' | 'wave' | 'lattice' | 'helix' | 'crowd' | 'shield';
  /** Primary glow position 0..1 across X axis */
  glowX: number;
  /** Background hue shift in degrees */
  hueShift: number;
};

const CHAPTERS: ChapterTheme[] = [
  { number: 1, title: 'Architecture of Moral Reasoning', motif: 'lattice', glowX: 0.65, hueShift: 0 },
  { number: 2, title: 'Ethical Relativism', motif: 'mesh', glowX: 0.5, hueShift: 12 },
  { number: 3, title: 'Divine Command & Euthyphro', motif: 'orbit', glowX: 0.35, hueShift: 24 },
  { number: 4, title: 'Social Media & Ethical Egoism', motif: 'crowd', glowX: 0.7, hueShift: -18 },
  { number: 5, title: 'Utilitarianism & Warfare', motif: 'shield', glowX: 0.5, hueShift: 36 },
  { number: 6, title: 'Animals & Technology', motif: 'wave', glowX: 0.4, hueShift: -30 },
  { number: 7, title: 'Kantianism, Utopias, Dystopias', motif: 'lattice', glowX: 0.55, hueShift: 60 },
  { number: 8, title: 'Aristotelian Virtue Theory', motif: 'helix', glowX: 0.5, hueShift: -45 },
  { number: 9, title: 'Surveillance & Privacy', motif: 'circuit', glowX: 0.3, hueShift: 90 },
  { number: 10, title: 'Bioengineering & Justice', motif: 'helix', glowX: 0.6, hueShift: -60 },
  { number: 11, title: 'Virtual Reality & Personhood', motif: 'mesh', glowX: 0.5, hueShift: 120 },
  { number: 12, title: 'AI & Care Ethics', motif: 'circuit', glowX: 0.4, hueShift: 18 },
];

// ─── Deterministic PRNG (mulberry32) ──────────────────────────────────

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Motif renderers ──────────────────────────────────────────────────

interface MotifContext {
  width: number;
  height: number;
  primary: string;
  accent: string;
  random: () => number;
}

function lattice({ width, height, primary, random }: MotifContext): string {
  const cellW = 70;
  const cellH = 70;
  const cols = Math.ceil(width / cellW) + 1;
  const rows = Math.ceil(height / cellH) + 1;
  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW;
      const y = r * cellH;
      const opacity = 0.04 + random() * 0.18;
      lines.push(
        `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="none" stroke="${primary}" stroke-opacity="${opacity.toFixed(
          2
        )}" stroke-width="0.6" />`
      );
      if (random() > 0.78) {
        const r2 = 2 + random() * 4;
        lines.push(
          `<circle cx="${x + cellW / 2}" cy="${y + cellH / 2}" r="${r2.toFixed(
            1
          )}" fill="${primary}" fill-opacity="${(0.2 + random() * 0.4).toFixed(2)}" />`
        );
      }
    }
  }
  return lines.join('');
}

function mesh({ width, height, primary, accent, random }: MotifContext): string {
  const points: Array<[number, number]> = [];
  const n = 38;
  for (let i = 0; i < n; i++) {
    points.push([random() * width, random() * height]);
  }
  const lines: string[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 220) {
        const op = (1 - d / 220) * 0.35;
        lines.push(
          `<line x1="${points[i][0].toFixed(1)}" y1="${points[i][1].toFixed(
            1
          )}" x2="${points[j][0].toFixed(1)}" y2="${points[j][1].toFixed(
            1
          )}" stroke="${primary}" stroke-opacity="${op.toFixed(2)}" stroke-width="0.7" />`
        );
      }
    }
  }
  for (const [x, y] of points) {
    lines.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="${accent}" fill-opacity="0.85" />`
    );
  }
  return lines.join('');
}

function orbit({ width, height, primary, accent, random }: MotifContext): string {
  const cx = width * 0.4;
  const cy = height * 0.5;
  const arcs: string[] = [];
  for (let i = 0; i < 9; i++) {
    const r = 60 + i * 80;
    const tilt = (random() - 0.5) * 24;
    arcs.push(
      `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${(r * 0.4).toFixed(
        1
      )}" transform="rotate(${tilt.toFixed(
        2
      )} ${cx} ${cy})" fill="none" stroke="${primary}" stroke-opacity="${(
        0.18 +
        i * 0.02
      ).toFixed(2)}" stroke-width="${(0.5 + i * 0.05).toFixed(1)}" />`
    );
  }
  for (let i = 0; i < 14; i++) {
    arcs.push(
      `<circle cx="${(random() * width).toFixed(1)}" cy="${(random() * height).toFixed(
        1
      )}" r="${(1 + random() * 3).toFixed(1)}" fill="${accent}" fill-opacity="${(
        0.3 +
        random() * 0.4
      ).toFixed(2)}" />`
    );
  }
  return arcs.join('');
}

function wave({ width, height, primary, accent, random }: MotifContext): string {
  const lines: string[] = [];
  const layers = 8;
  for (let i = 0; i < layers; i++) {
    const baseY = (height / (layers + 1)) * (i + 1);
    const amp = 30 + random() * 40;
    const period = 80 + random() * 60;
    const points: string[] = [];
    for (let x = 0; x <= width; x += 8) {
      const y =
        baseY +
        Math.sin((x / period) * Math.PI * 2 + i * 0.7) * amp +
        Math.sin((x / (period * 2.7)) * Math.PI * 2) * (amp * 0.4);
      points.push(`${x},${y.toFixed(1)}`);
    }
    const op = 0.18 + (i / layers) * 0.25;
    lines.push(
      `<polyline points="${points.join(' ')}" fill="none" stroke="${primary}" stroke-opacity="${op.toFixed(
        2
      )}" stroke-width="1" />`
    );
  }
  // Sparse accent dots
  for (let i = 0; i < 18; i++) {
    lines.push(
      `<circle cx="${(random() * width).toFixed(1)}" cy="${(random() * height).toFixed(
        1
      )}" r="${(1 + random() * 2.5).toFixed(1)}" fill="${accent}" fill-opacity="0.7" />`
    );
  }
  return lines.join('');
}

function helix({ width, height, primary, accent, random }: MotifContext): string {
  const cx = width / 2;
  const segments = 60;
  const totalH = height * 0.85;
  const top = (height - totalH) / 2;
  const radius = Math.min(width, height) * 0.18;
  const lines: string[] = [];
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const y = top + t * totalH;
    const a1 = t * Math.PI * 6;
    const x1 = cx + Math.cos(a1) * radius;
    const x2 = cx + Math.cos(a1 + Math.PI) * radius;
    const op = 0.6 - t * 0.3;
    if (i % 3 === 0) {
      lines.push(
        `<line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(
          1
        )}" y2="${y.toFixed(1)}" stroke="${primary}" stroke-opacity="${(op * 0.4).toFixed(
          2
        )}" stroke-width="0.6" />`
      );
    }
    lines.push(
      `<circle cx="${x1.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="${primary}" fill-opacity="${op.toFixed(
        2
      )}" />`
    );
    lines.push(
      `<circle cx="${x2.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="${accent}" fill-opacity="${op.toFixed(
        2
      )}" />`
    );
  }
  // Light starfield
  for (let i = 0; i < 24; i++) {
    lines.push(
      `<circle cx="${(random() * width).toFixed(1)}" cy="${(random() * height).toFixed(
        1
      )}" r="${(0.6 + random() * 1.4).toFixed(1)}" fill="#ffffff" fill-opacity="${(
        0.2 +
        random() * 0.4
      ).toFixed(2)}" />`
    );
  }
  return lines.join('');
}

function circuit({ width, height, primary, accent, random }: MotifContext): string {
  const lines: string[] = [];
  const grid = 40;
  // Traces
  for (let i = 0; i < 26; i++) {
    let x = Math.round((random() * width) / grid) * grid;
    let y = Math.round((random() * height) / grid) * grid;
    const segs = 4 + Math.floor(random() * 5);
    let path = `M ${x} ${y}`;
    for (let s = 0; s < segs; s++) {
      const horizontal = random() > 0.5;
      const dist = (1 + Math.floor(random() * 4)) * grid * (random() > 0.5 ? 1 : -1);
      if (horizontal) x += dist;
      else y += dist;
      path += ` L ${x} ${y}`;
    }
    const op = 0.18 + random() * 0.3;
    lines.push(
      `<path d="${path}" fill="none" stroke="${primary}" stroke-opacity="${op.toFixed(
        2
      )}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />`
    );
    lines.push(
      `<circle cx="${x}" cy="${y}" r="3.2" fill="${accent}" fill-opacity="0.85" />`
    );
  }
  return lines.join('');
}

function crowd({ width, height, primary, accent, random }: MotifContext): string {
  const lines: string[] = [];
  // Stylized people / nodes radiating from a single central node
  const cx = width * 0.6;
  const cy = height * 0.6;
  for (let i = 0; i < 80; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 30 + random() * Math.min(width, height) * 0.55;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 0.55;
    const r = 2 + random() * 4;
    lines.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(
        1
      )}" fill="${primary}" fill-opacity="${(0.25 + random() * 0.5).toFixed(2)}" />`
    );
    if (random() > 0.7) {
      lines.push(
        `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(
          1
        )}" stroke="${primary}" stroke-opacity="0.08" stroke-width="0.6" />`
      );
    }
  }
  lines.push(
    `<circle cx="${cx}" cy="${cy}" r="14" fill="${accent}" fill-opacity="0.85" />`
  );
  lines.push(
    `<circle cx="${cx}" cy="${cy}" r="22" fill="none" stroke="${accent}" stroke-opacity="0.5" stroke-width="1.2" />`
  );
  return lines.join('');
}

function shield({ width, height, primary, accent, random }: MotifContext): string {
  const cx = width / 2;
  const cy = height / 2;
  const w = Math.min(width, height) * 0.35;
  const h = w * 1.2;
  const path = `M ${cx} ${cy - h} L ${cx + w} ${cy - h * 0.4} L ${cx + w * 0.7} ${cy + h * 0.5} L ${cx} ${cy + h} L ${cx - w * 0.7} ${cy + h * 0.5} L ${cx - w} ${cy - h * 0.4} Z`;
  const lines: string[] = [];
  // Outer shield
  lines.push(
    `<path d="${path}" fill="none" stroke="${primary}" stroke-opacity="0.55" stroke-width="2.5" stroke-linejoin="round" />`
  );
  // Inner concentric shields
  for (let i = 1; i <= 4; i++) {
    const f = 1 - i * 0.18;
    const inner = `M ${cx} ${cy - h * f} L ${cx + w * f} ${cy - h * f * 0.4} L ${cx + w * f * 0.7} ${cy + h * f * 0.5} L ${cx} ${cy + h * f} L ${cx - w * f * 0.7} ${cy + h * f * 0.5} L ${cx - w * f} ${cy - h * f * 0.4} Z`;
    lines.push(
      `<path d="${inner}" fill="none" stroke="${primary}" stroke-opacity="${(0.4 - i * 0.07).toFixed(
        2
      )}" stroke-width="0.9" stroke-linejoin="round" />`
    );
  }
  // Sparse particles
  for (let i = 0; i < 30; i++) {
    lines.push(
      `<circle cx="${(random() * width).toFixed(1)}" cy="${(random() * height).toFixed(
        1
      )}" r="${(0.6 + random() * 2).toFixed(1)}" fill="${accent}" fill-opacity="${(
        0.18 +
        random() * 0.3
      ).toFixed(2)}" />`
    );
  }
  return lines.join('');
}

const MOTIFS = { lattice, mesh, orbit, wave, helix, circuit, crowd, shield };

// ─── HSL helpers ──────────────────────────────────────────────────────

function hsl(h: number, s: number, l: number): string {
  return `hsl(${((h % 360) + 360) % 360}, ${s}%, ${l}%)`;
}

// ─── SVG composer ─────────────────────────────────────────────────────

interface ComposeArgs {
  width: number;
  height: number;
  primary: string;
  accent: string;
  bg1: string;
  bg2: string;
  glowX: number;
  motif: keyof typeof MOTIFS;
  seed: number;
  /** Big number to print in the corner; e.g., "01" or "" */
  cornerNumber?: string;
  /** Subtitle line for the bottom edge */
  caption?: string;
}

function composeSvg(a: ComposeArgs): string {
  const random = rng(a.seed);
  const motifContent = MOTIFS[a.motif]({
    width: a.width,
    height: a.height,
    primary: a.primary,
    accent: a.accent,
    random,
  });
  const glowCx = (a.glowX * 100).toFixed(1) + '%';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a.width} ${a.height}" width="${a.width}" height="${a.height}" preserveAspectRatio="xMidYMid slice" role="img">
  <defs>
    <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${a.bg1}" />
      <stop offset="100%" stop-color="${a.bg2}" />
    </linearGradient>
    <radialGradient id="glow" cx="${glowCx}" cy="35%" r="55%">
      <stop offset="0%" stop-color="${a.primary}" stop-opacity="0.5" />
      <stop offset="50%" stop-color="${a.accent}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="${a.bg2}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="vignette" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${a.bg2}" stop-opacity="0.85" />
      <stop offset="65%" stop-color="${a.bg2}" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg-grad)" />
  <rect width="100%" height="100%" fill="url(#glow)" />
  <g>${motifContent}</g>
  <rect width="100%" height="100%" fill="url(#vignette)" />
  ${
    a.cornerNumber
      ? `<text x="${a.width - 60}" y="${a.height - 50}" text-anchor="end" font-family="Inter, sans-serif" font-weight="700" font-size="160" fill="${a.primary}" fill-opacity="0.18">${a.cornerNumber}</text>`
      : ''
  }
  ${
    a.caption
      ? `<text x="60" y="${a.height - 35}" font-family="Inter, sans-serif" font-weight="500" font-size="20" fill="${a.primary}" fill-opacity="0.45" letter-spacing="3">${a.caption.toUpperCase()}</text>`
      : ''
  }
</svg>
`;
}

// ─── Driver ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const W = 1600;
  const H = 600;

  // Hero
  const heroSvg = composeSvg({
    width: W,
    height: H,
    primary: hsl(181, 100, 74),
    accent: hsl(300, 100, 70),
    bg1: hsl(240, 50, 14),
    bg2: hsl(240, 60, 8),
    glowX: 0.7,
    motif: 'mesh',
    seed: 7,
    caption: 'The Ethics of Technology Through Science Fiction',
  });
  await fs.writeFile(path.join(OUT_DIR, 'hero.svg'), heroSvg, 'utf8');
  console.log('  ✓ hero.svg');

  // Each chapter
  for (const ch of CHAPTERS) {
    const baseHue = 181 + ch.hueShift;
    const accentHue = 300 + Math.floor(ch.hueShift * 0.7);
    const svg = composeSvg({
      width: W,
      height: H,
      primary: hsl(baseHue, 100, 72),
      accent: hsl(accentHue, 100, 70),
      bg1: hsl(240 + ch.hueShift * 0.2, 50, 14),
      bg2: hsl(240 + ch.hueShift * 0.2, 60, 8),
      glowX: ch.glowX,
      motif: ch.motif,
      seed: 1000 + ch.number * 137,
      cornerNumber: String(ch.number).padStart(2, '0'),
      caption: `Chapter ${ch.number} · ${ch.title}`,
    });
    const file = `chapter-${String(ch.number).padStart(2, '0')}.svg`;
    await fs.writeFile(path.join(OUT_DIR, file), svg, 'utf8');
    console.log(`  ✓ ${file}`);
  }

  console.log(`\n[textbook-svgs] Wrote ${CHAPTERS.length + 1} files to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
