import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import type { SubmittedDilemma } from '@/types';
import { notifyOnDilemmaSubmitted } from '@/lib/notifications-dispatch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      theme,
      authorName,
      authorId,
      authorEmail,
      imageUrl,
      imageHint,
      communityId,
      globalVisibility,
    } = body;

    if (!title || !description || !theme) {
      return NextResponse.json(
        { message: 'Title, description, and theme are required.' },
        { status: 400 }
      );
    }

    // Resolve community name if scoped
    let communityName: string | undefined;
    if (communityId) {
      try {
        const commSnap = await getDoc(doc(db, 'communities', communityId));
        if (commSnap.exists()) communityName = commSnap.data().name;
      } catch {
        // non-fatal
      }
    }

    // Default to 'public' for backward compatibility (implicit behavior)
    const visibility: 'public' | 'private' =
      globalVisibility === 'private' ? 'private' : 'public';

    const newDilemma: Record<string, any> = {
      title,
      description,
      theme,
      authorName: authorName || 'Anonymous',
      status: 'pending',
      globalVisibility: visibility,
      submittedAt: serverTimestamp(),
    };

    if (authorId) newDilemma.authorId = authorId;
    if (authorEmail) newDilemma.authorEmail = authorEmail;
    if (imageUrl) newDilemma.imageUrl = imageUrl;
    if (imageHint) newDilemma.imageHint = imageHint;
    if (communityId) newDilemma.communityId = communityId;
    if (communityName) newDilemma.communityName = communityName;

    const docRef = await addDoc(collection(db, 'submittedDilemmas'), newDilemma);

    // Fire-and-forget notifications (don't block the response)
    notifyOnDilemmaSubmitted({
      dilemmaId: docRef.id,
      dilemmaTitle: title,
      authorName: newDilemma.authorName,
      communityId,
      communityName,
    }).catch((err) => console.error('[submit-dilemma] notify failed:', err));

    return NextResponse.json(
      { message: 'Dilemma submitted successfully', id: docRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting dilemma:', error);
    return NextResponse.json(
      { message: 'Error submitting dilemma', error: error.message },
      { status: 500 }
    );
  }
}
