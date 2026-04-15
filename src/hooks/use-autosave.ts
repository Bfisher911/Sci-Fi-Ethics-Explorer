'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Story } from '@/types';
import { saveStoryDraft } from '@/app/actions/stories';

export type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveOptions {
  /** Milliseconds of inactivity before auto-saving. Default: 30_000. */
  debounceMs?: number;
  /** Called when a save completes successfully. */
  onSave?: () => void;
  /** Called when a save fails. */
  onError?: (err: string) => void;
  /** When false, auto-save is disabled (hook is inert). */
  enabled?: boolean;
}

export interface UseAutoSaveResult {
  /** Current auto-save status. */
  status: AutoSaveStatus;
  /** When the last successful save happened. */
  lastSavedAt: Date | null;
  /** Last error message (if status === 'error'). */
  error: string | null;
  /** Manually trigger a save right now (bypasses the debounce). */
  saveNow: () => Promise<void>;
  /** Reset status to idle (e.g. after reloading the story). */
  reset: () => void;
}

/**
 * Debounced auto-save hook for the story editor.
 *
 * - Watches `formData` and, after `debounceMs` of inactivity, calls
 *   `saveStoryDraft(storyId, userId, formData)`.
 * - Cancels any pending save on unmount so in-flight edits aren't lost.
 * - Exposes a `saveNow()` escape hatch for explicit save actions.
 *
 * Auto-save does NOT fire while a save is already in progress; the next
 * change will re-arm the debounce once the current save resolves.
 */
export function useAutoSave(
  storyId: string | undefined,
  formData: Partial<Story> | null,
  userId: string | undefined,
  options: UseAutoSaveOptions = {}
): UseAutoSaveResult {
  const {
    debounceMs = 30_000,
    onSave,
    onError,
    enabled = true,
  } = options;

  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs so the inner effect doesn't tear down on every keystroke.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);
  const inFlightRef = useRef(false);
  const latestFormRef = useRef<Partial<Story> | null>(formData);
  const serializedRef = useRef<string>('');
  const onSaveRef = useRef(onSave);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSaveRef.current = onSave;
    onErrorRef.current = onError;
  }, [onSave, onError]);

  useEffect(() => {
    latestFormRef.current = formData;
  }, [formData]);

  const doSave = useCallback(async (): Promise<void> => {
    if (!storyId || !userId) return;
    const data = latestFormRef.current;
    if (!data) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setStatus('saving');
    setError(null);
    try {
      const result = await saveStoryDraft(storyId, userId, data);
      if (cancelledRef.current) return;
      if (!result.success) {
        setStatus('error');
        setError(result.error || 'Failed to save draft.');
        onErrorRef.current?.(result.error || 'Failed to save draft.');
        return;
      }
      setLastSavedAt(new Date());
      setStatus('saved');
      onSaveRef.current?.();
    } catch (err) {
      if (cancelledRef.current) return;
      const msg = err instanceof Error ? err.message : String(err);
      setStatus('error');
      setError(msg);
      onErrorRef.current?.(msg);
    } finally {
      inFlightRef.current = false;
    }
  }, [storyId, userId]);

  // Debounce effect keyed on a stable serialization of formData.
  useEffect(() => {
    if (!enabled) return;
    if (!storyId || !userId) return;
    if (!formData) return;

    // Serialize defensively; if it hasn't actually changed, bail.
    let serialized = '';
    try {
      serialized = JSON.stringify(formData);
    } catch {
      // If the form can't be serialized, skip auto-save this tick.
      return;
    }
    const isFirstBaseline = serializedRef.current === '';
    if (serialized === serializedRef.current) return;
    serializedRef.current = serialized;

    // On the very first baseline (initial hydration), don't schedule a
    // save — just record it so subsequent edits trigger the debounce.
    if (isFirstBaseline) return;

    setStatus('pending');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!cancelledRef.current) void doSave();
    }, debounceMs);
  }, [formData, storyId, userId, enabled, debounceMs, doSave]);

  // Cleanup on unmount — cancel any pending timer.
  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const saveNow = useCallback(async (): Promise<void> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await doSave();
  }, [doSave]);

  const reset = useCallback((): void => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStatus('idle');
    setError(null);
    setLastSavedAt(null);
    serializedRef.current = '';
  }, []);

  return { status, lastSavedAt, error, saveNow, reset };
}
