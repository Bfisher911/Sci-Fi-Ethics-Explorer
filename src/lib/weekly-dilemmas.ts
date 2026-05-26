export interface PeerVisibilityInput {
  hasSubmitted: boolean;
  responseRequiredToViewPeers?: boolean;
}

export function canViewWeeklyDilemmaPeerResponses(input: PeerVisibilityInput): boolean {
  const responseRequired = input.responseRequiredToViewPeers ?? true;
  return !responseRequired || input.hasSubmitted;
}

export const WEEKLY_DILEMMA_ADMIN_CREDENTIALS_ERROR =
  'Firebase Admin credentials are required for Weekly Clause data.';

export function isMissingWeeklyDilemmaAdminCredentialsError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes(WEEKLY_DILEMMA_ADMIN_CREDENTIALS_ERROR);
}

export function createEmptyWeeklyDilemmaLoadData() {
  return {
    dilemma: null,
    ownResponse: null,
    peerResponses: [],
    replies: [],
    peersLocked: true,
  };
}

export function buildWeeklyDilemmaSlug(title: string, publishDate: Date): string {
  const datePart = publishDate.toISOString().slice(0, 10);
  const titlePart = title
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return `${datePart}-${titlePart}`;
}

export function shouldCreateWeeklyDilemmaForWeek(input: {
  targetIsoWeek: string;
  existingIsoWeeks: string[];
}): boolean {
  return !input.existingIsoWeeks.includes(input.targetIsoWeek);
}

export function getIsoWeek(date: Date): string {
  const working = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = working.getUTCDay() || 7;
  working.setUTCDate(working.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(working.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((working.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${working.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
