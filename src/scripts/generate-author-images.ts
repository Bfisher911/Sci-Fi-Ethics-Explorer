#!/usr/bin/env -S npx tsx
/**
 * Generate Gemini portraits for every sci-fi author that doesn't already
 * have a PNG at public/images/authors/<id>.png, then (optionally) patch the
 * imageUrl on each scifiAuthorData entry so the UI stops serving the SVG
 * placeholder.
 *
 * Run:
 *   GEMINI_API_KEY=... npx tsx src/scripts/generate-author-images.ts
 *   GEMINI_API_KEY=... npx tsx src/scripts/generate-author-images.ts --rewrite-data
 *
 * --rewrite-data edits src/data/scifi-authors.ts in place to point each
 * entry at `/images/authors/<id>.png`. Skipped if the script can't confirm
 * the PNG was successfully written.
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { scifiAuthorData } from '../data/scifi-authors';

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
if (!API_KEY) {
  console.error('Missing GEMINI_API_KEY env var.');
  process.exit(1);
}

const REWRITE_DATA = process.argv.includes('--rewrite-data');
const MODEL = 'gemini-2.5-flash-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'images', 'authors');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function buildPrompt(a: typeof scifiAuthorData[number]): string {
  const cuesByEra = (era: string): string => {
    const startYear = parseInt((era.match(/\d{4}/) || ['2000'])[0], 10);
    if (startYear < 1900) return 'victorian-era painted portrait, formal attire, warm lamplight, restrained palette, period study setting';
    if (startYear < 1940) return 'early twentieth-century studio photograph restyled as a painted portrait, sepia-to-grayscale warmth, period attire';
    if (startYear < 1970) return 'mid-century editorial photograph restyled with painterly depth, black-and-white with subtle warm tone, natural light';
    if (startYear < 2000) return 'late twentieth-century editorial black-and-white portrait, restrained palette, natural light, thoughtful presence';
    return 'contemporary editorial photographic portrait, softly desaturated, natural light, understated modern framing';
  };
  const style = cuesByEra(a.era);
  const themeCue = (a.themes?.slice(0, 2) || []).join(' and ');
  const genreCue = (a.subgenres?.slice(0, 2) || []).join(', ');
  return `Portrait of the science-fiction author ${a.name}, ${a.era}. ${style}. Subject shown from the chest up, three-quarter view, looking thoughtfully past the camera. Background is muted and atmospheric, evoking ${a.imageHint || 'a writer at work'}${genreCue ? ` and the register of ${genreCue}` : ''}. No text or watermarks. High detail, dignified composition. The expression suggests the intellectual weight of a writer known for ${themeCue || 'serious work on technology and ethics'}. Avoid cliché sci-fi motifs (no robots, no spaceships, no circuit boards) — this is a literary portrait, not book cover art.`;
}

function httpsRequest(url: string, body: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode!, body: data }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generateOne(a: typeof scifiAuthorData[number]): Promise<{ ok: boolean; reason?: string }> {
  const outPath = path.join(OUT_DIR, `${a.id}.png`);
  if (fs.existsSync(outPath)) {
    return { ok: true, reason: 'already exists' };
  }
  const body = JSON.stringify({ contents: [{ parts: [{ text: buildPrompt(a) }] }] });
  try {
    const res = await httpsRequest(ENDPOINT, body);
    if (res.status !== 200) {
      return { ok: false, reason: `HTTP ${res.status}: ${res.body.slice(0, 200)}` };
    }
    const parsed = JSON.parse(res.body);
    const parts = parsed?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);
    if (!imagePart) {
      return { ok: false, reason: 'no inlineData in response' };
    }
    const buf = Buffer.from(imagePart.inlineData.data, 'base64');
    fs.writeFileSync(outPath, buf);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, reason: err.message || String(err) };
  }
}

function rewriteDataFile(): number {
  const dataPath = path.join(__dirname, '..', 'data', 'scifi-authors.ts');
  let text = fs.readFileSync(dataPath, 'utf8');
  let replaced = 0;
  for (const a of scifiAuthorData) {
    const pngPath = path.join(OUT_DIR, `${a.id}.png`);
    if (!fs.existsSync(pngPath)) continue;
    const target = `/images/authors/${a.id}.png`;
    if (a.imageUrl === target) continue;
    // Match the imageUrl line for this author's block.
    const idLine = `id: '${a.id}',`;
    const idIdx = text.indexOf(idLine);
    if (idIdx === -1) continue;
    // Find the next imageUrl line in this block (bounded by the next `},\n  {`).
    const blockEnd = text.indexOf('\n  },\n', idIdx);
    const searchEnd = blockEnd === -1 ? text.length : blockEnd;
    const imgRegex = /imageUrl: '[^']+',/;
    const rel = text.slice(idIdx, searchEnd);
    const match = rel.match(imgRegex);
    if (!match || match.index === undefined) continue;
    const absIdx = idIdx + match.index;
    const newLine = `imageUrl: '${target}',`;
    text = text.slice(0, absIdx) + newLine + text.slice(absIdx + match[0].length);
    replaced++;
  }
  fs.writeFileSync(dataPath, text, 'utf8');
  return replaced;
}

(async () => {
  console.log(`Generating author portraits for ${scifiAuthorData.length} authors...\n`);
  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];
  for (let i = 0; i < scifiAuthorData.length; i++) {
    const a = scifiAuthorData[i];
    process.stdout.write(`[${i + 1}/${scifiAuthorData.length}] ${a.name}... `);
    const r = await generateOne(a);
    if (r.ok) {
      if (r.reason === 'already exists') {
        console.log('· skipped');
        skipped++;
      } else {
        console.log('✓');
        ok++;
      }
    } else {
      console.log(`✗ ${r.reason}`);
      failed++;
      errors.push(`${a.name}: ${r.reason}`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`\n${ok} generated, ${skipped} already-present, ${failed} failed.`);
  if (errors.length) {
    console.log('\nErrors:');
    for (const e of errors) console.log(`  - ${e}`);
  }
  if (REWRITE_DATA) {
    const n = rewriteDataFile();
    console.log(`\nRewrote imageUrl for ${n} authors in src/data/scifi-authors.ts.`);
  } else {
    console.log('\nRun with --rewrite-data to update src/data/scifi-authors.ts imageUrl entries.');
  }
})();
