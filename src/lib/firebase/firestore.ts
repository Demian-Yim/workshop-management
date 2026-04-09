import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  QueryConstraint,
  serverTimestamp,
  DocumentData,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './config';

export async function getDocument<T>(path: string): Promise<T | null> {
  const docRef = doc(db, path);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export async function setDocument(path: string, data: DocumentData) {
  const docRef = doc(db, path);
  return setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function addDocument(collectionPath: string, data: DocumentData) {
  const colRef = collection(db, collectionPath);
  return addDoc(colRef, { ...data, createdAt: serverTimestamp() });
}

export async function updateDocument(path: string, data: DocumentData) {
  const docRef = doc(db, path);
  return updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDocument(path: string) {
  const docRef = doc(db, path);
  return deleteDoc(docRef);
}

export async function queryDocuments<T>(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const colRef = collection(db, collectionPath);
  const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

/**
 * Recursively delete all documents in a subcollection and its nested subcollections.
 * Uses writeBatch with 500-document limit per batch.
 */
export async function deleteSubcollections(
  parentPath: string,
  subcollectionNames: string[],
): Promise<void> {
  const { writeBatch } = await import('firebase/firestore');

  for (const subName of subcollectionNames) {
    const colRef = collection(db, `${parentPath}/${subName}`);
    const snap = await getDocs(colRef);

    // Process in batches of 500
    let batch = writeBatch(db);
    let count = 0;

    for (const docSnap of snap.docs) {
      batch.delete(docSnap.ref);
      count += 1;

      if (count >= 500) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
  }
}

export { increment, arrayUnion, arrayRemove, serverTimestamp, doc, collection, updateDoc };
