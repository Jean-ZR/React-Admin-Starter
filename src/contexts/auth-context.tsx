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
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebase_app from '@/lib/firebase/config'; // Adjust path as needed

// Initialize Firebase services
const auth = getAuth(firebase_app);
const db = getFirestore(firebase_app);

interface AuthContextType {
  user: FirebaseUser | null;
  role: string | null; // Add role state
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch role if user is logged in
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setRole(userDocSnap.data().role); // Get role from Firestore
        } else {
          console.warn("User document not found in Firestore, role couldn't be set.");
          setRole(null); // Reset role if document doesn't exist
        }
      } else {
        setRole(null); // Reset role on logout
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Run only once on mount

  const login = async (email: string, pass: string): Promise<void> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // Role will be fetched by onAuthStateChanged listener
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false); // Ensure loading stops on error
      throw error; // Re-throw error to be caught by caller
    }
     // setLoading(false) happens implicitly via onAuthStateChanged
  };

  const signup = async (email: string, pass: string, userRole: string): Promise<void> => {
     setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      // Store user role in Firestore
      if (newUser) {
        const userDocRef = doc(db, 'users', newUser.uid);
        await setDoc(userDocRef, { email: newUser.email, role: userRole });
        setRole(userRole); // Set role immediately for the new user
        setUser(newUser); // Set user immediately
      } else {
         throw new Error("User creation failed.");
      }

    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false);
      throw error; // Re-throw error
    }
     // setLoading(false) happens implicitly via onAuthStateChanged after signup potentially logs in
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth);
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
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
       setLoading(false);
      throw error; // Re-throw error
    } finally {
        setLoading(false); // Ensure loading is set to false
    }
  };

  const value = {
    user,
    role,
    loading,
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
