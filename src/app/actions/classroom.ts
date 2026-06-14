'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import type { Classroom, StudentProgress, QuizResult } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';
import { getEnrollment } from '@/app/actions/curriculum';
import { getUserBestAttempts } from '@/app/actions/quizzes';

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function classroomFromDoc(id: string, data: Record<string, any>): Classroom {
  return {
    id,
    name: data.name || '',
    teacherId: data.teacherId || '',
    teacherName: data.teacherName || '',
    organizationId: data.organizationId,
    studentIds: data.studentIds || [],
    curriculumPathId: data.curriculumPathId,
    joinCode: data.joinCode || '',
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

/**
 * Generate a random 6-character alphanumeric join code.
 */
function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new classroom.
 */
export async function createClassroom(data: {
  name: string;
  teacherId: string;
  teacherName: string;
  curriculumPathId?: string;
}): Promise<ActionResult<Classroom>> {
  try {
    const joinCode = generateJoinCode();
    const classroomData = {
      name: data.name,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      studentIds: [],
      curriculumPathId: data.curriculumPathId || null,
      joinCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'classrooms'), classroomData);
    return {
      success: true,
      data: {
        id: docRef.id,
        ...data,
        studentIds: [],
        joinCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error('[classroom] createClassroom error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Join a classroom using the join code.
 */
export async function joinClassroom(
  joinCode: string,
  userId: string,
  studentName: string
): Promise<ActionResult<string>> {
  try {
    const q = query(
      collection(db, 'classrooms'),
      where('joinCode', '==', joinCode.toUpperCase())
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: false, error: 'Classroom not found. Check your join code.' };
    }

    const classroomDoc = snapshot.docs[0];
    const classroomId = classroomDoc.id;
    const data = classroomDoc.data();

    if (data.studentIds?.includes(userId)) {
      return { success: false, error: 'You are already a member of this classroom.' };
    }

    await updateDoc(doc(db, 'classrooms', classroomId), {
      studentIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });

    // Create student progress doc
    await addDoc(collection(db, 'studentProgress'), {
      classroomId,
      studentId: userId,
      studentName,
      completedItems: [],
      quizScores: {},
      lastActivity: serverTimestamp(),
    });

    return { success: true, data: classroomId };
  } catch (error) {
    console.error('[classroom] joinClassroom error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch a single classroom by ID.
 */
export async function getClassroom(
  id: string
): Promise<ActionResult<Classroom | null>> {
  try {
    const snap = await getDoc(doc(db, 'classrooms', id));
    if (!snap.exists()) {
      return { success: true, data: null };
    }
    return { success: true, data: classroomFromDoc(snap.id, snap.data()) };
  } catch (error) {
    console.error('[classroom] getClassroom error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch all classrooms for a teacher.
 */
export async function getTeacherClassrooms(
  teacherId: string
): Promise<ActionResult<Classroom[]>> {
  try {
    const q = query(
      collection(db, 'classrooms'),
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const classrooms = snapshot.docs.map((d) =>
      classroomFromDoc(d.id, d.data())
    );
    return { success: true, data: classrooms };
  } catch (error) {
    console.error('[classroom] getTeacherClassrooms error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch all classrooms a student belongs to.
 */
export async function getStudentClassrooms(
  studentId: string
): Promise<ActionResult<Classroom[]>> {
  try {
    const q = query(
      collection(db, 'classrooms'),
      where('studentIds', 'array-contains', studentId)
    );
    const snapshot = await getDocs(q);
    const classrooms = snapshot.docs.map((d) =>
      classroomFromDoc(d.id, d.data())
    );
    return { success: true, data: classrooms };
  } catch (error) {
    console.error('[classroom] getStudentClassrooms error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Assign a curriculum to a classroom.
 */
export async function assignCurriculum(
  classroomId: string,
  curriculumPathId: string,
  teacherId: string
): Promise<ActionResult<undefined>> {
  try {
    const snap = await getDoc(doc(db, 'classrooms', classroomId));
    if (!snap.exists()) {
      return { success: false, error: 'Classroom not found' };
    }
    if (snap.data().teacherId !== teacherId) {
      return { success: false, error: 'Only the teacher can assign curricula' };
    }
    await updateDoc(doc(db, 'classrooms', classroomId), {
      curriculumPathId,
      updatedAt: serverTimestamp(),
    });
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[classroom] assignCurriculum error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch all student progress for a classroom.
 *
 * The `studentProgress` doc written at join time only ever carries the
 * student's name — its `completedItems`/`quizScores`/`lastActivity` fields
 * are never updated, so reading them back produced an all-zero gradebook.
 * Instead we derive each student's progress from the canonical sources:
 *   - completedItems ← the student's curriculum enrollment (completedItemIds)
 *   - quizScores     ← the student's best quiz attempt per subject
 *   - lastActivity   ← the most recent of enrollment / quiz / join activity
 * The roster comes from the classroom doc (authoritative); names come from
 * the join-time studentProgress docs.
 */
export async function getClassroomStudentProgress(
  classroomId: string
): Promise<ActionResult<StudentProgress[]>> {
  try {
    const classSnap = await getDoc(doc(db, 'classrooms', classroomId));
    if (!classSnap.exists()) {
      return { success: true, data: [] };
    }
    const classData = classSnap.data();
    const studentIds: string[] = classData.studentIds || [];
    const curriculumPathId: string | undefined =
      classData.curriculumPathId || undefined;

    // Display names (and the join timestamp as a baseline activity) come from
    // the studentProgress docs written when each student joined.
    const nameSnap = await getDocs(
      query(
        collection(db, 'studentProgress'),
        where('classroomId', '==', classroomId)
      )
    );
    const nameById = new Map<string, string>();
    const joinActivityById = new Map<string, Date | undefined>();
    for (const d of nameSnap.docs) {
      const data = d.data();
      if (!data.studentId) continue;
      if (data.studentName) nameById.set(data.studentId, data.studentName);
      joinActivityById.set(data.studentId, timestampToDate(data.lastActivity));
    }

    const progress = await Promise.all(
      studentIds.map(async (studentId): Promise<StudentProgress> => {
        let completedItems: string[] = [];
        const quizScores: Record<string, QuizResult> = {};
        const activity: Date[] = [];
        const joinActivity = joinActivityById.get(studentId);
        if (joinActivity instanceof Date) activity.push(joinActivity);

        // Curriculum completion for the classroom's assigned path.
        if (curriculumPathId) {
          try {
            const enrollRes = await getEnrollment(curriculumPathId, studentId);
            if (enrollRes.success && enrollRes.data) {
              completedItems = enrollRes.data.completedItemIds || [];
              if (enrollRes.data.lastActivity instanceof Date) {
                activity.push(enrollRes.data.lastActivity);
              }
            }
          } catch (e) {
            console.error('[classroom] enrollment read failed:', studentId, e);
          }
        }

        // Quizzes taken — best attempt per subject is the "quizzes taken" count.
        try {
          const attemptsRes = await getUserBestAttempts(studentId);
          if (attemptsRes.success) {
            for (const a of attemptsRes.data) {
              quizScores[a.subjectId] = {
                id: a.id,
                completedAt: a.completedAt,
                scores: { [a.subjectId]: a.scorePercent },
                dominantFramework: '',
              };
              if (a.completedAt instanceof Date) activity.push(a.completedAt);
            }
          }
        } catch (e) {
          console.error('[classroom] quiz attempts read failed:', studentId, e);
        }

        const lastActivity =
          activity.length > 0
            ? new Date(Math.max(...activity.map((d) => d.getTime())))
            : null;

        return {
          classroomId,
          studentId,
          studentName: nameById.get(studentId),
          completedItems,
          quizScores,
          lastActivity,
        };
      })
    );

    return { success: true, data: progress };
  } catch (error) {
    console.error('[classroom] getClassroomStudentProgress error:', error);
    return { success: false, error: String(error) };
  }
}
