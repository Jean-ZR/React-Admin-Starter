
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
  firebaseApp, 
  auth as configuredAuth, 
  db as configuredDb,     
  isFirebaseConfigurationValid, 
} from '@/lib/firebase/config';

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
  languagePreference: string | null; // This will be the effective language
  loading: boolean;
  isFirebaseConfigured: boolean; 
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
  const [languagePreference, setLanguagePreference] = useState<string | null>('en'); // User's specific preference
  const [systemDefaultLanguage, setSystemDefaultLanguage] = useState<string>('en'); // System-wide default
  const [loading, setLoading] = useState(true); 

  // Effect to load system default language
  useEffect(() => {
    if (isFirebaseConfigurationValid && configuredDb) {
      const fetchSystemDefaultLanguage = async () => {
        try {
          const configDocRef = doc(configuredDb, 'settings', 'generalConfiguration');
          const docSnap = await getDoc(configDocRef);
          if (docSnap.exists() && docSnap.data().defaultLanguage) {
            setSystemDefaultLanguage(docSnap.data().defaultLanguage);
          }
        } catch (e) {
          console.error('[AUTH_CONTEXT] Error fetching system default language:', e);
        }
      };
      fetchSystemDefaultLanguage();
    }
  }, []);


  useEffect(() => {
    if (!isFirebaseConfigurationValid || !configuredAuth) {
      console.warn("[AUTH_CONTEXT] Firebase is not configured or auth service is unavailable. Auth features disabled.");
      setLoading(false);
      setUser(null);
      setRole(null);
      setDisplayName(null);
      setNotificationPreferences(defaultNotificationPreferences);
      setLanguagePreference(systemDefaultLanguage); // Fallback to system default
      return;
    }

    const unsubscribe = onAuthStateChanged(configuredAuth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(currentUser.displayName);
        if (configuredDb) { 
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
                    // Set language preference: user's preference OR system default
                    setLanguagePreference(userData.languagePreference || systemDefaultLanguage);
                } else {
                    console.warn(`[AUTH_CONTEXT] User document not found for UID: ${currentUser.uid}. Using default role and preferences.`);
                    setRole(null); 
                    setNotificationPreferences(defaultNotificationPreferences);
                    setLanguagePreference(systemDefaultLanguage); // Fallback to system default
                }
            } catch (e) {
                console.error('[AUTH_CONTEXT] Error fetching user data from Firestore:', e);
                setRole(null);
                setNotificationPreferences(defaultNotificationPreferences);
                setLanguagePreference(systemDefaultLanguage); // Fallback to system default
            }
        } else {
            console.warn("[AUTH_CONTEXT] Firestore (db) is not configured. Cannot fetch user role/preferences.");
            setRole(null); 
            setNotificationPreferences(defaultNotificationPreferences);
            setLanguagePreference(systemDefaultLanguage); // Fallback to system default
        }
      } else {
        setRole(null);
        setDisplayName(null);
        setNotificationPreferences(defaultNotificationPreferences);
        setLanguagePreference(systemDefaultLanguage); // Fallback to system default for logged-out users
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [systemDefaultLanguage]); // Add systemDefaultLanguage as dependency

  const ensureServicesAvailable = (): boolean => {
    if (!isFirebaseConfigurationValid || !configuredAuth || !configuredDb) {
      console.error('[AUTH_CONTEXT] Firebase services are not available. Operation cancelled.');
      return false;
    }
    return true;
  };

  const login = async (email: string, pass: string) => {
    if (!ensureServicesAvailable() || !configuredAuth) return; 
    setLoading(true);
    try {
      await signInWithEmailAndPassword(configuredAuth, email, pass);
      // User data (including languagePreference) will be fetched by onAuthStateChanged
    } catch (e) {
      console.error('[AUTH_CONTEXT] Login error:', e);
      setLoading(false); 
      throw e; 
    }
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
        languagePreference: systemDefaultLanguage, // Set new user's preference to system default
        createdAt: new Date(), 
      });
      setUser(newUser); 
      setRole(userRole);
      setDisplayName(finalDisplayName);
      setNotificationPreferences(defaultNotificationPreferences);
      setLanguagePreference(systemDefaultLanguage);
    } catch (e) {
      console.error('[AUTH_CONTEXT] Signup error:', e);
      setLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigurationValid || !configuredAuth) { 
      setUser(null);
      setRole(null);
      setDisplayName(null);
      setNotificationPreferences(defaultNotificationPreferences);
      setLanguagePreference(systemDefaultLanguage);
      setLoading(false); 
      console.warn("[AUTH_CONTEXT] Firebase not configured, performing local logout.");
      return;
    }
    setLoading(true); 
    try {
      await signOut(configuredAuth);
    } catch (e) {
      console.error('[AUTH_CONTEXT] Logout error:', e);
      setUser(null);
      setRole(null);
      setDisplayName(null);
      setNotificationPreferences(defaultNotificationPreferences);
      setLanguagePreference(systemDefaultLanguage);
      setLoading(false); 
      throw e;
    }
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
    if (!ensureServicesAvailable() || !user || !configuredAuth || !configuredDb) { 
      throw new Error("User not authenticated, Firebase not configured, or DB service unavailable.");
    }
    await updateProfile(user, { displayName: newName });
    const userDocRef = doc(configuredDb, 'users', user.uid);
    await updateDoc(userDocRef, { displayName: newName });
    setDisplayName(newName); 
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!ensureServicesAvailable() || !user || !user.email || !configuredAuth) { 
      throw new Error("User not authenticated, email missing, Firebase not configured, or Auth service unavailable.");
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword);
  };

  const updateUserPreferences = async (preferences: NotificationPreferences) => {
    if (!ensureServicesAvailable() || !user || !configuredDb) { 
      throw new Error("User not authenticated, Firebase not configured, or DB service unavailable.");
    }
    const userDocRef = doc(configuredDb, 'users', user.uid);
    await updateDoc(userDocRef, { notificationPreferences: preferences });
    setNotificationPreferences(preferences); 
  };

  const updateUserLanguagePreference = async (language: string) => {
    if (!ensureServicesAvailable() || !user || !configuredDb) { 
      throw new Error("User not authenticated, Firebase not configured, or DB service unavailable.");
    }
    const userDocRef = doc(configuredDb, 'users', user.uid);
    await updateDoc(userDocRef, { languagePreference: language });
    setLanguagePreference(language); // Update context state immediately
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        displayName,
        notificationPreferences,
        languagePreference, // This is the effective language for the UI
        loading,
        isFirebaseConfigured: isFirebaseConfigurationValid, 
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

    