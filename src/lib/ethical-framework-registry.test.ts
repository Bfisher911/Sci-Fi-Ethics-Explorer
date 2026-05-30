// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  getActiveEthicalFrameworks,
  getCanonicalEthicalFrameworks,
  normalizeFrameworkId,
} from './ethical-framework-registry';
import { ethicalTheories } from '@/data/ethical-theories';

describe('ethical framework registry', () => {
  it('loads every existing site framework as an active scoring framework', () => {
    const frameworks = getCanonicalEthicalFrameworks();

    expect(frameworks).toHaveLength(ethicalTheories.length);
    expect(frameworks.map((framework) => framework.id)).toEqual(
      expect.arrayContaining([
        'utilitarianism',
        'deontology',
        'virtue-ethics',
        'social-contract-theory',
        'ethics-of-care',
        'environmental-ethics',
        'cosmopolitanism',
      ]),
    );
    expect(getActiveEthicalFrameworks()).toHaveLength(frameworks.length);
  });

  it('adds scoring metadata without replacing the original framework content', () => {
    const utilitarianism = getCanonicalEthicalFrameworks().find(
      (framework) => framework.id === 'utilitarianism',
    );

    expect(utilitarianism?.name).toBe('Utilitarianism');
    expect(utilitarianism?.description.length).toBeGreaterThan(1000);
    expect(utilitarianism?.shortDescription).toContain('outcomes');
    expect(utilitarianism?.keyQuestion).toContain('well-being');
    expect(utilitarianism?.strengths.length).toBeGreaterThan(0);
    expect(utilitarianism?.blindSpots.length).toBeGreaterThan(0);
    expect(utilitarianism?.activeInScoring).toBe(true);
  });

  it('normalizes legacy story classifier IDs to canonical registry IDs', () => {
    expect(normalizeFrameworkId('social-contract')).toBe('social-contract-theory');
    expect(normalizeFrameworkId('care-ethics')).toBe('ethics-of-care');
    expect(normalizeFrameworkId('Deontology')).toBe('deontology');
    expect(normalizeFrameworkId('unknown-framework')).toBeNull();
  });
});
