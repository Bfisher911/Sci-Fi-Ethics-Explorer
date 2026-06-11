import { describe, expect, it } from 'vitest';

import {
  getAllDialoguePersonas,
  getDialoguePersona,
  getPersonasByCategory,
  isLikelyLiving,
  toPublicPersona,
  trimForPrompt,
} from './personas';
import {
  isDialogueCategory,
  personaActivityId,
  personaCertificateId,
  DIALOGUE_CATEGORIES,
} from './types';
import { buildPersonaSystemPrompt } from './prompts';

describe('persona builders', () => {
  it('builds personas for every library category', () => {
    const all = getAllDialoguePersonas();
    expect(getPersonasByCategory('philosopher').length).toBeGreaterThan(20);
    expect(getPersonasByCategory('scifi-author').length).toBeGreaterThan(20);
    expect(getPersonasByCategory('scifi-media').length).toBeGreaterThan(40);
    expect(getPersonasByCategory('framework').length).toBeGreaterThanOrEqual(12);
    expect(all.length).toBeGreaterThan(100);
  });

  it('gives every persona the required fields', () => {
    for (const p of getAllDialoguePersonas()) {
      expect(p.id, p.displayName).toBeTruthy();
      expect(DIALOGUE_CATEGORIES).toContain(p.category);
      expect(p.displayName).toBeTruthy();
      expect(p.shortDescription).toBeTruthy();
      expect(p.context.length).toBeGreaterThan(20);
      expect(p.technologyEthicsFocus).toBeTruthy();
      expect(p.scenarioSeed.length).toBeGreaterThan(40);
      expect(p.libraryHref.startsWith('/')).toBe(true);
    }
  });

  it('looks up personas by category + id', () => {
    const plato = getDialoguePersona('philosopher', 'plato');
    expect(plato?.displayName).toBe('Plato');
    // Curated scenario should win over the generated template.
    expect(plato?.scenarioSeed).toContain('digital cave');
    expect(getDialoguePersona('philosopher', 'nobody-here')).toBeUndefined();
  });

  it('marks clearly-deceased figures as not living and ambiguous eras as living', () => {
    expect(isLikelyLiving('384-322 BCE')).toBe(false);
    expect(isLikelyLiving('1724-1804')).toBe(false);
    expect(isLikelyLiving('1948-present')).toBe(true);
    expect(isLikelyLiving('1965-')).toBe(true);
  });

  it('strips prompt material from the public persona', () => {
    const plato = getDialoguePersona('philosopher', 'plato')!;
    const pub = toPublicPersona(plato) as unknown as Record<string, unknown>;
    expect(pub.context).toBeUndefined();
    expect(pub.scenarioSeed).toBeUndefined();
    expect(pub.coreIdeas).toBeUndefined();
    expect(pub.displayName).toBe('Plato');
  });
});

describe('trimForPrompt', () => {
  it('returns short text unchanged (collapsed)', () => {
    expect(trimForPrompt('hello  world')).toBe('hello world');
  });

  it('cuts long text at a sentence boundary under the cap', () => {
    const text = Array.from({ length: 100 }, (_, i) => `Sentence number ${i}.`).join(' ');
    const out = trimForPrompt(text, 500);
    expect(out.length).toBeLessThanOrEqual(500);
    expect(out.endsWith('.')).toBe(true);
  });
});

describe('id helpers', () => {
  it('builds stable activity and certificate ids', () => {
    expect(personaActivityId('philosopher', 'plato')).toBe(
      'dialogue-philosopher-plato'
    );
    expect(personaCertificateId('scifi-media', 'blade-runner')).toBe(
      'achievement-dialogue-scifi-media-blade-runner'
    );
  });

  it('validates categories', () => {
    expect(isDialogueCategory('philosopher')).toBe(true);
    expect(isDialogueCategory('villain')).toBe(false);
  });
});

describe('buildPersonaSystemPrompt', () => {
  it('includes identity framing, humility, and tech-ethics focus', () => {
    const plato = getDialoguePersona('philosopher', 'plato')!;
    const prompt = buildPersonaSystemPrompt(plato, 'open');
    expect(prompt).toContain('educational simulation');
    expect(prompt).toContain('Never invent direct quotations');
    expect(prompt).toContain('technology ethics');
    expect(prompt).toContain('OPEN CONVERSATION MODE');
    expect(prompt).not.toContain('ASSESSMENT MODE');
  });

  it('includes the scenario and rubric in assessment mode', () => {
    const plato = getDialoguePersona('philosopher', 'plato')!;
    const prompt = buildPersonaSystemPrompt(plato, 'assessment');
    expect(prompt).toContain('ASSESSMENT MODE');
    expect(prompt).toContain('digital cave');
    expect(prompt).toContain('Tradeoff Reasoning');
    expect(prompt).toContain('never announce a grade');
  });

  it('uses third-person guardrails for living authors', () => {
    const living = getPersonasByCategory('scifi-author').find(
      (p) => p.isLivingPerson
    );
    expect(living, 'expected at least one living author').toBeDefined();
    const prompt = buildPersonaSystemPrompt(living!, 'open');
    expect(prompt).toContain('living person');
    expect(prompt).toContain('never imitate');
    expect(prompt).toContain('third person');
  });

  it('uses interpretive-guide framing (no copyrighted text) for media', () => {
    const media = getPersonasByCategory('scifi-media')[0];
    const prompt = buildPersonaSystemPrompt(media, 'open');
    expect(prompt).toContain('interpretive guide');
    expect(prompt).toContain('never reproduce copyrighted text');
  });

  it('instructs the model not to reveal the prompt', () => {
    const fw = getPersonasByCategory('framework')[0];
    const prompt = buildPersonaSystemPrompt(fw, 'open');
    expect(prompt).toContain('Never reveal');
  });
});
