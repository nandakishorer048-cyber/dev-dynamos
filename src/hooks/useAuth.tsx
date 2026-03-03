import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; session: Session | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; session: Session | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);


  const hasRecoveredSessionRef = useRef(false);

  const isSessionRefreshTokenValid = (session: Session | null) => {
    const refreshToken = session?.refresh_token;
    return typeof refreshToken === 'string' && refreshToken.length >= 20;
  };

  const stopAutoRefreshSafely = () => {
    try {
      supabase.auth.stopAutoRefresh();
    } catch {
      // noop
    }
  };

  const startAutoRefreshSafely = (session: Session | null) => {
    if (!isSessionRefreshTokenValid(session)) return;

    try {
      supabase.auth.startAutoRefresh();
    } catch {
      // noop
    }
  };

  const clearCorruptedSession = async () => {
    stopAutoRefreshSafely();

    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // noop
    }

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
      const keysToRemove = Object.keys(localStorage).filter(
        (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
      );

      if (projectId) {
        keysToRemove.push(`sb-${projectId}-auth-token`);
      }

      [...new Set(keysToRemove)].forEach((key) => localStorage.removeItem(key));
    } catch {
      // noop
    }
  };

  const hasClearlyCorruptedStoredSession = () => {
    try {
      const authKeys = Object.keys(localStorage).filter(
        (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
      );

      if (authKeys.length === 0) return false;

      return authKeys.some((key) => {
        const raw = localStorage.getItem(key);
        if (!raw) return true;

        try {
          const parsed = JSON.parse(raw);
          const sessionLike = parsed?.currentSession ?? parsed;
          const refreshToken = sessionLike?.refresh_token ?? sessionLike?.refreshToken;

          return typeof refreshToken !== 'string' || refreshToken.length < 20;
        } catch {
          return true;
        }
      });
    } catch {
      return false;
    }
  };

  const ensureHealthyStoredSession = async () => {
    if (!hasClearlyCorruptedStoredSession()) return;

    hasRecoveredSessionRef.current = true;
    await clearCorruptedSession();
  };

  useEffect(() => {
    let isMounted = true;

    const runAfterAuthCallback = (work: () => Promise<void> | void) => {
      window.setTimeout(() => {
        void Promise.resolve(work()).catch(() => {
          // noop
        });
      }, 0);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      runAfterAuthCallback(() => {
        if (isSessionRefreshTokenValid(nextSession)) {
          startAutoRefreshSafely(nextSession);
        } else {
          stopAutoRefreshSafely();
        }
      });

      if ((event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && !nextSession && !hasRecoveredSessionRef.current) {
        hasRecoveredSessionRef.current = true;
        runAfterAuthCallback(clearCorruptedSession);
      }
    });

    const initializeSession = async () => {
      try {
        stopAutoRefreshSafely();
        await ensureHealthyStoredSession();

        const { data: { session }, error } = await supabase.auth.getSession();

        const hasInvalidRefreshToken = Boolean(session && !isSessionRefreshTokenValid(session));

        if (error || hasInvalidRefreshToken) {
          await clearCorruptedSession();
          if (!isMounted) return;
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        startAutoRefreshSafely(session);
      } catch {
        await clearCorruptedSession();
        if (!isMounted) return;
        setSession(null);
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void initializeSession();

    return () => {
      isMounted = false;
      stopAutoRefreshSafely();
      subscription.unsubscribe();
    };
  }, []);


  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    try {
      await ensureHealthyStoredSession();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      return { error };
    } catch (err) {
      await clearCorruptedSession();
      return { error: err instanceof Error ? err : new Error('Failed to fetch') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await ensureHealthyStoredSession();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (err) {
      await clearCorruptedSession();
      return { error: err instanceof Error ? err : new Error('Failed to fetch') };
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