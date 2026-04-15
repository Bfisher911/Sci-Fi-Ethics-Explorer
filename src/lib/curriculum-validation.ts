import type { CurriculumPath } from '@/types';

/**
 * Validate a curriculum has at least one module and no empty modules
 * (each module has at least one item with a referenced artifact).
 */
export function validateCurriculum(
  c: Pick<CurriculumPath, 'modules' | 'title'>
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!c.title?.trim()) errors.push('Title is required.');
  if (!c.modules || c.modules.length === 0) {
    errors.push('At least one module is required.');
  } else {
    c.modules.forEach((m, i) => {
      if (!m.items || m.items.length === 0) {
        errors.push(`Module ${i + 1} ("${m.title || 'Untitled'}") has no items.`);
      }
      m.items?.forEach((item, j) => {
        if (!item.referenceId) {
          errors.push(`Module ${i + 1} item ${j + 1} has no referenced artifact.`);
        }
      });
    });
  }
  return { ok: errors.length === 0, errors };
}
