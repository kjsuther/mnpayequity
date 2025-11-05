import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  jurisdiction_id: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string, jurisdictionId: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, jurisdictionId: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    }
  };

  const refreshUserProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        await supabase.auth.signOut();
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      setLoading(false);
    }).catch(async (error) => {
      console.error('Failed to get session:', error);
      await supabase.auth.signOut();
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        if (event === 'SIGNED_OUT') {
          setUserProfile(null);
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, jurisdictionId: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (profile && !profile.is_admin) {
          if (!jurisdictionId) {
            await supabase.auth.signOut();
            return { error: new Error('Please select your jurisdiction') };
          }
          if (profile.jurisdiction_id !== jurisdictionId) {
            await supabase.auth.signOut();
            return { error: new Error('Selected jurisdiction does not match your account') };
          }
        }

        if (jurisdictionId) {
          await supabase
            .from('user_profiles')
            .update({ jurisdiction_id: jurisdictionId, updated_at: new Date().toISOString() })
            .eq('user_id', data.user.id);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, jurisdictionId: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            jurisdiction_id: jurisdictionId,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const isAdmin = userProfile?.is_admin ?? false;

  return (
    <AuthContext.Provider value={{ user, session, userProfile, loading, isAdmin, signIn, signUp, signOut, resetPassword, refreshUserProfile }}>
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
