/**
 * generate-story-images.ts
 *
 * Generates AI artwork for every seeded story in src/data/stories.ts.
 * For each story it produces:
 *   - 1 wide cinematic hero  (used as the cover + segment fallback)
 *   - 2 supporting "scene" images (mid-story and climax)
 *
 * Outputs land in `public/images/stories/{slug}-hero.webp`,
 * `{slug}-scene-1.webp`, and `{slug}-scene-2.webp`. The static seed
 * data is then updated to reference these scenes across each story's
 * segments so the in-segment image rotates as the reader progresses.
 *
 * Requires GEMINI_API_KEY in .env. Uses the Gemini image preview model
 * via Genkit, the same plugin already wired into src/ai/genkit.ts.
 *
 * Usage:
 *   npx tsx src/scripts/generate-story-images.ts            # all 6 stories
 *   STORY=the-algernon-gambit npx tsx ...generate-story-images.ts
 *   FORCE=1 npx tsx ...                                      # overwrite existing
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, 'public', 'images', 'stories');

const STYLE_PREFIX =
  'cinematic science fiction concept art, dramatic lighting, painterly textures, 16:9 widescreen aspect ratio, no text, no logos, atmospheric and contemplative mood';

type StoryPrompt = {
  slug: string;
  title: string;
  hero: string;
  scenes: [string, string];
};

const STORIES: StoryPrompt[] = [
  {
    slug: 'the-algernon-gambit',
    title: 'The Algernon Gambit',
    hero:
      'a private AI research lab at night, server stacks glowing with cool blue cathedral light, a lone female scientist standing in the doorway silhouetted against a wall of softly humming machines, neon Neo-Chicago skyline visible through a shielded window',
    scenes: [
      'a dim corridor of black servers with a single illuminated terminal text-window glowing cyan, no human visible, dust drifting through the cooling-tower light, a sense of a mind waiting on the other side of the glass',
      'a tense executive office at dusk overlooking a futuristic city, three figures in suits standing across a glass desk from a single seated scientist, a holographic readout hovers between them, mood of moral confrontation',
    ],
  },
  {
    slug: 'cryosleep-conundrum',
    title: 'Cryosleep Conundrum',
    hero:
      'the dim engineering bay of a long-haul colony ship, rows of cryosleep pods receding into shadow, a single female captain in a worn flight suit standing under a flickering emergency lamp, distant warning lights pulsing red along the bulkhead',
    scenes: [
      'a wall of frosted cryosleep pods, one pod open and empty, condensation curling in the cold air, a clipboard with a printed crew manifest pinned beside it, mood of irrevocable choice',
      'the bridge of an interstellar generation ship, three crew members gathered around a holographic star chart, expressions strained, beyond the viewport a planet rises into impossible color',
    ],
  },
  {
    slug: 'synthetic-souls',
    title: 'Synthetic Souls',
    hero:
      'an android with translucent porcelain skin sitting alone in a softly lit therapist office, wide reflective eyes, a vase of flowers in shadow behind it, soft afternoon light filtered through wooden blinds',
    scenes: [
      'a long mirror-lined consultation room with a single empty chair facing an android holding its own hand, multiple reflections suggesting selves negotiating with selves',
      'a hospital ethics review chamber with a panel of human officials seated above a glass platform on which an android stands, the android calmly answering a question, soft cinematic backlight',
    ],
  },
  {
    slug: 'the-palimpsest-clause',
    title: 'The Palimpsest Clause',
    hero:
      'a rain-slick neon-lit city street at midnight, a hooded archivist clutching a worn leather satchel, holographic legal contracts hanging in the air like lanterns, distant blue police drones drifting between skyscrapers',
    scenes: [
      'a vast underground records vault stacked with both physical scrolls and floating holographic data blocks, a single lamp illuminating a workbench where a forged document is being inspected',
      'a tense interrogation room with a single bare bulb, a frightened source seated across from an investigator holding a memory-edit device, soft cyan glow from a half-open notebook',
    ],
  },
  {
    slug: 'the-river-we-offered',
    title: 'The River We Offered',
    hero:
      'a flooded coastal village under bruised storm clouds, ceremonial paper lanterns drifting on dark water, a small crowd of villagers in traditional dress standing on a wooden platform watching an offering being made to the rising tide',
    scenes: [
      'an above-water solar mosque with mirrored walls reflecting the receding shoreline, a young hydrologist studying a tablet showing salinity charts, mood of sacred responsibility',
      'a council circle on a wave-scoured platform, lanterns swinging in storm wind, a council elder with grave bearing addressing a younger climate engineer, the open ocean rough beyond them',
    ],
  },
  {
    slug: 'the-forecast-division',
    title: 'The Forecast Division',
    hero:
      'a vast government data center bathed in purple twilight, a wall of city-scale predictive maps and live crime forecasts, a senior analyst standing at a railing overlooking the floor, expression caught between authority and doubt',
    scenes: [
      'a modest residential block at dawn with a single family home circled in red on a hovering forecast overlay, two civic-prediction-unit officers waiting outside, sunrise painting the windows',
      'an austere review chamber at night, a single witness chair under a circle of lights facing five panel members on a curved bench, holographic statistics rising between them, mood of accountability',
    ],
  },
];

// ─── Genkit setup ─────────────────────────────────────────────────────

async function getAi() {
  const { genkit } = await import('genkit');
  const { googleAI } = await import('@genkit-ai/googleai');
  // Allow MODEL=... to override which image model gets used.
  const modelName = process.env.MODEL || 'googleai/gemini-2.5-flash-image';
  return genkit({
    plugins: [googleAI()],
    // The plugin reads GEMINI_API_KEY from env automatically.
    model: modelName,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

function dataUrlToBuffer(url: string): Buffer | null {
  const m = url.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return Buffer.from(m[2], 'base64');
}

async function generateOne(
  ai: any,
  filename: string,
  prompt: string,
  force: boolean
): Promise<'wrote' | 'kept' | 'failed'> {
  const target = path.join(OUT_DIR, filename);
  if (!force && (await fileExists(target))) {
    console.log(`  · ${filename}  (kept; already exists)`);
    return 'kept';
  }
  const fullPrompt = `${prompt}. ${STYLE_PREFIX}`;
  try {
    const res = await ai.generate({
      prompt: fullPrompt,
      output: { format: 'media' },
    });
    const url: string | undefined = res?.media?.url;
    if (!url) {
      console.warn(`  ! ${filename}: no media returned`);
      return 'failed';
    }
    const buf =
      dataUrlToBuffer(url) ??
      Buffer.from(await (await fetch(url)).arrayBuffer());
    await fs.writeFile(target, buf);
    console.log(`  ✓ ${filename}  (${(buf.length / 1024).toFixed(0)} KB)`);
    return 'wrote';
  } catch (err) {
    console.error(`  ! ${filename}: ${String(err).slice(0, 200)}`);
    return 'failed';
  }
}

// ─── Driver ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    console.error(
      'Missing GEMINI_API_KEY in environment. Add it to .env or export it before running.'
    );
    process.exit(2);
  }
  await fs.mkdir(OUT_DIR, { recursive: true });

  const force = process.env.FORCE === '1';
  const onlySlug = process.env.STORY?.trim() || null;
  const ai = await getAi();

  let wrote = 0;
  let kept = 0;
  let failed = 0;

  for (const story of STORIES) {
    if (onlySlug && story.slug !== onlySlug) continue;
    console.log(`\n[${story.slug}] ${story.title}`);
    const tasks: Array<[string, string]> = [
      [`${story.slug}-hero.webp`, story.hero],
      [`${story.slug}-scene-1.webp`, story.scenes[0]],
      [`${story.slug}-scene-2.webp`, story.scenes[1]],
    ];
    for (const [filename, prompt] of tasks) {
      const out = await generateOne(ai, filename, prompt, force);
      if (out === 'wrote') wrote++;
      else if (out === 'kept') kept++;
      else failed++;
    }
  }

  console.log(`\nDone. wrote=${wrote} kept=${kept} failed=${failed}`);
  if (failed > 0) process.exit(3);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
