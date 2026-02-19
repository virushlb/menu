import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (args: { email: string; password: string }) => Promise<{
    ok: boolean;
    error?: string;
    needsEmailConfirmation?: boolean;
  }>;
  signUp: (args: { email: string; password: string }) => Promise<{
    ok: boolean;
    error?: string;
    needsEmailConfirmation?: boolean;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signIn: async ({ email, password }) => {
        if (!isSupabaseConfigured) return { ok: false, error: 'Supabase is not configured.' };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },
      signUp: async ({ email, password }) => {
        if (!isSupabaseConfigured) return { ok: false, error: 'Supabase is not configured.' };
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Helps avoid "redirect URL not allowed" issues when email confirmation is enabled.
            emailRedirectTo: `${window.location.origin}/admin/login`,
          },
        });
        if (error) return { ok: false, error: error.message };
        // If email confirmations are enabled, Supabase returns a user but no session.
        const needsEmailConfirmation = Boolean(data.user && !data.session);
        return { ok: true, needsEmailConfirmation };
      },
      signOut: async () => {
        if (!isSupabaseConfigured) return;
        await supabase.auth.signOut();
      },
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
