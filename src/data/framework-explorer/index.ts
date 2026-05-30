/**
 * Framework Explorer — aggregate index.
 *
 * Collects the 12 modules, exposes lookup helpers, and provides the
 * progressive-unlock rule (module N unlocks once module N-1 is
 * complete). This is the synchronous, static content source the
 * Framework Explorer UI reads; per-user progress lives in Firestore
 * (see src/app/actions/framework-explorer.ts).
 */

import type {
  FrameworkModule,
  FrameworkQuestion,
} from '@/types/framework-explorer';
import { module01 } from './module-01';
import { module02 } from './module-02';
import { module03 } from './module-03';
import { module04 } from './module-04';
import { module05 } from './module-05';
import { module06 } from './module-06';
import { module07 } from './module-07';
import { module08 } from './module-08';
import { module09 } from './module-09';
import { module10 } from './module-10';
import { module11 } from './module-11';
import { module12 } from './module-12';

export const FRAMEWORK_MODULES: FrameworkModule[] = [
  module01,
  module02,
  module03,
  module04,
  module05,
  module06,
  module07,
  module08,
  module09,
  module10,
  module11,
  module12,
];

export const TOTAL_MODULES = FRAMEWORK_MODULES.length;
export const QUESTIONS_PER_MODULE = 20;

/** Module by 1-based number. */
export function getModuleByNumber(n: number): FrameworkModule | undefined {
  return FRAMEWORK_MODULES.find((m) => m.moduleNumber === n);
}

/** Module by id. */
export function getModuleById(id: string): FrameworkModule | undefined {
  return FRAMEWORK_MODULES.find((m) => m.id === id);
}

/** Every question across all modules (flattened). */
export function getAllQuestions(): FrameworkQuestion[] {
  return FRAMEWORK_MODULES.flatMap((m) => m.questions);
}

/**
 * Progressive unlock: module 1 is always unlocked; module N unlocks
 * once module N-1 is in `completedModules`. Returns the set of
 * unlocked module numbers given a list of completed ones.
 */
export function unlockedModuleNumbers(completed: number[]): number[] {
  const done = new Set(completed);
  const unlocked: number[] = [1];
  for (let n = 2; n <= TOTAL_MODULES; n++) {
    if (done.has(n - 1)) unlocked.push(n);
    else break;
  }
  return unlocked;
}

/** Is a given module number unlocked for a user with `completed` modules? */
export function isModuleUnlocked(
  moduleNumber: number,
  completed: number[],
): boolean {
  if (moduleNumber === 1) return true;
  return completed.includes(moduleNumber - 1);
}

/** Highest unlocked module number. */
export function highestUnlocked(completed: number[]): number {
  const u = unlockedModuleNumbers(completed);
  return u[u.length - 1] ?? 1;
}
