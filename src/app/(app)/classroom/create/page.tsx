'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { createClassroom } from '@/app/actions/classroom';
import type { Classroom } from '@/types';
import Link from 'next/link';

export default function CreateClassroomPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Classroom | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate(): Promise<void> {
    if (!user || !name.trim()) return;
    setCreating(true);
    setError(null);

    const result = await createClassroom({
      name: name.trim(),
      teacherId: user.uid,
      teacherName: user.displayName || user.email || 'Unknown',
    });

    setCreating(false);
    if (result.success) {
      setCreated(result.data);
    } else {
      setError(result.error);
    }
  }

  function handleCopy(): void {
    if (created) {
      navigator.clipboard.writeText(created.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

      {created ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Classroom Created
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Share this code with your students so they can join:
            </p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold font-mono text-primary tracking-widest">
                {created.joinCode}
              </span>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-500">Copied to clipboard!</p>
            )}
            <Button asChild className="w-full">
              <Link href={`/classroom/${created.id}`}>Go to Classroom</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary">Create a Classroom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="classroom-name">Classroom Name</Label>
              <Input
                id="classroom-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ethics 101 - Fall 2026"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="w-full"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Create Classroom
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
