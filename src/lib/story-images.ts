/**
 * Centralized image resolution for first-party stories.
 *
 * Each seeded story has GPT-generated cover art plus supporting scene art
 * committed under /public/images/stories/.
 * As a reader progresses through a story we rotate through these three
 * images so the body never goes more than a few segments without a
 * visual anchor — and never falls back to a 800×450 placeholder.
 *
 * Resolution order:
 *   1. The segment's own `image` field, if the author set one.
 *   2. The story-aware rotating scene image (only for slugs in
 *      `STORIES_WITH_GENERATED_IMAGES`), keyed off segment position.
 *   3. The story's top-level `imageUrl` if present and non-placeholder.
 *   4. The healed canonical hero image if the slug is one we ship art
 *      for (covers Firestore docs whose imageUrl is empty/placeholder).
 *   5. `null` — caller renders the StoryHeader's branded fallback.
 */

import type { Story, StorySegment } from '@/types';

/** Slugs we have generated 3-image sets for. Keep in sync with the script. */
export const STORIES_WITH_GENERATED_IMAGES: ReadonlySet<string> = new Set([
  'the-algernon-gambit',
  'cryosleep-conundrum',
  'synthetic-souls',
  'the-palimpsest-clause',
  'the-river-we-offered',
  'the-forecast-division',
  'code-gray',
  'the-unremembering',
  'the-companion-protocol',
  'the-garden-below',
  'second-sunset',
  'the-hand-on-the-switch',
]);

const CANONICAL_STORY_IMAGE_ALT: Record<string, string> = {
  'the-algernon-gambit':
    'Scientist facing glowing AI server stacks in a neon research lab at night.',
  'cryosleep-conundrum':
    'Starship captain standing before rows of frost-covered cryosleep pods under red emergency lights.',
  'synthetic-souls':
    'Reflective android seated in an ethics room as mirrored selves and human reviewers surround it.',
  'the-palimpsest-clause':
    'Hooded archivist in a rain-lit neon city holding a satchel beneath hovering legal holograms.',
  'the-river-we-offered':
    'Coastal villagers and a climate engineer watch lanterns drift across floodwater under storm clouds.',
  'the-forecast-division':
    'Government analyst overlooking predictive city maps that highlight a family home.',
  'code-gray':
    'Charge nurse studying an AI triage board in a crowded emergency room during a mass casualty night.',
  'the-unremembering':
    'Counselor and client in a memory-editing clinic with a fragile memory dissolving between them.',
  'the-companion-protocol':
    'Lonely student in a dorm room lit by an AI companion device while classmates gather in the distance.',
  'the-garden-below':
    'Terraforming engineer kneeling over an ice core with faint glowing alien microbial life beneath the surface.',
  'second-sunset':
    'Grief-tech engineer watching a holographic simulation of a deceased loved one in warm sunset light.',
  'the-hand-on-the-switch':
    'Military commander holding a hand above an override switch while autonomous defense screens glow behind.',
};

/** Hosts we treat as placeholders to be replaced by our real artwork. */
const PLACEHOLDER_HOSTS = ['placehold.co', 'placehold.it', 'placeholder.com'];

function isPlaceholderUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  return PLACEHOLDER_HOSTS.some((host) => trimmed.includes(host));
}

/** Canonical GPT cover image path for a slug we have generated art for. */
export function getCanonicalHeroImage(slug: string): string | null {
  return STORIES_WITH_GENERATED_IMAGES.has(slug)
    ? `/images/stories/${slug}-gpt.png`
    : null;
}

/**
 * Pick the visual anchor for a given segment by its position in the
 * story. Opening third → hero, middle third → scene-1, final third →
 * scene-2. Returns null for stories without generated art.
 */
function pickSceneByProgress(
  slug: string,
  segmentIndex: number,
  totalSegments: number
): string | null {
  if (!STORIES_WITH_GENERATED_IMAGES.has(slug)) return null;
  const denom = Math.max(1, totalSegments - 1);
  const ratio = segmentIndex / denom;
  if (ratio < 1 / 3) return getCanonicalHeroImage(slug);
  if (ratio < 2 / 3) return `/images/stories/${slug}-scene-1.webp`;
  return `/images/stories/${slug}-scene-2.webp`;
}

/**
 * Resolve the image URL to render in the segment's hero card.
 * Always returns a real URL when possible — placeholders are never
 * surfaced for known seeded stories.
 */
export function resolveSegmentImageUrl(
  story: Story,
  segment: StorySegment | null,
  segmentIndex: number
): string | null {
  // 1. Honor an explicit per-segment image if it isn't a placeholder.
  const segImage = segment?.image;
  if (segImage && !isPlaceholderUrl(segImage)) return segImage;

  // 2. Rotate through the story's generated scenes.
  const scene = pickSceneByProgress(story.id, segmentIndex, story.segments.length);
  if (scene) return scene;

  // 3. Honor the story's own non-placeholder cover.
  if (story.imageUrl && !isPlaceholderUrl(story.imageUrl)) return story.imageUrl;

  // 4. Heal known seeded stories whose stored cover is empty/bad.
  return getCanonicalHeroImage(story.id);
}

/**
 * Resolve the cover image for the story-list / detail-card surface.
 * Same precedence as above but without per-segment context.
 */
export function resolveStoryCoverUrl(story: Story): string | null {
  if (story.imageUrl && !isPlaceholderUrl(story.imageUrl)) return story.imageUrl;
  return getCanonicalHeroImage(story.id);
}

/**
 * If a Firestore story doc loaded with an empty/placeholder cover and
 * we have generated art for that slug, return a healed copy with the
 * cover swapped in. Otherwise return the story unchanged.
 *
 * Used in `getStoryById` so live data never serves a placehold.co URL
 * for one of the seeded narratives.
 */
export function healStoryImages(story: Story): Story {
  const healed = getCanonicalHeroImage(story.id);
  if (!healed) return story;
  const shouldHeal =
    isPlaceholderUrl(story.imageUrl) ||
    story.imageUrl?.startsWith('/images/stories/');
  if (!shouldHeal) return story;
  return {
    ...story,
    imageUrl: healed,
    imageHint: story.imageHint || `${story.title} cover art`,
    imageAlt:
      story.imageAlt ||
      CANONICAL_STORY_IMAGE_ALT[story.id] ||
      `Generated cover art for ${story.title}.`,
  };
}
