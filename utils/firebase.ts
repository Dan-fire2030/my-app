/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
  hasAuth: !!auth,
  hasFirestore: !!db,
  hasAnalytics: !!analytics
});