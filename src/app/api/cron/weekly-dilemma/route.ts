import { NextResponse } from 'next/server';
import { generateWeeklyDilemmaDraft } from '@/app/actions/weekly-dilemmas';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const enabled = process.env.GENERATE_WEEKLY_FACTUAL_DILEMMA !== 'false';
  if (!enabled) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'disabled' });
  }

  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get('authorization') || '';
    const token = header.toLowerCase().startsWith('bearer ')
      ? header.slice(7).trim()
      : request.headers.get('x-cron-secret') || '';
    if (token !== secret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const result = await generateWeeklyDilemmaDraft(new Date());
  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    dilemmaId: result.data.id,
    slug: result.data.slug,
    isoWeek: result.data.isoWeek,
    status: result.data.visibilityStatus,
  });
}
