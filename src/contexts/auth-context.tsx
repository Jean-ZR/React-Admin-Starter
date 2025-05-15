
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
  type Timestamp, 
} from 'firebase/firestore';
import {
  firebaseApp as app, // renamed to avoid conflict if needed, though direct use is less common now
  auth as configuredAuth, // This can be null if config is invalid
  db as configuredDb,     // This can be null if config is invalid
  isFirebaseConfigurationValid, // Use the new exported flag
} from '@/lib/firebase/config';

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
    [key: string]: { 
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
  languagePreference: string | null;
  loading: boolean;
  isFirebaseConfigured: boolean; // This will now reflect isFirebaseConfigurationValid
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, role: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserDisplayName: (newName: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserPreferences: (preferences: NotificationPreferences) => Promise<void>;
  updateUserLanguagePreference: (language: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(defaultNotificationPreferences);
  const [languagePreference, setLanguagePreference] = useState<string | null>('en');
  const [loading, setLoading] = useState(true); // Start true, set to false after initial check

  useEffect(() => {
    if (!isFirebaseConfigurationValid || !configuredAuth) {
      // If Firebase config is invalid OR configuredAuth is null, don't attempt to use Firebase Auth.
      console.warn("[AUTH_CONTEXT] Firebase is not configured or auth service is unavailable. Auth features disabled.");
      setLoading(false);
      setUser(null);
      setRole(null);
      setDisplayName(null);
      // Reset preferences to default if Firebase isn't usable
      setNotificationPreferences(defaultNotificationPreferences);
      setLanguagePreference('en');
      return;
    }

    const unsubscribe = onAuthStateChanged(configuredAuth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(currentUser.displayName);
        if (configuredDb) { // Check if db is available
            try {
                const userDocRef = doc(configuredDb, 'users', currentUser.uid);
                const snap = await getDoc(userDocRef);
                if (snap.exists()) {
                    const userData = snap.data();
                    setRole(userData.role);
                    if (userData.displayName) {
                    setDisplayName(userData.displayName);
                    }
                    setNotificationPreferences(userData.notificationPreferences || defaultNotificationPreferences);
                    setLanguagePreference(userData.languagePreference || 'en');
                } else {
                    console.warn(`[AUTH_CONTEXT] User document not found for UID: ${currentUser.uid}. Using default role and preferences.`);
                    setRole(null); // Or a default role if applicable
                    setNotificationPreferences(defaultNotificationPreferences);
                    setLanguagePreference('en');
                }
            } catch (e) {
                console.error('[AUTH_CONTEXT] Error fetching user data from Firestore:', e);
                setRole(null);
                setNotificationPreferences(defaultNotificationPreferences);
                setLanguagePreference('en');
            }
        } else {
            console.warn("[AUTH_CONTEXT] Firestore (db) is not configured. Cannot fetch user role/preferences.");
            setRole(null); // Or a default role
            setNotificationPreferences(defaultNotificationPreferences);
            setLanguagePreference('en');
        }
      } else {
        setRole(null);
        setDisplayName(null);
        setNotificationPreferences(defaultNotificationPreferences);
        setLanguagePreference('en');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []); // Empty dependency array: runs once on mount

  const ensureServicesAvailable = (): boolean => {
    if (!isFirebaseConfigurationValid || !configuredAuth || !configuredDb) {
      console.error('[AUTH_CONTEXT] Firebase services are not available. Operation cancelled.');
      // Optionally throw an error or show a global toast
      // For now, just returning false and logging.
      return false;
    }
    return true;
  };

  const login = async (email: string, pass: string) => {
    if (!ensureServicesAvailable() || !configuredAuth) return; // Check added for configuredAuth
    setLoading(true);
    try {
      await signInWithEmailAndPassword(configuredAuth, email, pass);
      // User data including preferences will be fetched by onAuthStateChanged
    } catch (e) {
      console.error('[AUTH_CONTEXT] Login error:', e);
      setLoading(false); // Make sure loading is set to false on error
      throw e; // Re-throw for the calling page to handle UI updates (toast, error message)
    }
    // setLoading(false) is handled by onAuthStateChanged or error catch
  };

  const signup = async (email: string, pass: string, userRole: string, userDisplayNameInput?: string) => {
    if (!ensureServicesAvailable() || !configuredAuth || !configuredDb) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(configuredAuth, email, pass);
      const newUser = cred.user;
      const finalDisplayName = userDisplayNameInput || email.split('@')[0] || 'New User';
      
      await updateProfile(newUser, { displayName: finalDisplayName });

      await setDoc(doc(configuredDb, 'users', newUser.uid), {
        email: newUser.email,
        role: userRole,
        displayName: finalDisplayName,
        notificationPreferences: defaultNotificationPreferences,
        languagePreference: 'en',
        createdAt: new Date(),
      });
      // Manually set user state here for immediate UI update, though onAuthStateChanged will also fire
      setUser(newUser); 
      setRole(userRole);
      setDisplayName(finalDisplayName);
      setNotificationPreferences(defaultNotificationPreferences);
      setLanguagePreference('en');
    } catch (e) {
      console.error('[AUTH_CONTEXT] Signup error:', e);
      setLoading(false);
      throw e;
    }
    // setLoading(false) handled by onAuthStateChanged or error
  };

  const logout = async () => {
    if (!isFirebaseConfigurationValid || !configuredAuth) { // No need to check db for logout
      // If Firebase isn't configured, clear local state and exit.
      setUser(null);
      setRole(null);
      setDisplayName(null);
      setNotificationPreferences(defaultNotificationPreferences);
      setLanguagePreference('en');
      setLoading(false); // Ensure loading is false
      console.warn("[AUTH_CONTEXT] Firebase not configured, performing local logout.");
      return;
    }
    setLoading(true); // Set loading true before async operation
    try {
      await signOut(configuredAuth);
      // State updates (user, role, etc. to null) are handled by onAuthStateChanged
    } catch (e) {
      console.error('[AUTH_CONTEXT] Logout error:', e);
      // Explicitly clear state in case onAuthStateChanged doesn't fire or has issues
      setUser(null);
      setRole(null);
      setDisplayName(null);
      setNotificationPreferences(defaultNotificationPreferences);
      setLanguagePreference('en');
      setLoading(false); // Ensure loading is reset on error
      throw e;
    }
    // setLoading(false) handled by onAuthStateChanged
  };

  const resetPassword = async (email: string) => {
    if (!ensureServicesAvailable() || !configuredAuth) return;
    try {
      await sendPasswordResetEmail(configuredAuth, email);
    } catch (e) {
      console.error('[AUTH_CONTEXT] Reset password error:', e);
      throw e;
    }
  };

  const updateUserDisplayName = async (newName: string) => {
    if (!ensureServicesAvailable() || !user || !configuredAuth || !configuredDb) { // Added configuredAuth and configuredDb checks
      throw new Error("User not authenticated, Firebase not configured, or DB service unavailable.");
    }
    await updateProfile(user, { displayName: newName });
    const userDocRef = doc(configuredDb, 'users', user.uid);
    await updateDoc(userDocRef, { displayName: newName });
    setDisplayName(newName); // Update local context state
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!ensureServicesAvailable() || !user || !user.email || !configuredAuth) { // Added configuredAuth check
      throw new Error("User not authenticated, email missing, Firebase not configured, or Auth service unavailable.");
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword);
  };

  const updateUserPreferences = async (preferences: NotificationPreferences) => {
    if (!ensureServicesAvailable() || !user || !configuredDb) { // Added configuredDb check
      throw new Error("User not authenticated, Firebase not configured, or DB service unavailable.");
    }
    const userDocRef = doc(configuredDb, 'users', user.uid);
    await updateDoc(userDocRef, { notificationPreferences: preferences });
    setNotificationPreferences(preferences); // Update local context state
  };

  const updateUserLanguagePreference = async (language: string) => {
    if (!ensureServicesAvailable() || !user || !configuredDb) { // Added configuredDb check
      throw new Error("User not authenticated, Firebase not configured, or DB service unavailable.");
    }
    const userDocRef = doc(configuredDb, 'users', user.uid);
    await updateDoc(userDocRef, { languagePreference: language });
    setLanguagePreference(language); // Update local context state
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        displayName,
        notificationPreferences,
        languagePreference,
        loading,
        isFirebaseConfigured: isFirebaseConfigurationValid, // Use the flag from config.ts
        login,
        signup,
        logout,
        resetPassword,
        updateUserDisplayName,
        updateUserPassword,
        updateUserPreferences,
        updateUserLanguagePreference,
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
