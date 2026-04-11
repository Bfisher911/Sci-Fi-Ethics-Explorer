import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { SubmittedDilemma } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, theme, authorName, authorId, imageUrl, imageHint } = body;

    if (!title || !description || !theme) {
      return NextResponse.json({ message: 'Title, description, and theme are required.' }, { status: 400 });
    }

    const newDilemma: Omit<SubmittedDilemma, 'id' | 'submittedAt'> & { submittedAt: any } = {
      title,
      description,
      theme,
      authorName: authorName || 'Anonymous',
      status: 'pending', // Default status
      submittedAt: serverTimestamp(), // Firestore server timestamp
    };

    if (authorId) newDilemma.authorId = authorId;
    if (imageUrl) newDilemma.imageUrl = imageUrl;
    if (imageHint) newDilemma.imageHint = imageHint;


    const docRef = await addDoc(collection(db, 'submittedDilemmas'), newDilemma);

    return NextResponse.json({ message: 'Dilemma submitted successfully', id: docRef.id }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting dilemma:', error);
    return NextResponse.json({ message: 'Error submitting dilemma', error: error.message }, { status: 500 });
  }
}
