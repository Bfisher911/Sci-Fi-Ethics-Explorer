'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { updateSharedNotes } from '@/app/actions/workshops';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';

interface SharedNotesProps {
  workshopId: string;
}

/**
 * Collaborative shared notes editor with real-time sync and debounced saves.
 */
export function SharedNotes({ workshopId }: SharedNotesProps) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLocalChange = useRef(false);

  // Listen for remote changes
  useEffect(() => {
    if (!db) return;

    const workshopRef = doc(db, 'workshops', workshopId);
    const unsubscribe = onSnapshot(workshopRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      // Only update from remote if not a local pending change
      if (!isLocalChange.current) {
        setNotes(data.sharedNotes ?? '');
      }
    });

    return () => unsubscribe();
  }, [workshopId]);

  const saveNotes = useCallback(
    async (value: string) => {
      setSaving(true);
      isLocalChange.current = true;
      try {
        await updateSharedNotes(workshopId, value);
      } catch (error) {
        console.error('Failed to save notes:', error);
      } finally {
        setSaving(false);
        // Allow remote updates again after a brief delay
        setTimeout(() => {
          isLocalChange.current = false;
        }, 500);
      }
    },
    [workshopId]
  );

  const handleChange = (value: string) => {
    setNotes(value);
    isLocalChange.current = true;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      saveNotes(value);
    }, 1000);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Shared Notes
          {saving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Collaborate on notes here. Changes are saved automatically..."
          className="min-h-[200px] resize-y"
          aria-label="Shared notes"
        />
      </CardContent>
    </Card>
  );
}
