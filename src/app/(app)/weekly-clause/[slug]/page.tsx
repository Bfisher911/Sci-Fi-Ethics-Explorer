'use client';

import { useParams } from 'next/navigation';
import { WeeklyClauseClient } from '@/components/weekly-clause/weekly-clause-client';

export default function WeeklyClauseDetailPage() {
  const params = useParams();
  return <WeeklyClauseClient slug={params.slug as string} />;
}
