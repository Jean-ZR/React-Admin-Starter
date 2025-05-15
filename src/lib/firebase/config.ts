
'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from 'firebase/analytics';

// Helper to check for placeholder values more broadly
const isPlaceholder = (value: string | undefined, keyName: string): boolean => {
  if (!value || value.trim() === "") {
    console.warn(`[CONFIG CHECK] Firebase env var ${keyName} is MISSING or empty.`);
    return true;
  }
  if (value.includes("YOUR_") || value.includes("XXXX")) { // Common placeholder patterns
    console.warn(`[CONFIG CHECK] Firebase env var ${keyName} appears to be a PLACEHOLDER. Value: ${value.substring(0, 15)}...`);
    return true;
  }
  console.log(`[CONFIG CHECK] Found ${keyName}. Value starts with: ${value.substring(0,5)}... (partially shown)`);
  return false;
};

console.log('--- Firebase Configuration Check (src/lib/firebase/config.ts) ---');
const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

const missingOrPlaceholderKeys: string[] = [];
if (isPlaceholder(firebaseConfigValues.apiKey, "NEXT_PUBLIC_FIREBASE_API_KEY")) missingOrPlaceholderKeys.push("API Key");
if (isPlaceholder(firebaseConfigValues.authDomain, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")) missingOrPlaceholderKeys.push("Auth Domain");
if (isPlaceholder(firebaseConfigValues.projectId, "NEXT_PUBLIC_FIREBASE_PROJECT_ID")) missingOrPlaceholderKeys.push("Project ID");
// Add more checks for other essential keys if needed (storageBucket, messagingSenderId, appId are often essential too)

let internalInvalidConfig = false;
if (missingOrPlaceholderKeys.length > 0) {
  internalInvalidConfig = true;
  console.error(`[FIREBASE INIT] Firebase config is missing, empty, or using placeholder values for: ${missingOrPlaceholderKeys.join(', ')}.`);
  console.error("[FIREBASE INIT] PLEASE CHECK:");
  console.error("1. Your '.env.local' file is in the project root.");
  console.error("2. All Firebase variables start with NEXT_PUBLIC_ and have correct, non-placeholder values.");
  console.error("3. You have FULLY RESTARTED your Next.js development server after changes to '.env.local'.");
}
console.log('-----------------------------------------------------------------');


let firebase_app_instance: FirebaseApp | null = null;
let auth_instance: Auth | null = null;
let db_instance: Firestore | null = null;
let analytics_instance: Analytics | null = null;

if (!internalInvalidConfig) {
  if (!getApps().length) {
    try {
      firebase_app_instance = initializeApp(firebaseConfigValues as any); // Cast if some optional keys might be undefined but caught by isPlaceholder
      console.log('[FIREBASE INIT] 🔥 Firebase App initialized successfully.');
    } catch (e) {
      console.error('[FIREBASE INIT] Error initializing Firebase App:', e);
      internalInvalidConfig = true; // Mark as invalid if app init itself fails
    }
  } else {
    firebase_app_instance = getApps()[0];
    console.log('[FIREBASE INIT] ♻️ Using existing Firebase App instance.');
  }

  if (firebase_app_instance && !internalInvalidConfig) {
    try {
      auth_instance = getAuth(firebase_app_instance);
      db_instance = getFirestore(firebase_app_instance);
      if (typeof window !== 'undefined' && firebaseConfigValues.measurementId && !isPlaceholder(firebaseConfigValues.measurementId, "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID")) {
        analytics_instance = getAnalytics(firebase_app_instance);
        console.log('[FIREBASE INIT] 📊 Firebase Analytics initialized.');
      }
    } catch (e) {
      console.error('[FIREBASE INIT] Error initializing Firebase services (Auth, Firestore, Analytics):', e);
      auth_instance = null; // Ensure they are null on error
      db_instance = null;
      analytics_instance = null;
      internalInvalidConfig = true; // Mark as invalid if services fail to init
    }
  } else if (!internalInvalidConfig) {
    // This case implies firebase_app_instance is null but internalInvalidConfig was false.
    console.error("[FIREBASE INIT] firebase_app_instance is unexpectedly null after config check passed. Marking config as invalid.");
    internalInvalidConfig = true;
  }
}

if (internalInvalidConfig && !firebase_app_instance) {
   // This log is for when the initial checks (missingOrPlaceholderKeys) failed.
   console.error("[FIREBASE INIT] Firebase initialization SKIPPED due to missing/invalid configuration identified by initial checks.");
}


// Export potentially null services. The names `auth`, `db` are used by auth-context.
export const firebaseApp = firebase_app_instance;
export const auth = auth_instance;
export const db = db_instance;
export const analytics = analytics_instance;
// Export a flag that other parts of the app can use to check config status
export const isFirebaseConfigurationValid = !internalInvalidConfig;
