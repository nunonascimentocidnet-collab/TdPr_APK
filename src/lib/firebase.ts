import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

const config = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || (firebaseConfig as any)?.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfig as any)?.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || (firebaseConfig as any)?.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfig as any)?.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfig as any)?.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || (firebaseConfig as any)?.appId,
};

const dbId = metaEnv.VITE_FIREBASE_DATABASE_ID || (firebaseConfig as any)?.firestoreDatabaseId;

const app = initializeApp(config);
export const db = getFirestore(app, dbId);
export const auth = getAuth(app);

