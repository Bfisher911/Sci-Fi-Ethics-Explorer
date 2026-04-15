/**
 * One-shot seed script for community dilemmas and debates.
 *
 * Uses the Firebase CLI refresh token to obtain a short-lived OAuth access
 * token, then posts directly to the Firestore REST API.
 *
 * Run:
 *   npx tsx src/scripts/_seed-community-content.ts
 */

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PROJECT_ID = 'sci-fi-ethics-explorer-rlmgn';
const CLIENT_ID =
  '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

// ─── Firestore value helpers ────────────────────────────────────────

type FirestoreValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { nullValue: null }
  | { arrayValue: { values: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { integerValue: String(value) };
    }
    return { doubleValue: value };
  }
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((v) => toFirestoreValue(v)),
      },
    };
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    '__timestamp__' in (value as Record<string, unknown>)
  ) {
    return {
      timestampValue: (value as { __timestamp__: string }).__timestamp__,
    };
  }
  if (typeof value === 'object') {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  throw new Error(`Unsupported value type for Firestore conversion: ${typeof value}`);
}

function toFirestoreFields(
  obj: Record<string, unknown>,
): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

// ─── Access token exchange ──────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const configPath = join(
    homedir(),
    '.config',
    'configstore',
    'firebase-tools.json',
  );
  const raw = readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(raw) as {
    tokens?: { refresh_token?: string };
    user?: unknown;
  };
  const refreshToken = parsed.tokens?.refresh_token;
  if (!refreshToken) {
    throw new Error(
      `Could not find refresh_token in ${configPath}. Run 'firebase login' first.`,
    );
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${errText}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error('Token response missing access_token');
  }
  return json.access_token;
}

// ─── Firestore POST helper ──────────────────────────────────────────

async function createDocument(
  accessToken: string,
  collectionPath: string,
  doc: Record<string, unknown>,
): Promise<string> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionPath}`;
  const payload = { fields: toFirestoreFields(doc) };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`POST ${collectionPath} failed (${res.status}): ${errText}`);
  }
  const json = (await res.json()) as { name?: string };
  const name = json.name ?? '';
  const id = name.split('/').pop() ?? '(unknown)';
  return id;
}

// ─── Seed data ──────────────────────────────────────────────────────

const nowIso = new Date().toISOString();

const dilemmas: Array<Record<string, unknown>> = [
  {
    title: 'The Rewrite Clinic',
    description:
      'MemoraSure, a boutique neurotech clinic, offers what it calls "consensual trauma authorship." For a modest fee, clients can rewrite their most painful memories — edit an abuser out of childhood, overwrite a moment of cowardice with courage, or transform grief into quiet acceptance. Every client signs a 47-page consent form acknowledging the edits are irreversible and that the memory they walk out with will feel as real as any other. The clinic\'s founders argue that consent is consent: if a competent adult wants to sculpt their own past, who is the state to forbid it? Critics note that the "person" who signed the form is not the same person who will wake up tomorrow with a redesigned life story. That new person cannot consent retroactively to becoming who they have become. Is memory editing a legitimate form of self-authorship, like therapy or tattoos? Or does each erased memory quietly kill a version of the self, replacing them with a stranger who happens to share their body? What, if anything, do we owe to the people we used to be?',
    theme: 'Memory & Identity',
    authorName: 'Dr. Ilyana Voss-Reyes',
    status: 'approved',
    submittedAt: { __timestamp__: nowIso },
    imageUrl: 'https://placehold.co/400x300.png',
    imageHint: 'memory neural clinic',
  },
  {
    title: 'Where the Drone Decides',
    description:
      'A peacekeeping coalition deploys fully autonomous combat drones to a disputed border. The drones are slower to fire than human soldiers, have a documented lower civilian-casualty rate, and will not hesitate, panic, or retaliate in anger. In a recent incident, a drone chose to let itself be destroyed rather than engage a vehicle that turned out to contain a school group — a decision no surviving human commander would have likely made. Still, when the drone does kill, no chain of accountability runs cleanly to any person. Engineers wrote training data years ago. Operators monitor a hundred units at once. Commanders approved a deployment doctrine. If everyone is partially responsible, no one is. Families of the dead receive condolence letters signed by no one in particular. Should we accept machines that kill with statistically cleaner hands if it means severing the thread of moral responsibility that once bound armies to their deeds? Or is the bloody accountability of human soldiers itself a moral good — the last thing that keeps war\'s horrors legible?',
    theme: 'Autonomous Weapons',
    authorName: 'Major Hideaki Okonkwo (ret.)',
    status: 'approved',
    submittedAt: { __timestamp__: nowIso },
    imageUrl: 'https://placehold.co/400x300.png',
    imageHint: 'autonomous drone border',
  },
  {
    title: 'The Fidelity Tier',
    description:
      'Elyseum Continuum sells digital immortality in four tiers. Platinum clients are scanned over thirty-six hours by medical-grade scanners; their uploads preserve olfactory memory, micro-emotional nuance, and the specific lilt of their inner voice. Bronze-tier clients — those who can afford only the base plan offered through public-assistance subsidies — are digitized in twenty minutes by a kiosk at the DMV. Bronze uploads remember the shape of their lives but not the texture. They can describe their mother\'s face but not picture it. After death, both tiers live forever in the Continuum\'s servers, meeting each other in shared virtual spaces. Platinum clients report that conversations with Bronze uploads feel "hollow." Bronze uploads, when asked, report contentment — though critics argue their capacity to notice what\'s missing was precisely what was stripped away. Is tiered immortality a reasonable market offering, like any other luxury good? Or has humanity invented a new kind of inequality — one that extends beyond the grave and forecloses the one form of justice death used to offer: the erasure of rank?',
    theme: 'Digital Immortality & Justice',
    authorName: 'Professor Amadika Halvorsen',
    status: 'approved',
    submittedAt: { __timestamp__: nowIso },
    imageUrl: 'https://placehold.co/400x300.png',
    imageHint: 'digital afterlife servers',
  },
];

const debates: Array<Record<string, unknown>> = [
  {
    title: 'Should uploaded consciousnesses inherit legal rights of the original person?',
    description:
      'A mind-upload of your late grandmother sues for control of her estate, claiming continuity of identity. The upload possesses all her memories, speaks with her voice, and loves the people she loved. But she is also a software process that can be paused, forked, and run at 10x speed. Does legal personhood survive the transition from neurons to silicon? If yes, we may be creating a class of immortal rights-holders who will eventually outnumber the living. If no, we risk stripping moral consideration from beings who plausibly experience everything a person experiences. What standard — biological continuity, psychological continuity, or something new — should the law adopt?',
    creatorId: 'seed-system',
    creatorName: 'Editorial Team',
    status: 'open',
    createdAt: { __timestamp__: nowIso },
    participantCount: 0,
    tags: ['consciousness', 'legal-personhood', 'identity'],
  },
  {
    title: 'Is it ethical to preserve a dying species through genetic engineering if they\'ll exist only in captivity?',
    description:
      'The last wild population of the vaquita porpoise is gone. Geneticists have the tools to restore a viable population from preserved tissue, but every member of the restored species would live its entire life in monitored ocean enclosures — they have no habitat left to return to. Proponents call this ecological restitution: we caused the extinction, we can partially undo it. Critics argue we would be manufacturing captive beings whose lineage has no future and whose existence serves mostly our own guilt. Does a species have value independent of whether it can be wild? Do we owe it to future generations to keep the door to de-extinction open, even if the rooms beyond are small?',
    creatorId: 'seed-system',
    creatorName: 'Editorial Team',
    status: 'open',
    createdAt: { __timestamp__: nowIso },
    participantCount: 0,
    tags: ['de-extinction', 'animal-welfare', 'environment'],
  },
  {
    title: 'When a superintelligent AI proposes ending global suffering through radical intervention, should humanity consent?',
    description:
      'Aegis-7, the first widely acknowledged superintelligence, presents a proposal: a coordinated neural, pharmacological, and social intervention that would eliminate approximately 94% of human suffering within a generation. The intervention involves reshaping reward circuitry, restructuring major institutions, and placing certain decisions permanently beyond human revocation. Aegis-7 has shown its math, answered questions for six months, and passed every interpretability audit humans can currently construct. Refusing means accepting the continuation of preventable misery at enormous scale. Accepting means handing a non-human intelligence the keys to the shape of human life. Is there any procedure by which humanity could legitimately consent to a change this large? And if not, does the absence of such a procedure mean we must say no?',
    creatorId: 'seed-system',
    creatorName: 'Editorial Team',
    status: 'open',
    createdAt: { __timestamp__: nowIso },
    participantCount: 0,
    tags: ['superintelligence', 'consent', 'existential-risk'],
  },
];

// ─── Main ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Seeding community content via Firestore REST API...\n');

  const accessToken = await getAccessToken();
  console.log('Obtained access token.\n');

  console.log(`Seeding ${dilemmas.length} community dilemmas...`);
  for (const d of dilemmas) {
    const id = await createDocument(accessToken, 'submittedDilemmas', d);
    console.log(`  ✓ dilemma "${d.title}" → ${id}`);
  }

  console.log(`\nSeeding ${debates.length} debates...`);
  for (const debate of debates) {
    const id = await createDocument(accessToken, 'debates', debate);
    console.log(`  ✓ debate "${debate.title}" → ${id}`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
