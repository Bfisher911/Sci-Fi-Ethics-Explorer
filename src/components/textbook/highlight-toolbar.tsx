'use client';

/**
 * Floating "Save quote" toolbar that appears when the user selects
 * text inside a chapter article.
 *
 * Behavior:
 *   - Listens for window-level `selectionchange`, debounced ~150ms.
 *   - When a non-empty Range is selected AND the selection's start
 *     element is inside the `[data-highlightable="true"]` ancestor
 *     (which the chapter page renders on its <article>), shows the
 *     toolbar above the selection.
 *   - Click "Save quote" → saveHighlight server action.
 *   - Click "Save with note" → reveals an inline note field, saves on
 *     blur or Enter.
 *   - Anonymous users see a sign-in nudge instead of a save button.
 *
 * The toolbar is fixed-positioned and sized to fit small mobile
 * viewports. It hides itself on Esc and on selection-cleared events.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Highlighter, Loader2, MessageSquarePlus, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { saveHighlight } from '@/app/actions/textbook';

interface Props {
  chapterSlug: string;
}

const MIN_SELECT_LEN = 8;
// Lift the toolbar above the selection by this many CSS pixels so it
// doesn't overlap the highlighted text.
const VERTICAL_OFFSET = 44;

interface ToolbarPos {
  top: number;
  left: number;
}

function isInsideHighlightable(node: Node | null): boolean {
  let n: Node | null = node;
  while (n) {
    if (n instanceof HTMLElement && n.dataset.highlightable === 'true') {
      return true;
    }
    n = n.parentNode;
  }
  return false;
}

export function HighlightToolbar({ chapterSlug }: Props): JSX.Element | null {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pos, setPos] = useState<ToolbarPos | null>(null);
  const [text, setText] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setPos(null);
      setText('');
      setShowNote(false);
      setNote('');
      return;
    }
    const raw = sel.toString().trim();
    if (raw.length < MIN_SELECT_LEN) {
      setPos(null);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!isInsideHighlightable(range.startContainer)) {
      setPos(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      setPos(null);
      return;
    }
    // Position the toolbar centered above the selection, clamped to
    // viewport so it doesn't fall off the right edge on narrow screens.
    const TOOLBAR_W = 280;
    let left = rect.left + rect.width / 2 - TOOLBAR_W / 2;
    if (left < 8) left = 8;
    if (left + TOOLBAR_W > window.innerWidth - 8) {
      left = window.innerWidth - TOOLBAR_W - 8;
    }
    let top = rect.top - VERTICAL_OFFSET;
    // If the selection is too close to the top of the viewport, flip
    // the toolbar to appear below.
    if (top < 8) {
      top = rect.bottom + 8;
    }
    setText(raw);
    setPos({ top, left });
  }, []);

  useEffect(() => {
    function onSelectionChange() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(handleSelection, 150);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPos(null);
        setShowNote(false);
        setNote('');
      }
    }
    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('keydown', onKey);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [handleSelection]);

  async function commit(withNote: boolean) {
    if (!user || !text) return;
    setSaving(true);
    const res = await saveHighlight({
      userId: user.uid,
      slug: chapterSlug,
      text,
      note: withNote ? note : undefined,
    });
    setSaving(false);
    if (res.success) {
      toast({
        title: 'Saved to your highlights',
        description: 'Find it later under My hub → Reflections.',
      });
      setPos(null);
      setShowNote(false);
      setNote('');
      // Clear the selection so the toolbar doesn't immediately re-appear
      // on selectionchange.
      window.getSelection()?.removeAllRanges();
    } else {
      toast({
        variant: 'destructive',
        title: 'Could not save',
        description: res.error,
      });
    }
  }

  if (!pos) return null;

  return (
    <div
      role="dialog"
      aria-label="Highlight toolbar"
      className="fixed z-50 w-[280px] rounded-lg border bg-popover p-2 shadow-xl backdrop-blur-md"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <Highlighter className="h-3 w-3" /> Highlight
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-muted/30"
          onClick={() => {
            setPos(null);
            setShowNote(false);
            setNote('');
          }}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {!user ? (
        <div className="mt-2 text-xs text-muted-foreground">
          <Link
            href={`/login?next=/textbook/chapters/${chapterSlug}`}
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>{' '}
          to save quotes from this chapter to your hub.
        </div>
      ) : showNote ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why does this matter to you?"
            rows={3}
            className="w-full resize-none rounded-md border bg-background/60 px-2 py-1.5 text-xs leading-relaxed focus:border-primary focus:outline-none"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="text-[11px] text-muted-foreground hover:text-foreground"
              onClick={() => {
                setShowNote(false);
                setNote('');
              }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground disabled:opacity-50"
              onClick={() => commit(true)}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <MessageSquarePlus className="h-3 w-3" />
              )}
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="flex-1 rounded-md bg-primary px-2 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            onClick={() => commit(false)}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mx-auto h-3 w-3 animate-spin" />
            ) : (
              'Save quote'
            )}
          </button>
          <button
            type="button"
            className="rounded-md border border-border/60 px-2 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted/30"
            onClick={() => setShowNote(true)}
            disabled={saving}
            title="Save with a note"
          >
            <MessageSquarePlus className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
