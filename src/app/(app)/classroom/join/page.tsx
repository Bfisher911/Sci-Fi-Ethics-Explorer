'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { joinClassroom } from '@/app/actions/classroom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinClassroomPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(): Promise<void> {
    if (!user || !joinCode.trim()) return;
    setJoining(true);
    setError(null);

    const result = await joinClassroom(
      joinCode.trim().toUpperCase(),
      user.uid,
      user.displayName || user.email || 'Student'
    );

    setJoining(false);

    if (result.success) {
      router.push(`/classroom/${result.data}`);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/classroom">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classrooms
        </Link>
      </Button>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary">Join a Classroom</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="join-code">Join Code</Label>
            <Input
              id="join-code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="font-mono text-lg tracking-widest text-center"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleJoin}
            disabled={joining || joinCode.length < 6}
            className="w-full"
          >
            {joining ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Join Classroom
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
