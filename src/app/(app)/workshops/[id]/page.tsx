'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getWorkshopById } from '@/app/actions/workshops';
import { WorkshopRoom } from '@/components/workshops/workshop-room';
import type { Workshop } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

/**
 * Individual workshop room page.
 */
export default function WorkshopDetailPage() {
  const params = useParams();
  const workshopId = params.id as string;
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await getWorkshopById(workshopId);
        if (result.success) {
          if (!result.data) {
            setError('Workshop not found.');
          } else {
            setWorkshop(result.data);
          }
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error('Failed to load workshop:', err);
        setError('Failed to load workshop.');
      } finally {
        setLoading(false);
      }
    }

    if (workshopId) {
      load();
    }
  }, [workshopId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-60" />
            <p className="text-muted-foreground">
              {error ?? 'Workshop not found.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <WorkshopRoom workshop={workshop} />
    </div>
  );
}
