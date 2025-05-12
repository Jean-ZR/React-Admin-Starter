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

// Safely check process.env only on the client side or during build time on server
const isBrowser = typeof window !== 'undefined';
let missingVars: string[] = [];

// Only perform the check if required vars might be available (browser or specific server context)
// Avoid checking process.env directly at the module scope in RSCs if possible.
// However, for client-side init, this check is necessary.
if (isBrowser || process.env.NODE_ENV === 'development' || process.env.IS_BUILD_PROCESS) { // IS_BUILD_PROCESS is hypothetical, adjust as needed
    missingVars = requiredEnvVars.filter(v => {
        const value = process.env[v];
        return !value || value.startsWith('YOUR_'); // Also check for placeholder values like YOUR_API_KEY
    });
} else {
    // In environments where client env vars aren't guaranteed (like edge functions without polyfills),
    // you might skip the check or handle it differently.
    // For this setup, assume standard Next.js behavior where these are available.
    missingVars = requiredEnvVars.filter(v => !process.env[v] || process.env[v]?.startsWith('YOUR_'));
}


if (missingVars.length > 0) {
    console.warn(`Firebase config missing or using placeholder environment variables: ${missingVars.join(', ')}. Please create/update the .env.local file with your actual Firebase project credentials.`);
    // Avoid initializing Firebase if critical config is missing
    if (!getApps().length) {
       console.error("Firebase initialization skipped due to missing configuration."); // This error is expected if config is missing
       firebase_app = null; // Explicitly set to null
    } else {
        firebase_app = getApps()[0]; // Use existing app if somehow initialized elsewhere, though unlikely with missing config
    }

} else {
    // Config seems valid, proceed with initialization
    if (!getApps().length) {
      try {
        firebase_app = initializeApp(firebaseConfig);
      } catch (e) {
        console.error("Error initializing Firebase:", e);
        firebase_app = null; // Ensure it's null on error
      }
    } else {
      firebase_app = getApps()[0];
    }
}


// Export the potentially null app
export default firebase_app;
