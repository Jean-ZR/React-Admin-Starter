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

let missingVars: string[] = [];

// This module is 'use client', so it primarily executes in the browser.
// NEXT_PUBLIC_ variables are exposed to the browser by Next.js.
// Also check for empty strings.
missingVars = requiredEnvVars.filter(v => {
    const value = process.env[v];
    return !value || value === '' || value.startsWith('YOUR_');
});


if (missingVars.length > 0) {
    console.warn(`Firebase config missing, empty, or using placeholder environment variables: ${missingVars.join(', ')}. Please ensure the .env.local file is correct and the development server has been restarted.`);
    // Avoid initializing Firebase if critical config is missing
    if (!getApps().length) {
       console.error("Firebase initialization skipped due to missing configuration."); // This error is expected if config is missing
       firebase_app = null; // Explicitly set to null
    } else {
        // This case is unlikely if config is truly missing, but handles if an app was initialized elsewhere.
        firebase_app = getApps()[0];
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
