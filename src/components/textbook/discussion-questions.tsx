'use client';

import { Sparkles } from 'lucide-react';
import { Callout } from './callout';
import { ReflectionPrompt } from './reflection-prompt';
import type { ChapterSection } from '@/types/textbook';

interface DiscussionQuestionsProps {
  section: ChapterSection;
  chapterSlug: string;
}

/**
 * Renders the chapter's open-ended Discussion Questions as a stack of
 * <ReflectionPrompt> widgets. Signed-in users get auto-save.
 */
export function DiscussionQuestions({
  section,
  chapterSlug,
}: DiscussionQuestionsProps) {
  const prompts = section.prompts || [];
  return (
    <Callout
      variant="reflection"
      icon={Sparkles}
      title={section.heading || 'Discussion Questions'}
      lede="Open-ended prompts to think through on your own, in class, or in a study group. Your answers stay private."
    >
      <div className="space-y-4 mt-2">
        {prompts.map((p, i) => (
          <ReflectionPrompt
            key={p.id}
            index={i + 1}
            promptId={p.id}
            prompt={p.prompt}
            chapterSlug={chapterSlug}
          />
        ))}
      </div>
    </Callout>
  );
}
