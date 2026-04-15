/**
 * Derives a subtle atmospheric theme (color palette + mood descriptor)
 * from a story's theme/genre text. Pure keyword heuristic — no AI call —
 * so it's cheap to run on every render.
 */

export type MoodId =
  | 'dystopian'
  | 'utopian'
  | 'mystery'
  | 'existential'
  | 'conflict'
  | 'discovery'
  | 'melancholy'
  | 'neutral';

export interface MoodTheme {
  id: MoodId;
  label: string;
  /** Background gradient applied behind segment text. */
  gradient: string;
  /** Primary accent color as HSL triplet (for CSS variable overrides). */
  accentHsl: string;
  /** Base frequency (Hz) for the generated ambient drone. */
  ambientFreq: number;
}

const THEMES: Record<MoodId, MoodTheme> = {
  dystopian: {
    id: 'dystopian',
    label: 'Dystopian',
    gradient:
      'radial-gradient(ellipse at 20% 0%, rgba(220,38,38,0.10), transparent 55%), radial-gradient(ellipse at 90% 90%, rgba(100,10,10,0.15), transparent 60%)',
    accentHsl: '0 72% 55%',
    ambientFreq: 55,
  },
  utopian: {
    id: 'utopian',
    label: 'Hopeful',
    gradient:
      'radial-gradient(ellipse at 30% 0%, rgba(125,249,255,0.12), transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(163,230,255,0.10), transparent 60%)',
    accentHsl: '187 100% 75%',
    ambientFreq: 220,
  },
  mystery: {
    id: 'mystery',
    label: 'Enigmatic',
    gradient:
      'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12), transparent 55%), radial-gradient(ellipse at 20% 100%, rgba(30,20,80,0.20), transparent 60%)',
    accentHsl: '262 83% 68%',
    ambientFreq: 73,
  },
  existential: {
    id: 'existential',
    label: 'Contemplative',
    gradient:
      'radial-gradient(ellipse at 50% 0%, rgba(148,163,184,0.10), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(30,41,59,0.20), transparent 60%)',
    accentHsl: '215 20% 65%',
    ambientFreq: 98,
  },
  conflict: {
    id: 'conflict',
    label: 'Tense',
    gradient:
      'radial-gradient(ellipse at 10% 10%, rgba(251,146,60,0.10), transparent 55%), radial-gradient(ellipse at 90% 90%, rgba(220,38,38,0.08), transparent 60%)',
    accentHsl: '24 95% 60%',
    ambientFreq: 65,
  },
  discovery: {
    id: 'discovery',
    label: 'Wondrous',
    gradient:
      'radial-gradient(ellipse at 20% 20%, rgba(52,211,153,0.10), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(125,249,255,0.10), transparent 60%)',
    accentHsl: '160 64% 55%',
    ambientFreq: 174,
  },
  melancholy: {
    id: 'melancholy',
    label: 'Melancholy',
    gradient:
      'radial-gradient(ellipse at 30% 0%, rgba(59,130,246,0.10), transparent 55%), radial-gradient(ellipse at 70% 100%, rgba(15,23,42,0.20), transparent 60%)',
    accentHsl: '217 91% 65%',
    ambientFreq: 82,
  },
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    gradient:
      'radial-gradient(ellipse at 50% 0%, rgba(125,249,255,0.08), transparent 60%)',
    accentHsl: '187 100% 75%',
    ambientFreq: 110,
  },
};

const CUES: Record<Exclude<MoodId, 'neutral'>, string[]> = {
  dystopian: ['dystop', 'oppress', 'surveill', 'totalitarian', 'authoritarian', 'control', 'regime'],
  utopian: ['utop', 'hope', 'flourish', 'harmon', 'post-scarcity', 'paradise'],
  mystery: ['mystery', 'unknown', 'enigma', 'secret', 'hidden', 'conspiracy', 'alien'],
  existential: ['existential', 'consciousness', 'identity', 'memory', 'self', 'meaning', 'mortality', 'what it means'],
  conflict: ['war', 'battle', 'rebel', 'revolt', 'uprising', 'conflict', 'siege', 'combat'],
  discovery: ['discover', 'explor', 'first contact', 'frontier', 'expedition', 'voyage', 'signal'],
  melancholy: ['loss', 'grief', 'lonely', 'solitude', 'fade', 'decline', 'ending', 'ruin'],
};

export function getMoodTheme(...texts: (string | undefined)[]): MoodTheme {
  const haystack = texts.filter(Boolean).join(' ').toLowerCase();
  let best: MoodId = 'neutral';
  let bestScore = 0;
  for (const [id, cues] of Object.entries(CUES) as [MoodId, string[]][]) {
    let score = 0;
    for (const cue of cues) {
      if (haystack.includes(cue)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return THEMES[best];
}
