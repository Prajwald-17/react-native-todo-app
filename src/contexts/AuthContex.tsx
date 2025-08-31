// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await auth().signInWithEmailAndPassword(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

 const signUp = async (email: string, password: string) => {
  try {
    setError(null);
    setLoading(true);
    console.log('Attempting to sign up with Firebase...');
    console.log('Auth instance:', auth());
    const result = await auth().createUserWithEmailAndPassword(email, password);
    console.log('Sign up successful:', result.user.email);
  } catch (err: any) {
    console.error('Firebase auth error:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};

  const signOut = async () => {
    try {
      await auth().signOut();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
