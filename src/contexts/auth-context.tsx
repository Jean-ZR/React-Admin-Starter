'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  Auth, // Import Auth type
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Firestore } from 'firebase/firestore'; // Import Firestore type
import firebase_app from '@/lib/firebase/config'; // Adjust path as needed

// Initialize Firebase services conditionally
let auth: Auth | null = null;
let db: Firestore | null = null;
let firebaseConfigured = false;

if (firebase_app) {
  try {
    auth = getAuth(firebase_app);
    db = getFirestore(firebase_app);
    firebaseConfigured = true;
  } catch (e) {
    console.error("Error getting Auth or Firestore instance:", e);
    // firebase_app might be initialized but services failed
    firebaseConfigured = false;
  }
} else {
    // This message is already logged in config.ts, but good to know context here too
    console.warn("AuthContext: Firebase app is not configured. Authentication will not function.");
}


interface AuthContextType {
  user: FirebaseUser | null;
  role: string | null; // Add role state
  loading: boolean;
  isFirebaseConfigured: boolean; // Indicate if Firebase is set up
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  // Initialize loading based on whether Firebase is configured
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    // Only subscribe if Firebase and Auth are configured
    if (!firebaseConfigured || !auth || !db) {
        setLoading(false); // Stop loading if Firebase isn't set up
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && db) { // Ensure db is available
        // Fetch role if user is logged in
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
            setRole(userDocSnap.data().role); // Get role from Firestore
            } else {
            console.warn("User document not found in Firestore, role couldn't be set.");
            setRole(null); // Reset role if document doesn't exist
            }
        } catch (error) {
             console.error("Error fetching user role:", error);
             setRole(null);
        }
      } else {
        setRole(null); // Reset role on logout
      }
      setLoading(false); // Finished loading auth state
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Run only once on mount

  // Helper function to check configuration before proceeding
   const checkConfig = (): boolean => {
    if (!firebaseConfigured || !auth || !db) {
      console.error("Firebase is not configured. Action cannot proceed.");
      // Optionally throw an error or return a specific status
      // For now, just log and prevent the action
      return false;
    }
    return true;
  };


  const login = async (email: string, pass: string): Promise<void> => {
     if (!checkConfig()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth!, email, pass); // auth is checked by checkConfig
      // Role will be fetched by onAuthStateChanged listener
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false); // Ensure loading stops on error
      throw error; // Re-throw error to be caught by caller
    }
     // setLoading(false) happens implicitly via onAuthStateChanged
  };

  const signup = async (email: string, pass: string, userRole: string): Promise<void> => {
      if (!checkConfig()) return;
     setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth!, email, pass); // auth checked
      const newUser = userCredential.user;

      // Store user role in Firestore
      if (newUser && db) { // db checked
        const userDocRef = doc(db, 'users', newUser.uid);
        await setDoc(userDocRef, { email: newUser.email, role: userRole });
        setRole(userRole); // Set role immediately for the new user
        setUser(newUser); // Set user immediately
      } else {
         throw new Error("User creation or database operation failed.");
      }

    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false);
      throw error; // Re-throw error
    }
     // setLoading(false) happens implicitly via onAuthStateChanged after signup potentially logs in
  };

  const logout = async (): Promise<void> => {
     if (!checkConfig()) return;
    setLoading(true);
    try {
      await signOut(auth!); // auth checked
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Still proceed with setting user/role to null locally
      setUser(null);
      setRole(null);
       setLoading(false); // Stop loading on error
      throw error; // Re-throw error
    }
    // setLoading(false); // setLoading(false) happens implicitly via onAuthStateChanged
  };

  const resetPassword = async (email: string): Promise<void> => {
     if (!checkConfig()) return;
    // Don't set loading true here unless necessary, as it might block UI unnecessarily
    try {
      await sendPasswordResetEmail(auth!, email); // auth checked
    } catch (error) {
      console.error("Password reset error:", error);
      throw error; // Re-throw error
    }
    // Removed loading state management here unless there's a specific need
  };

  const value = {
    user,
    role,
    loading,
    isFirebaseConfigured: firebaseConfigured,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
