'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User as FirebaseUser,
  type Auth,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  type Firestore,
} from 'firebase/firestore';
import {
  firebaseApp,
  auth as configuredAuth, // Renamed to avoid conflict with Auth type
  db as configuredDb,     // Renamed to avoid conflict
} from '@/lib/firebase/config';

// Indica si Firebase App y servicios están configurados
const firebaseConfigured = !!firebaseApp && !!configuredAuth && !!configuredDb;

interface AuthContextType {
  user: FirebaseUser | null;
  role: string | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured); // Start loading only if configured

  useEffect(() => {
    if (!firebaseConfigured) {
      console.warn("AuthContext: Firebase not configured, auth state will not be managed.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(configuredAuth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(configuredDb, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          setRole(snap.exists() ? snap.data().role : null);
        } catch (e) {
          console.error('Error al obtener role:', e);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []); // Empty dependency array ensures this runs once on mount

  const checkConfig = (): boolean => {
    if (!firebaseConfigured) {
      console.error('Firebase no está configurado.');
      // Potentially show a toast or user-facing error here
      return false;
    }
    return true;
  };

  const login = async (email: string, pass: string) => {
    if (!checkConfig()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(configuredAuth, email, pass);
      // Role and user update will be handled by onAuthStateChanged
    } catch (e) {
      console.error('Login error:', e);
      setLoading(false); // Ensure loading stops on error
      throw e;
    }
  };

  const signup = async (email: string, pass: string, userRole: string) => {
    if (!checkConfig()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(configuredAuth, email, pass);
      const newUser = cred.user;
      await setDoc(doc(configuredDb, 'users', newUser.uid), {
        email: newUser.email,
        role: userRole,
      });
      // setUser(newUser); // Not strictly necessary, onAuthStateChanged will pick it up
      // setRole(userRole);  // Same as above
      // setLoading(false) will be handled by onAuthStateChanged
    } catch (e) {
      console.error('Signup error:', e);
      setLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    if (!checkConfig()) return;
    setLoading(true);
    try {
      await signOut(configuredAuth);
      // setUser(null) and setRole(null) will be handled by onAuthStateChanged
    } catch (e) {
      console.error('Logout error:', e);
      // Even if signout fails, attempt to clear local state
      setUser(null);
      setRole(null);
      setLoading(false);
      throw e;
    }
  };

  const resetPassword = async (email: string) => {
    if (!checkConfig()) return;
    try {
      await sendPasswordResetEmail(configuredAuth, email);
    } catch (e) {
      console.error('Reset password error:', e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, isFirebaseConfigured: firebaseConfigured, login, signup, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
