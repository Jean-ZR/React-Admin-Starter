
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUser,
  type Auth,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import {
  firebaseApp,
  auth as configuredAuth, 
  db as configuredDb,     
} from '@/lib/firebase/config';

const firebaseConfigured = !!firebaseApp && !!configuredAuth && !!configuredDb;

interface AuthContextType {
  user: FirebaseUser | null;
  role: string | null;
  displayName: string | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserDisplayName: (newName: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured); 

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(configuredAuth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(currentUser.displayName); // Get displayName from Auth user object
        try {
          const userDocRef = doc(configuredDb, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setRole(snap.data().role);
            // If displayName is in Firestore and more up-to-date, use that
            if (snap.data().displayName) {
              setDisplayName(snap.data().displayName);
            }
          } else {
            setRole(null);
          }
        } catch (e) {
          console.error('Error al obtener role y displayName de Firestore:', e);
          setRole(null);
        }
      } else {
        setRole(null);
        setDisplayName(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkConfig = (): boolean => {
    if (!firebaseConfigured) {
      console.error('Firebase no está configurado.');
      return false;
    }
    return true;
  };

  const login = async (email: string, pass: string) => {
    if (!checkConfig()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(configuredAuth, email, pass);
    } catch (e) {
      console.error('Login error:', e);
      setLoading(false); 
      throw e;
    }
  };

  const signup = async (email: string, pass: string, userRole: string) => {
    if (!checkConfig()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(configuredAuth, email, pass);
      const newUser = cred.user;
      // It's good practice to set a default displayName on signup if available
      const initialDisplayName = email.split('@')[0]; // Example: use email prefix as initial display name
      await updateProfile(newUser, { displayName: initialDisplayName });
      
      await setDoc(doc(configuredDb, 'users', newUser.uid), {
        email: newUser.email,
        role: userRole,
        displayName: initialDisplayName, // Store displayName in Firestore as well
        createdAt: new Date(),
      });
      setUser(newUser); // Manually update user state
      setRole(userRole);
      setDisplayName(initialDisplayName);
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
    } catch (e) {
      console.error('Logout error:', e);
      setUser(null);
      setRole(null);
      setDisplayName(null);
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

  const updateUserDisplayName = async (newName: string) => {
    if (!checkConfig() || !user) {
      throw new Error("User not authenticated or Firebase not configured.");
    }
    await updateProfile(user, { displayName: newName });
    const userDocRef = doc(configuredDb, 'users', user.uid);
    await updateDoc(userDocRef, { displayName: newName });
    setDisplayName(newName); // Update local state
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!checkConfig() || !user || !user.email) {
        throw new Error("User not authenticated, email missing, or Firebase not configured.");
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword);
  };


  return (
    <AuthContext.Provider
      value={{ 
        user, 
        role, 
        displayName,
        loading, 
        isFirebaseConfigured: firebaseConfigured, 
        login, 
        signup, 
        logout, 
        resetPassword,
        updateUserDisplayName,
        updateUserPassword
      }}
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
