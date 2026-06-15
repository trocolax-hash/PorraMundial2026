import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

// Check if we have a real Firebase configuration or a placeholder
export const isFirebaseActive = 
  firebaseConfig && 
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes('placeholder') &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes('placeholder');

let dbInstance: any = null;
let authInstance: any = null;

if (isFirebaseActive) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId.trim() !== "" && !firebaseConfig.firestoreDatabaseId.includes('placeholder')
      ? firebaseConfig.firestoreDatabaseId
      : undefined;
    dbInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
    authInstance = getAuth(app);
  } catch (error) {
    console.error("Failed to initialize Firebase SDK:", error);
    dbInstance = null;
    authInstance = null;
  }
}

export const db = dbInstance;
export const auth = authInstance;

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
