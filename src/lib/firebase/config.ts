'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from 'firebase/analytics';

// DEBUG: Verifica que Next.js lea las variables de entorno
console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

// Configuración de Firebase usando env vars
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // opcional
};

// Inicialización de la app
let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  console.log('🔥 Firebase App inicializada correctamente');
} else {
  firebaseApp = getApps()[0];
  console.log('♻️ Usando instancia existente de Firebase App');
}

// Inicializa los servicios
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

try {
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  // Analytics solo en cliente y si measurementId está presente
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
    analytics = getAnalytics(firebaseApp);
    console.log('📊 Firebase Analytics inicializado');
  }
} catch (e) {
  console.error('Error inicializando servicios de Firebase:', e);
  // Assign null to auth and db if initialization fails to prevent undefined errors elsewhere
  // @ts-ignore
  auth = null;
  // @ts-ignore
  db = null;
}

export { firebaseApp, auth, db, analytics };
