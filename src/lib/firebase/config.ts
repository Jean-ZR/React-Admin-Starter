
'use client'; // Ensure this runs client-side where process.env is available after build

import { initializeApp, getApps, FirebaseApp } from "firebase/app";

// Your web app's Firebase configuration
// IMPORTANT: Use environment variables for sensitive data
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase
let firebase_app: FirebaseApp | null = null; // Initialize as null

// Check if all required config values are present
const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
];

// Log the values of environment variables being read
console.log("--- Firebase Configuration Check (src/lib/firebase/config.ts) ---");
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.trim() === '' || value.startsWith('YOUR_')) {
    console.warn(`[CONFIG CHECK] Environment variable ${varName} is MISSING, empty, or using a placeholder. Value: '${value}'`);
  } else {
    // To avoid logging sensitive keys directly in production, but useful for local debugging.
    if (process.env.NODE_ENV === 'development') {
        console.log(`[CONFIG CHECK] Found ${varName}. Value starts with: '${value.substring(0, 5)}...' (partially shown for debugging)`);
    } else {
        console.log(`[CONFIG CHECK] Found ${varName}: Loaded (value hidden in non-development environment)`);
    }
  }
});
console.log("-----------------------------------------------------------------");


const missingVars = requiredEnvVars.filter(v => {
    const value = process.env[v];
    // Ensure empty strings or placeholder values are considered missing for the check
    return !value || value.trim() === '' || value.startsWith('YOUR_');
});


if (missingVars.length > 0) {
    console.warn(`[FIREBASE INIT] Firebase config is missing, empty, or using placeholder values for: ${missingVars.join(', ')}.`);
    console.warn("[FIREBASE INIT] PLEASE CHECK: \n1. Your '.env.local' file is in the project root.\n2. All Firebase variables start with NEXT_PUBLIC_ and have correct values.\n3. You have FULLY RESTARTED your Next.js development server after changes to '.env.local'.");

    if (!getApps().length) {
       console.error("[FIREBASE INIT] Firebase initialization SKIPPED due to missing/invalid configuration.");
       firebase_app = null;
    } else {
        firebase_app = getApps()[0]; // Should not happen if config is bad from the start
        console.warn("[FIREBASE INIT] An existing Firebase app was found, but current configuration is missing/invalid. This may lead to issues.");
    }

} else {
    console.log("[FIREBASE INIT] Firebase configuration appears valid. Attempting to initialize Firebase...");
    if (!getApps().length) {
      try {
        firebase_app = initializeApp(firebaseConfig); // firebaseConfig uses process.env
        console.log("[FIREBASE INIT] Firebase initialized successfully.");
      } catch (e: any) {
        console.error("[FIREBASE INIT] Error initializing Firebase even with seemingly valid config:", e.message);
        firebase_app = null;
      }
    } else {
      firebase_app = getApps()[0];
      console.log("[FIREBASE INIT] Firebase app already initialized. Using existing instance.");
    }
}

export default firebase_app;
