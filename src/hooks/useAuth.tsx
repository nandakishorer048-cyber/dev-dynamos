import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ApplicationStatus } from '@/types/earlyAccess';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  applicationStatus: ApplicationStatus | null;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; session: Session | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; session: Session | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Track whether we me processing an OAuth callback (tokens in URL hash)
  const isOAuthCallback = useRef(
    typeof window !== 'undefined' && window.location.hash.includes('access_token')
  );

  const hasRecoveredSessionRef = useRef(false);

  const checkUserStatus = async (currentUser: User | null) => {
    if (!currentUser) {
      setApplicationStatus(null);
      setIsAdmin(false);
      return;
    }

    try {
      // 1. Check admin status
      const { data: adminData } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (adminData) {
        setIsAdmin(true);
        setApplicationStatus('approved');
        return;
      }

      setIsAdmin(false);

      // 2. Check early access application status
      const { data: appData } = await supabase
        .from('early_access_applications')
        .select('status')
        .or(`user_id.eq.${currentUser.id},email.eq.${currentUser.email}`)
        .maybeSingle();

      if (appData) {
        setApplicationStatus(appData.status as ApplicationStatus);
      } else {
        setApplicationStatus(null);
      }
    } catch (err) {
      console.error('Error checking user status:', err);
    }
  };

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
      const currentUser = nextSession?.user ?? null;
      setUser(currentUser);
      void checkUserStatus(currentUser);
      setLoading(false);

      // If this was an OAuth callback and we got a session, clean up the hash
      if (isOAuthCallback.current && nextSession) {
        isOAuthCallback.current = false;
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

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
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        void checkUserStatus(currentUser);
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

    // During OAuth callbacks, skip manual session init — let onAuthStateChange handle it
    if (!isOAuthCallback.current) {
      void initializeSession();
    }

    return () => {
      isMounted = false;
      stopAutoRefreshSafely();
      subscription.unsubscribe();
    };
  }, []);


  const normalizeAuthError = (err: unknown) => {
    if (err instanceof Error) return err;
    if (typeof err === 'string') return new Error(err);
    return new Error('Authentication failed');
  };

  const isTransientNetworkError = (err: unknown) => {
    const message = normalizeAuthError(err).message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('network request failed') ||
      message.includes('load failed')
    );
  };

  const runAuthRequestWithRecovery = async (
    request: () => Promise<{ data: { session: Session | null }; error: Error | null }>
  ) => {
    try {
      await ensureHealthyStoredSession();
      const firstAttempt = await request();

      if (!firstAttempt.error) {
        return { error: null, session: firstAttempt.data.session ?? null };
      }

      if (!isTransientNetworkError(firstAttempt.error)) {
        return { error: normalizeAuthError(firstAttempt.error), session: firstAttempt.data.session ?? null };
      }

      await clearCorruptedSession();
      await ensureHealthyStoredSession();

      const secondAttempt = await request();
      return {
        error: secondAttempt.error ? normalizeAuthError(secondAttempt.error) : null,
        session: secondAttempt.data.session ?? null,
      };
    } catch (err) {
      await clearCorruptedSession();
      return { error: normalizeAuthError(err), session: null };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    return runAuthRequestWithRecovery(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      return { data: { session: data.session }, error: error ? normalizeAuthError(error) : null };
    });
  };

  const signIn = async (email: string, password: string) => {
    return runAuthRequestWithRecovery(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { data: { session: data.session }, error: error ? normalizeAuthError(error) : null };
    });
  };

  const signInWithGoogle = async () => {
    try {
      const redirectTo = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      return { error: error ? normalizeAuthError(error) : null };
    } catch (err) {
      return { error: normalizeAuthError(err) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    setApplicationStatus(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, applicationStatus, isAdmin, signUp, signIn, signInWithGoogle, signOut }}
    >
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