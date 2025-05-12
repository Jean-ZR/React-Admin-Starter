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
let firebase_app: FirebaseApp;

// Check if all required config values are present
const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
];
const missingVars = requiredEnvVars.filter(v => !process.env[v] || process.env[v] === 'YOUR_' + v.substring('NEXT_PUBLIC_FIREBASE_'.length)); // Also check for placeholder values


if (missingVars.length > 0) {
    console.warn(`Firebase config missing or using placeholder environment variables: ${missingVars.join(', ')}. Please create/update the .env.local file with your actual Firebase project credentials.`);
    // Avoid initializing Firebase if critical config is missing
    // You might want to handle this case differently, e.g., show an error page
    if (!getApps().length) {
       // Prevent initialization if config is invalid
       console.error("Firebase initialization skipped due to missing configuration.");
    }
     firebase_app = getApps().length > 0 ? getApps()[0] : null as any; // Assign existing app or null

} else if (!getApps().length) {
  firebase_app = initializeApp(firebaseConfig);
} else {
  firebase_app = getApps()[0];
}


export default firebase_app;
