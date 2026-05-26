# Unified Ethical Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one site-wide ethical judgment engine that records, scores, aggregates, and reports learner ethical decisions across OffWorld Clause.

**Architecture:** Extend the existing `ethicalTheories` data as the canonical framework registry, then add typed judgment events, strict scoring validation, profile aggregation, and feature-specific submission actions. Existing progress and factual quiz systems remain intact for backwards compatibility.

**Tech Stack:** Next.js 15 server actions, Firebase/Firestore, Genkit/Gemini, Zod, Vitest, React, Recharts.

---

### Task 1: Core Registry, Event Validation, and Aggregation

**Files:**
- Create: `src/lib/ethical-framework-registry.ts`
- Create: `src/lib/ethical-framework-registry.test.ts`
- Create: `src/lib/ethical-judgment/validation.ts`
- Create: `src/lib/ethical-judgment/aggregation.ts`
- Create: `src/lib/ethical-judgment/aggregation.test.ts`
- Modify: `src/types/index.ts`

- [ ] Write failing tests for active framework registry loading, legacy framework ID normalization, event validation, malformed AI output rejection, and aggregate score computation.
- [ ] Implement registry metadata, Zod schemas, normalized 0-100 framework score validation, and aggregate profile summaries.
- [ ] Run `npm test -- src/lib/ethical-framework-registry.test.ts src/lib/ethical-judgment/aggregation.test.ts`.

### Task 2: Shared Recording Service and AI Scoring

**Files:**
- Create: `src/ai/flows/score-ethical-judgment.ts`
- Create: `src/app/actions/ethical-judgments.ts`
- Create: `src/lib/ethical-judgment/recording.ts`
- Create: `src/lib/ethical-judgment/recording.test.ts`

- [ ] Write failing tests for deterministic mapped scoring, AI output validation, knowledge-quiz separation, short/off-topic debate reply skipping, and profile update weighting.
- [ ] Implement `recordEthicalJudgmentEvent`, `scoreEthicalJudgment`, and report-safe feedback language.
- [ ] Run targeted Vitest tests, then `npm test`.

### Task 3: Existing Interaction Integration

**Files:**
- Modify: `src/app/(app)/stories/[id]/page.tsx`
- Modify: `src/components/framework-explorer/ethical-framework-quiz.tsx`
- Modify: `src/components/analysis/perspective-comparison.tsx`
- Modify: `src/app/actions/debates.ts`
- Modify: `src/app/actions/progress.ts`
- Modify: `src/lib/choice-frameworks.ts`

- [ ] Add tests around helper functions for full-framework scoring and old story compatibility.
- [ ] Route story choices, Framework Explorer results, perspective choices, and debate arguments through the shared event service.
- [ ] Preserve existing `userProgress` writes and public routes.

### Task 4: Sci-Fi Media Ethical Scenario Reflection

**Files:**
- Create: `src/data/scifi-media-scenario-reflections.ts`
- Create: `src/components/scifi-media/ethical-scenario-reflection.tsx`
- Create: `src/app/actions/scifi-media-reflections.ts`
- Modify: `src/types/index.ts`
- Modify: `src/app/actions/scifi-media.ts`
- Modify: `src/app/(app)/scifi-media/[id]/page.tsx`
- Modify: `src/scripts/generate-media-quizzes.ts`

- [ ] Write tests for scenario reflection shape and profile-affecting submission.
- [ ] Add scenario questions with defensible options, open-ended reasoning, option framework mappings, feedback, and event recording.
- [ ] Keep factual media quizzes separate.

### Task 5: Weekly Clause

**Files:**
- Create: `src/app/actions/weekly-dilemmas.ts`
- Create: `src/app/(app)/weekly-clause/page.tsx`
- Create: `src/app/(app)/weekly-clause/[slug]/page.tsx`
- Create: `src/components/weekly-clause/weekly-clause-client.tsx`
- Create: `src/app/api/cron/weekly-dilemma/route.ts`
- Modify: `src/types/index.ts`
- Modify: `firestore.rules`
- Modify: `netlify.toml`

- [ ] Write tests for response-required peer visibility, duplicate weekly generation prevention, and profile event creation.
- [ ] Implement server-enforced peer response unlock, response submission, reply submission, and admin/cron generation.
- [ ] Add dashboard/navigation links if the existing layout has a safe insertion point.

### Task 6: Profile and Student Report

**Files:**
- Create: `src/components/profile/unified-ethical-profile.tsx`
- Create: `src/components/reports/generate-ethics-report-button.tsx`
- Create: `src/app/actions/ethical-reports.ts`
- Modify: `src/components/profile/progress-dashboard.tsx`
- Modify: `src/app/(app)/profile/page.tsx`

- [ ] Write tests for report payload generation and aggregate display helpers.
- [ ] Add profile overview, strongest/least-used frameworks, recent decisions, tensions, growth signals, and generated learning report.
- [ ] Reuse print/export affordances where practical.

### Task 7: Verification

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Start `npm run dev` and preview the updated pages locally.
- [ ] Document files changed, environment variables, manual test paths, assumptions, and limitations.
