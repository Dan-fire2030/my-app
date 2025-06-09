import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../../utils/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: Error }>;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signInWithGoogle: () => Promise<{ error?: Error }>;
  signOut: () => Promise<{ error?: Error }>;
  resetPassword: (email: string) => Promise<{ error?: Error }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Firebase Auth: Initializing...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase Auth: State changed:', { 
        hasUser: !!user, 
        email: user?.email,
        uid: user?.uid,
        displayName: user?.displayName,
        providerId: user?.providerData?.[0]?.providerId,
        timestamp: new Date().toISOString()
      });
      
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Firebase Auth: Sign up attempt for:', email);
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: undefined };
    } catch (err: any) {
      console.error('Firebase Auth: Sign up error:', err);
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Firebase Auth: Sign in attempt for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', { 
        uid: userCredential.user.uid, 
        email: userCredential.user.email,
        method: 'email/password',
        timestamp: new Date().toISOString()
      });
      return { error: undefined };
    } catch (err: any) {
      console.error('Firebase Auth: Sign in error:', err);
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Firebase Auth: Google sign in attempt');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Firebase Auth: Google sign in successful:', { 
        uid: result.user.uid, 
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        providerId: result.user.providerData?.[0]?.providerId,
        method: 'google.com',
        timestamp: new Date().toISOString()
      });
      return { error: undefined };
    } catch (err: any) {
      console.error('Firebase Auth: Google sign in error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('Firebase Auth: Sign out attempt');
      await firebaseSignOut(auth);
      return { error: undefined };
    } catch (err: any) {
      console.error('Firebase Auth: Sign out error:', err);
      return { error: err };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Firebase Auth: Password reset attempt for:', email);
      await sendPasswordResetEmail(auth, email);
      return { error: undefined };
    } catch (err: any) {
      console.error('Firebase Auth: Password reset error:', err);
      return { error: err };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};