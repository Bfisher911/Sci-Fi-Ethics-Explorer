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
import type { Classroom, StudentProgress } from '@/types';
import { timestampToDate } from '@/lib/firebase/firestore-helpers';

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
 */
export async function getClassroomStudentProgress(
  classroomId: string
): Promise<ActionResult<StudentProgress[]>> {
  try {
    const q = query(
      collection(db, 'studentProgress'),
      where('classroomId', '==', classroomId)
    );
    const snapshot = await getDocs(q);
    const progress: StudentProgress[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        classroomId: data.classroomId,
        studentId: data.studentId,
        studentName: data.studentName,
        completedItems: data.completedItems || [],
        quizScores: data.quizScores || {},
        lastActivity: timestampToDate(data.lastActivity),
      };
    });
    return { success: true, data: progress };
  } catch (error) {
    console.error('[classroom] getClassroomStudentProgress error:', error);
    return { success: false, error: String(error) };
  }
}
