import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);


  const hasRecoveredSessionRef = useRef(false);

  const clearCorruptedSession = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // noop
    }

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
      if (projectId) {
        localStorage.removeItem(`sb-${projectId}-auth-token`);
      }

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // noop
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && !session && !hasRecoveredSessionRef.current) {
          hasRecoveredSessionRef.current = true;
          await clearCorruptedSession();
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        await clearCorruptedSession();
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);


  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const executeSignUp = () => supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });

    try {
      const { error } = await executeSignUp();
      return { error };
    } catch (err) {
      await clearCorruptedSession();
      try {
        const { error } = await executeSignUp();
        return { error };
      } catch (retryErr) {
        return { error: retryErr instanceof Error ? retryErr : new Error('Failed to fetch') };
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const executeSignIn = () => supabase.auth.signInWithPassword({
      email,
      password
    });

    try {
      const { error } = await executeSignIn();
      return { error };
    } catch (err) {
      await clearCorruptedSession();
      try {
        const { error } = await executeSignIn();
        return { error };
      } catch (retryErr) {
        return { error: retryErr instanceof Error ? retryErr : new Error('Failed to fetch') };
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut({ scope: 'local' });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}