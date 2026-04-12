
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type DocumentSnapshot,
  type Timestamp,
  type CollectionReference,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Converts a Firestore Timestamp (or Date, or string) to a JS Date.
 * Returns undefined if the input is falsy.
 */
export function timestampToDate(
  field: Timestamp | Date | string | undefined | null
): Date | undefined {
  if (!field) return undefined;
  if (field instanceof Date) return field;
  if (typeof field === 'string') return new Date(field);
  if (typeof (field as Timestamp).toDate === 'function') {
    return (field as Timestamp).toDate();
  }
  return undefined;
}

/**
 * Runs a paginated Firestore query and returns the documents plus the last
 * visible document (for cursor-based pagination).
 */
export async function paginatedQuery<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[],
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ data: (T & { id: string })[]; lastVisible: DocumentSnapshot | null }> {
  const colRef = collection(db, collectionName);
  const queryConstraints: QueryConstraint[] = [
    ...constraints,
    limit(pageSize),
  ];

  if (lastDoc) {
    queryConstraints.push(startAfter(lastDoc));
  }

  const q = query(colRef, ...queryConstraints);
  const snapshot = await getDocs(q);

  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as (T & { id: string })[];

  const lastVisible = snapshot.docs.length > 0
    ? snapshot.docs[snapshot.docs.length - 1]
    : null;

  return { data, lastVisible };
}

/**
 * Creates a document in the given collection, automatically adding
 * `createdAt` and `updatedAt` server timestamps.
 */
export async function createDocWithTimestamps(
  collectionName: string,
  data: Record<string, any>
): Promise<string> {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Serializes Firestore document data for JSON transport (e.g., in API routes).
 * Converts all Timestamp fields to ISO strings.
 */
export function serializeDoc(data: DocumentData): Record<string, any> {
  const serialized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof (value as Timestamp).toDate === 'function') {
      serialized[key] = (value as Timestamp).toDate().toISOString();
    } else if (value instanceof Date) {
      serialized[key] = value.toISOString();
    } else {
      serialized[key] = value;
    }
  }
  return serialized;
}
