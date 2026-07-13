import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInAsDemo: (role: UserRole) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PASSWORD = 'StadiumIQ2026!Demo';

const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string; fullName: string }> = {
  fan: { email: 'demo.fan@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Fan' },
  volunteer: { email: 'demo.volunteer@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Volunteer' },
  venue_staff: { email: 'demo.staff@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Staff' },
  organizer: { email: 'demo.organizer@stadiumiq.com', password: DEMO_PASSWORD, fullName: 'Demo Organizer' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, retries = 5) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        setLoading(false);
        return;
      }

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(email: string, password: string, fullName: string, role: UserRole) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });
    // Profile row is created automatically by the handle_new_user DB trigger.
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }

  async function signInAsDemo(role: UserRole): Promise<{ error: string | null }> {
    const demo = DEMO_ACCOUNTS[role];

    const { error: signInError } = await signIn(demo.email, demo.password);
    if (!signInError) return { error: null };

    // Account doesn't exist yet — create it, then sign in.
    if (signInError.message === 'Invalid login credentials') {
      const { error: signUpError } = await signUp(demo.email, demo.password, demo.fullName, role);
      if (signUpError) {
        return { error: signUpError.message };
      }
      const { error: secondSignInError } = await signIn(demo.email, demo.password);
      if (secondSignInError) {
        return { error: secondSignInError.message };
      }
      return { error: null };
    }

    return { error: signInError.message };
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }

    return { error };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        signInAsDemo,
        updateProfile,
      }}
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
