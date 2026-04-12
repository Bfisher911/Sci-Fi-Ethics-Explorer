import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import type { SubmittedDilemma } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'approved';

    const dilemmasRef = collection(db, 'submittedDilemmas');
    // Query for dilemmas by status, ordered by submission date (newest first), limit to 50
    const q = query(
        dilemmasRef,
        where('status', '==', status),
        orderBy('submittedAt', 'desc'),
        limit(50)
    );

    const querySnapshot = await getDocs(q);
    const dilemmas: SubmittedDilemma[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      dilemmas.push({
        id: doc.id,
        ...data,
        // Ensure submittedAt is a serializable format if it's a Firestore Timestamp
        submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate() : new Date(data.submittedAt),
      } as SubmittedDilemma);
    });

    return NextResponse.json(dilemmas, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching dilemmas:', error);
    return NextResponse.json({ message: 'Error fetching dilemmas', error: error.message }, { status: 500 });
  }
}
