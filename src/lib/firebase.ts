import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let isMockMode = true;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function hasFirebaseConfig(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here'
  );
}

export function initFirebase(): { db: Firestore | null; isMock: boolean } {
  if (hasFirebaseConfig()) {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      isMockMode = false;
      console.log('🔥 Firebase initialized');
      return { db, isMock: false };
    } catch (e) {
      console.warn('Firebase init failed, falling back to mock mode:', e);
    }
  }
  
  console.log('📦 Running in mock mode (no Firebase config)');
  isMockMode = true;
  return { db: null, isMock: true };
}

export function getIsMockMode(): boolean {
  return isMockMode;
}

export { app, db, isMockMode };
