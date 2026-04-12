'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User } from 'lucide-react';

interface ParticipantPanelProps {
  workshopId: string;
}

interface Participant {
  uid: string;
  displayName: string;
}

/**
 * Real-time participant panel using Firestore onSnapshot.
 */
export function ParticipantPanel({ workshopId }: ParticipantPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!db) return;

    const workshopRef = doc(db, 'workshops', workshopId);
    const unsubscribe = onSnapshot(workshopRef, async (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      const ids: string[] = data.participantIds ?? [];

      // Fetch display names for participants
      const participantList: Participant[] = [];
      for (const uid of ids) {
        try {
          const userDoc = await getDoc(doc(db!, 'users', uid));
          const userData = userDoc.data();
          participantList.push({
            uid,
            displayName: userData?.displayName ?? userData?.email ?? 'Anonymous',
          });
        } catch {
          participantList.push({ uid, displayName: 'Anonymous' });
        }
      }
      setParticipants(participantList);
    });

    return () => unsubscribe();
  }, [workshopId]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {participants.map((p) => (
            <div key={p.uid} className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm truncate">{p.displayName}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
