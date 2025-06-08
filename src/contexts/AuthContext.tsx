import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    let mounted = true;

    // 初期セッションの取得
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Initial session error:', error);
        } else {
          console.log('AuthProvider: Initial session:', { 
            hasSession: !!session, 
            userId: session?.user?.id,
            email: session?.user?.email 
          });
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider: Unexpected error getting session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', { 
          event, 
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email 
        });

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Sign up attempt for:', email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('AuthProvider: Sign up error:', error);
      }
      
      return { error: error || undefined };
    } catch (err) {
      console.error('AuthProvider: Sign up unexpected error:', err);
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Sign in attempt for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('AuthProvider: Sign in error:', error);
      }
      
      return { error: error || undefined };
    } catch (err) {
      console.error('AuthProvider: Sign in unexpected error:', err);
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('AuthProvider: Google sign in attempt');
      
      const redirectUrl = window.location.origin;
      console.log('AuthProvider: Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('AuthProvider: Google sign in error:', error);
        return { error };
      }

      console.log('AuthProvider: Google sign in initiated successfully');
      return { error: undefined };
    } catch (err) {
      console.error('AuthProvider: Google sign in unexpected error:', err);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthProvider: Sign out attempt');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthProvider: Sign out error:', error);
      }
      
      return { error: error || undefined };
    } catch (err) {
      console.error('AuthProvider: Sign out unexpected error:', err);
      return { error: err as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('AuthProvider: Password reset attempt for:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('AuthProvider: Password reset error:', error);
      }
      
      return { error: error || undefined };
    } catch (err) {
      console.error('AuthProvider: Password reset unexpected error:', err);
      return { error: err as Error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};