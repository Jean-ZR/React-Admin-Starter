
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
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  type Timestamp, // Import Timestamp
} from 'firebase/firestore';
import {
  firebaseApp,
  auth as configuredAuth,
  db as configuredDb,
} from '@/lib/firebase/config';

const firebaseConfigured = !!firebaseApp && !!configuredAuth && !!configuredDb;

// Define a default structure for notification preferences
const defaultNotificationPreferences = {
  globalNotificationsEnabled: true,
  types: {
    lowStock: { enabled: true, email: true, sms: false },
    newTicket: { enabled: true, email: true, sms: false },
    ticketUpdate: { enabled: true, email: false, sms: false },
    assetWarranty: { enabled: true, email: true, sms: false },
    reportReady: { enabled: false, email: false, sms: false },
  }
};

export interface NotificationPreferences {
  globalNotificationsEnabled: boolean;
  types: {
    [key: string]: { // e.g., lowStock, newTicket
      enabled: boolean;
      email: boolean;
      sms: boolean;
    };
  };
}

interface AuthContextType {
  user: FirebaseUser | null;
  role: string | null;
  displayName: string | null;
  notificationPreferences: NotificationPreferences | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, role: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserDisplayName: (newName: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserPreferences: (preferences: NotificationPreferences) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(defaultNotificationPreferences);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(configuredAuth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(currentUser.displayName);
        try {
          const userDocRef = doc(configuredDb, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const userData = snap.data();
            setRole(userData.role);
            if (userData.displayName) {
              setDisplayName(userData.displayName);
            }
            if (userData.notificationPreferences) {
              setNotificationPreferences(userData.notificationPreferences);
            } else {
              setNotificationPreferences(defaultNotificationPreferences); // Set defaults if not in DB
            }
          } else {
            setRole(null);
            setNotificationPreferences(defaultNotificationPreferences);
          }
        } catch (e) {
          console.error('Error fetching user data from Firestore:', e);
          setRole(null);
          setNotificationPreferences(defaultNotificationPreferences);
        }
      } else {
        setRole(null);
        setDisplayName(null);
        setNotificationPreferences(defaultNotificationPreferences);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkConfig = (): boolean => {
    if (!firebaseConfigured) {
      console.error('Firebase is not configured.');
      return false;
    }
    return true;
  };

  const login = async (email: string, pass: string) => {
    if (!checkConfig()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(configuredAuth, email, pass);
      // User data including preferences will be fetched by onAuthStateChanged
    } catch (e) {
      console.error('Login error:', e);
      setLoading(false);
      throw e;
    }
  };

  const signup = async (email: string, pass: string, userRole: string, userDisplayName?: string) => {
    if (!checkConfig()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(configuredAuth, email, pass);
      const newUser = cred.user;
      const finalDisplayName = userDisplayName || email.split('@')[0];
      await updateProfile(newUser, { displayName: finalDisplayName });

      await setDoc(doc(configuredDb, 'users', newUser.uid), {
        email: newUser.email,
        role: userRole,
        displayName: finalDisplayName,
        notificationPreferences: defaultNotificationPreferences, // Set default prefs on signup
        createdAt: new Date(), // Using JavaScript Date, Firestore will convert to Timestamp
      });
      setUser(newUser); // Manually update user state
      setRole(userRole);
      setDisplayName(finalDisplayName);
      setNotificationPreferences(defaultNotificationPreferences);
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
      // State will be cleared by onAuthStateChanged
    } catch (e) {
      console.error('Logout error:', e);
      // Explicitly clear state on error as onAuthStateChanged might not fire as expected
      setUser(null);
      setRole(null);
      setDisplayName(null);
      setNotificationPreferences(defaultNotificationPreferences);
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
    setDisplayName(newName);
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!checkConfig() || !user || !user.email) {
      throw new Error("User not authenticated, email missing, or Firebase not configured.");
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword);
  };

  const updateUserPreferences = async (preferences: NotificationPreferences) => {
    if (!checkConfig() || !user) {
      throw new Error("User not authenticated or Firebase not configured.");
    }
    const userDocRef = doc(configuredDb, 'users', user.uid);
    await updateDoc(userDocRef, { notificationPreferences: preferences });
    setNotificationPreferences(preferences);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        displayName,
        notificationPreferences,
        loading,
        isFirebaseConfigured: firebaseConfigured,
        login,
        signup,
        logout,
        resetPassword,
        updateUserDisplayName,
        updateUserPassword,
        updateUserPreferences,
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
