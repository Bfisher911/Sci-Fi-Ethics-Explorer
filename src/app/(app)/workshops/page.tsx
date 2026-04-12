'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getWorkshops } from '@/app/actions/workshops';
import { CreateWorkshopDialog } from '@/components/workshops/create-workshop-dialog';
import type { Workshop } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Workshop listing page with ability to create new workshops.
 */
export default function WorkshopsPage() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const result = await getWorkshops();
      if (result.success) {
        setWorkshops(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-primary font-headline flex items-center gap-3">
              <Users className="h-9 w-9" />
              Workshops
            </h1>
            <p className="text-lg text-muted-foreground">
              Collaborate with others on ethical dilemmas in real-time.
            </p>
          </div>
          <CreateWorkshopDialog onCreated={() => fetchWorkshops()} />
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-40 text-muted-foreground" />
            <p className="text-muted-foreground">
              No workshops yet. Create one to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <Card
              key={workshop.id}
              className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg">{workshop.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {workshop.description || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {workshop.participantIds.length}/{workshop.maxParticipants}
                  </span>
                  <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-muted">
                    {workshop.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Hosted by {workshop.hostName}
                </p>
                <Link href={`/workshops/${workshop.id}`}>
                  <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                    Enter Workshop
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
