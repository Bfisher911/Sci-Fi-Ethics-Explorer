'use client';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { StorySubGenre, StoryTechLevel } from '@/types';
import {
  Binary,
  Brain,
  Cpu,
  Dna,
  Flower2,
  Globe2,
  Infinity as InfinityIcon,
  Layers,
  Orbit,
  Radiation,
  Rocket,
  Scale,
  ShieldAlert,
  Sparkles,
  Telescope,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';

// ─── Sub-Genre dropdown ──────────────────────────────────────────────

const SUB_GENRE_ORDER: StorySubGenre[] = [
  'Cyberpunk',
  'Solarpunk',
  'Space Opera',
  'Hard Sci-Fi',
  'Dystopian',
  'Biopunk',
  'Post-Apocalyptic',
  'First Contact',
  'Time Travel',
];

const SUB_GENRE_ICONS: Record<StorySubGenre, React.ElementType> = {
  Cyberpunk: Zap,
  Solarpunk: Flower2,
  'Space Opera': Rocket,
  'Hard Sci-Fi': Wrench,
  Dystopian: ShieldAlert,
  Biopunk: Dna,
  'Post-Apocalyptic': Radiation,
  'First Contact': Telescope,
  'Time Travel': Orbit,
};

const SUB_GENRE_BLURB: Record<StorySubGenre, string> = {
  Cyberpunk: 'High-tech, low-life. Neon-soaked streets and corporate shadows.',
  Solarpunk: 'Hopeful futures where ecology and technology co-exist.',
  'Space Opera': 'Grand-scale stories across worlds and star systems.',
  'Hard Sci-Fi': 'Rigorous science, plausible engineering, careful extrapolation.',
  Dystopian: 'Oppressive systems and the people who live inside them.',
  Biopunk: 'Genetic frontiers, bespoke organisms, biological augmentation.',
  'Post-Apocalyptic': 'Life after the collapse.',
  'First Contact': 'Meeting the other for the first time.',
  'Time Travel': 'Causality, paradox, the ache of what was and wasn\'t.',
};

const UNSET_SUB_GENRE = '__unset_sub_genre__';

interface SubGenreSelectProps {
  value?: StorySubGenre;
  onChange: (value: StorySubGenre | undefined) => void;
  id?: string;
}

export function SubGenreSelect({ value, onChange, id }: SubGenreSelectProps): JSX.Element {
  const ActiveIcon = value ? SUB_GENRE_ICONS[value] : Layers;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium">
        <Layers className="h-3.5 w-3.5 text-primary" />
        Sub-Genre
      </Label>
      <Select
        value={value ?? UNSET_SUB_GENRE}
        onValueChange={(v) => onChange(v === UNSET_SUB_GENRE ? undefined : (v as StorySubGenre))}
      >
        <SelectTrigger id={id} className="w-full">
          <div className="flex items-center gap-2">
            <ActiveIcon className="h-4 w-4 text-primary" />
            <SelectValue placeholder="Pick a sub-genre (optional)" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET_SUB_GENRE}>
            <span className="text-muted-foreground">Unspecified</span>
          </SelectItem>
          {SUB_GENRE_ORDER.map((sg) => {
            const Icon = SUB_GENRE_ICONS[sg];
            return (
              <SelectItem key={sg} value={sg}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-medium">{sg}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {SUB_GENRE_BLURB[sg]}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Ethical Focus — Neural-Map Tag Cloud ────────────────────────────

interface EthicalFocusTag {
  label: string;
  icon: React.ElementType;
}

const ETHICAL_FOCUS_TAGS: EthicalFocusTag[] = [
  { label: 'AI Rights', icon: Cpu },
  { label: 'Bio-Ethics', icon: Dna },
  { label: 'Neural Mapping', icon: Brain },
  { label: 'Resource Scarcity', icon: Scale },
  { label: 'Corporate Hegemony', icon: ShieldAlert },
  { label: 'Genetic Engineering', icon: Dna },
  { label: 'Surveillance', icon: Telescope },
  { label: 'Consciousness', icon: Sparkles },
  { label: 'Climate Justice', icon: Globe2 },
  { label: 'Digital Identity', icon: Users },
  { label: 'Mortality', icon: Orbit },
  { label: 'Synthetic Biology', icon: Dna },
];

interface EthicalFocusTagCloudProps {
  values: string[];
  onChange: (next: string[]) => void;
}

/**
 * "Neural Map" style multi-select: tags glow with a neon border when active.
 */
export function EthicalFocusTagCloud({
  values,
  onChange,
}: EthicalFocusTagCloudProps): JSX.Element {
  const selected = new Set(values);
  const toggle = (label: string): void => {
    const next = new Set(selected);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    onChange(Array.from(next));
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-sm font-medium">
        <Brain className="h-3.5 w-3.5 text-primary" />
        Ethical Focus
        <span className="text-xs text-muted-foreground font-normal">
          (choose any that apply)
        </span>
      </Label>
      <div
        className="flex flex-wrap gap-2 p-3 rounded-md border border-border/60 bg-muted/20 relative overflow-hidden"
        aria-label="Ethical focus neural map"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(125,249,255,0.08), transparent 40%), radial-gradient(circle at 80% 70%, rgba(139,92,246,0.08), transparent 40%)',
          }}
        />
        {ETHICAL_FOCUS_TAGS.map(({ label, icon: Icon }) => {
          const active = selected.has(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              aria-pressed={active}
              className={cn(
                'relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200',
                active
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_0_14px_-2px_hsl(var(--primary)/0.6)]'
                  : 'border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', active && 'text-primary')} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Complexity slider ───────────────────────────────────────────────

interface ComplexitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

const COMPLEXITY_LABEL: Record<number, string> = {
  1: 'Binary — clear right and wrong',
  2: 'Low Ambiguity',
  3: 'Contested Ground',
  4: 'Deeply Grey',
  5: 'Infinite Complexity',
};

/**
 * 1–5 range slider for "Moral Grey-Scale".
 */
export function ComplexitySlider({ value, onChange }: ComplexitySliderProps): JSX.Element {
  const clamped = Math.min(5, Math.max(1, value || 1));
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-sm font-medium">
        <Scale className="h-3.5 w-3.5 text-primary" />
        Moral Grey-Scale
      </Label>
      <div className="px-3 py-4 rounded-md border border-border/60 bg-muted/20 space-y-3">
        <Slider
          value={[clamped]}
          min={1}
          max={5}
          step={1}
          onValueChange={(v) => onChange(v[0] ?? 1)}
          aria-label="Complexity"
        />
        <div className="flex justify-between items-center text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Binary className="h-3 w-3" />
            Binary
          </span>
          <span className="font-semibold text-primary text-sm">
            {clamped} / 5 — {COMPLEXITY_LABEL[clamped]}
          </span>
          <span className="flex items-center gap-1">
            Infinite
            <InfinityIcon className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Tech Level select ───────────────────────────────────────────────

const TECH_LEVELS: { value: StoryTechLevel; blurb: string }[] = [
  { value: 'Near-Future', blurb: 'Recognizable tech stretched one step further.' },
  { value: 'Mid-Future', blurb: 'Mature versions of today\'s emerging technology.' },
  { value: 'Galactic', blurb: 'Interstellar civilizations and megaengineering.' },
  { value: 'Post-Human', blurb: 'Beyond biological humanity as we know it.' },
];

const UNSET_TECH = '__unset_tech__';

interface TechLevelSelectProps {
  value?: StoryTechLevel;
  onChange: (value: StoryTechLevel | undefined) => void;
  id?: string;
}

export function TechLevelSelect({ value, onChange, id }: TechLevelSelectProps): JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium">
        <Rocket className="h-3.5 w-3.5 text-primary" />
        Tech Level
      </Label>
      <Select
        value={value ?? UNSET_TECH}
        onValueChange={(v) => onChange(v === UNSET_TECH ? undefined : (v as StoryTechLevel))}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Pick a tech setting (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET_TECH}>
            <span className="text-muted-foreground">Unspecified</span>
          </SelectItem>
          {TECH_LEVELS.map(({ value: v, blurb }) => (
            <SelectItem key={v} value={v}>
              <div className="flex flex-col">
                <span className="font-medium">{v}</span>
                <span className="text-[11px] text-muted-foreground">{blurb}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
