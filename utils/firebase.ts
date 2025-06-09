/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-RPX08GV1L9"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Auth インスタンス
export const auth = getAuth(app);

// Firestore インスタンス  
export const db = getFirestore(app);

// Analytics インスタンス（ブラウザ環境でのみ）
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

console.log('Firebase initialized successfully:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasAuth: !!auth,
  hasFirestore: !!db,
  hasAnalytics: !!analytics,
  timestamp: new Date().toISOString()
});

// 認証の永続性を設定
auth.setPersistence('local').then(() => {
  console.log('Firebase Auth: Persistence set to LOCAL');
}).catch((error) => {
  console.error('Firebase Auth: Failed to set persistence:', error);
});

// Firestoreのオフライン永続化を有効化
enableIndexedDbPersistence(db).then(() => {
  console.log('Firestore: Offline persistence enabled');
}).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore: Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore: The current browser does not support offline persistence');
  } else {
    console.error('Firestore: Error enabling offline persistence:', err);
  }
});