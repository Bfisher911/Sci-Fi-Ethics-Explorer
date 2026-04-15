#!/usr/bin/env -S npx tsx
/**
 * One-shot script: use Gemini 2.5 Flash Image to generate cover/portrait
 * images for every philosopher, ethical theory, and story that lacks one,
 * then save them under public/images/{type}/{id}.png.
 *
 * Run from the project root:
 *   GEMINI_API_KEY=... npx tsx src/scripts/_generate-images.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { philosopherData } from '../data/philosophers';
import { ethicalTheories } from '../data/ethical-theories';
import { mockStories } from '../data/stories';

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
if (!API_KEY) {
  console.error('Missing GEMINI_API_KEY env var. Set it in .env or pass inline.');
  process.exit(1);
}

const MODEL = 'gemini-2.5-flash-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// ─── Output paths ──────────────────────────────────────────────────
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public', 'images');
const PHIL_DIR = path.join(PUBLIC_DIR, 'philosophers');
const THEORY_DIR = path.join(PUBLIC_DIR, 'theories');
const STORY_DIR = path.join(PUBLIC_DIR, 'stories');
for (const d of [PUBLIC_DIR, PHIL_DIR, THEORY_DIR, STORY_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

interface GenJob {
  /** kebab-case id, becomes filename */
  id: string;
  /** human label for logs */
  label: string;
  /** subdirectory under public/images */
  subdir: string;
  /** prompt for the model */
  prompt: string;
}

// ─── Build prompts ─────────────────────────────────────────────────

function buildPhilosopherPrompt(p: typeof philosopherData[number]): string {
  const cuesByEra = (era: string): string => {
    if (/BCE|BC/i.test(era)) return 'classical sculpture style, marble bust, dramatic chiaroscuro lighting, museum quality';
    if (/^1[6-7]\d{2}/.test(era)) return 'baroque oil painting style, dramatic shadow, period attire, somber palette';
    if (/^17|18/.test(era)) return 'enlightenment-era oil portrait, soft natural light, period dress, contemplative pose';
    if (/^19/.test(era)) return 'victorian-era painted portrait, formal attire, restrained palette, scholarly setting';
    if (/^20|21|present/i.test(era)) return 'photorealistic black-and-white portrait, modern editorial style, natural light, intellectual presence';
    return 'painted portrait, contemplative pose, scholarly atmosphere';
  };

  const style = cuesByEra(p.era);
  return `Portrait of ${p.name}, ${p.era}. ${style}. Subject is shown from the chest up, three-quarter view, looking thoughtfully into the middle distance. Background is muted and atmospheric, evoking ${p.imageHint || 'philosophical contemplation'}. No text or watermarks. High detail, painterly quality, dignified composition. The subject's expression conveys the intellectual depth of someone known for: ${(p.keyIdeas?.slice(0, 2) || []).join(' and ')}.`;
}

function buildTheoryPrompt(t: typeof ethicalTheories[number]): string {
  // A symbolic, abstract image — not literal. The hint is a starting point.
  return `Symbolic, abstract sci-fi illustration representing the ethical concept of "${t.name}". ${t.imageHint ? `Visual motif: ${t.imageHint}.` : ''} Style: minimalist futuristic, deep navy and electric cyan palette, geometric forms, soft glow, no human figures, no text. Composed for a 4:3 aspect ratio. Evokes contemplation and intellectual rigor. Influenced by James Turrell, Refik Anadol, and the visual language of Apple's "Think Different" era. Avoid clichés like scales of justice or trolley cars.`;
}

function buildStoryPrompt(s: typeof mockStories[number]): string {
  return `Cinematic key art for a science-fiction short story titled "${s.title}". Genre: ${s.genre}. Theme: ${s.theme}. ${s.imageHint ? `Visual cue: ${s.imageHint}.` : ''} Style: dramatic, painterly, evocative, atmospheric. Deep contrast, rich color, hint of mystery. No text or logos. Wide cinematic composition (3:2 aspect ratio). Mood: ${s.description.slice(0, 140)}. Inspired by the cover art of Ted Chiang's collections and Denis Villeneuve films.`;
}

// ─── Build the job queue ───────────────────────────────────────────

const jobs: GenJob[] = [];

for (const p of philosopherData) {
  jobs.push({
    id: p.id,
    label: `philosopher: ${p.name}`,
    subdir: PHIL_DIR,
    prompt: buildPhilosopherPrompt(p),
  });
}

for (const t of ethicalTheories) {
  jobs.push({
    id: t.id,
    label: `theory: ${t.name}`,
    subdir: THEORY_DIR,
    prompt: buildTheoryPrompt(t),
  });
}

for (const s of mockStories) {
  jobs.push({
    id: s.id,
    label: `story: ${s.title}`,
    subdir: STORY_DIR,
    prompt: buildStoryPrompt(s),
  });
}

// ─── HTTPS helper ──────────────────────────────────────────────────

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

async function generateOne(job: GenJob): Promise<{ ok: boolean; reason?: string }> {
  const outPath = path.join(job.subdir, `${job.id}.png`);
  if (fs.existsSync(outPath)) {
    return { ok: true, reason: 'already exists' };
  }

  const body = JSON.stringify({
    contents: [{ parts: [{ text: job.prompt }] }],
  });

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

// ─── Main ──────────────────────────────────────────────────────────

(async () => {
  console.log(`Generating images for ${jobs.length} subjects with ${MODEL}...\n`);

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    process.stdout.write(`[${i + 1}/${jobs.length}] ${job.label}... `);
    const result = await generateOne(job);
    if (result.ok) {
      if (result.reason === 'already exists') {
        console.log('· skipped (exists)');
        skipped++;
      } else {
        console.log('✓');
        succeeded++;
      }
    } else {
      console.log(`✗ ${result.reason}`);
      failed++;
      errors.push(`${job.label}: ${result.reason}`);
    }
    // Light rate-limit cushion
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nDone. ${succeeded} created, ${skipped} skipped, ${failed} failed.`);
  if (errors.length > 0) {
    console.log('\nErrors:');
    for (const e of errors) console.log(`  - ${e}`);
  }
})();
