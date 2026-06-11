/**
 * Client-safe dialogue types and tiny helpers.
 *
 * Deliberately imports NOTHING — client components import from here so
 * the heavy persona data files (philosopher/author/media bios) never
 * enter the client bundle. The full persona model lives in
 * `personas.ts`, which is server-side only.
 */

export type DialogueCategory =
  | 'philosopher'
  | 'scifi-author'
  | 'scifi-media'
  | 'framework';

export const DIALOGUE_CATEGORIES: DialogueCategory[] = [
  'philosopher',
  'scifi-author',
  'scifi-media',
  'framework',
];

export const DIALOGUE_CATEGORY_LABELS: Record<DialogueCategory, string> = {
  philosopher: 'Philosophers',
  'scifi-author': 'Sci-Fi Authors',
  'scifi-media': 'Sci-Fi Media',
  framework: 'Ethical Frameworks',
};

export type DialogueMode = 'open' | 'assessment';

/** Client-safe persona summary — never includes prompt material. */
export interface PublicDialoguePersona {
  id: string;
  category: DialogueCategory;
  displayName: string;
  shortDescription: string;
  technologyEthicsFocus: string;
  relatedFrameworks: string[];
  imageUrl?: string;
  libraryHref: string;
}

/** Stable activity id used for activity reports + certificates. */
export function personaActivityId(category: DialogueCategory, id: string): string {
  return `dialogue-${category}-${id}`;
}

/** Per-chatbot certificate curriculumId. The `achievement-` prefix makes
 *  the tier resolver mark these official platform certificates. */
export function personaCertificateId(category: DialogueCategory, id: string): string {
  return `achievement-${personaActivityId(category, id)}`;
}

export function isDialogueCategory(value: string): value is DialogueCategory {
  return (DIALOGUE_CATEGORIES as string[]).includes(value);
}

/** Passed assessment dialogues required per category Explorer certificate.
 *  Lives here (not the certificate registry) so client components can
 *  show progress without pulling the registry's data imports. */
export const DIALOGUE_CATEGORY_CERT_THRESHOLD = 5;
