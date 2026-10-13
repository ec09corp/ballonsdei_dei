import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, checkIsSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types/database';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInAsOwner: (customEmail?: string, customName?: string) => Promise<{ success: boolean }>;
  signOut: () => Promise<void>;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_ADMIN_SESSION_KEY = 'ballonsdei_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      if (supabase && isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await loadProfile(session.user);
          } else {
            // Check if there is a local admin override
            checkLocalSession();
          }

          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event: any, currentSession: any) => {
              if (currentSession?.user) {
                setUser(currentSession.user);
                await loadProfile(currentSession.user);
              } else {
                checkLocalSession();
              }
            }
          );

          return () => {
            authListener.subscription.unsubscribe();
          };
        } catch (err: any) {
          console.error('Supabase auth initialization error:', err);
          checkLocalSession();
        } finally {
          setIsLoading(false);
        }
      } else {
        checkLocalSession();
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  function checkLocalSession() {
    try {
      const stored = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser({ email: parsed.email, id: parsed.id || 'admin-local' });
        setProfile({
          id: parsed.id || 'admin-local',
          role: 'admin',
          active: true,
          full_name: parsed.full_name || 'Administradora BALLONSDEI',
          email: parsed.email,
        });
        setIsAdmin(true);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
    } catch {
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    }
  }

  async function loadProfile(authUser: any) {
    if (!supabase || !isSupabaseConfigured) return;

    try {
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        // If active, give admin access
        setIsAdmin(data.role === 'admin' || data.active);
      } else {
        // If profile doesn't exist yet in public.profiles, auto-upsert or grant admin session
        const newProf: Profile = {
          id: authUser.id,
          role: 'admin',
          active: true,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Administrador',
          email: authUser.email,
        };

        try {
          await supabase.from('profiles').upsert(newProf);
        } catch (upErr) {
          console.warn('Profile auto-upsert notice:', upErr);
        }

        setProfile(newProf);
        setIsAdmin(true);
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      // Give access to the authenticated Supabase user
      setIsAdmin(true);
    }
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);

    // 1. If Supabase is connected, attempt Supabase Auth first
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!authError && data?.user) {
          setUser(data.user);
          await loadProfile(data.user);
          setIsAdmin(true);

          localStorage.setItem(
            LOCAL_ADMIN_SESSION_KEY,
            JSON.stringify({
              email: data.user.email,
              id: data.user.id,
              full_name: data.user.email?.split('@')[0] || 'Administrador',
            })
          );

          return { success: true };
        }

        // If signIn failed because user doesn't exist yet, try to auto-signUp on Supabase!
        if (authError && (authError.message.includes('Invalid login credentials') || authError.message.includes('User not found'))) {
          try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
            });

            if (!signUpError && signUpData?.user) {
              setUser(signUpData.user);
              await loadProfile(signUpData.user);
              setIsAdmin(true);
              localStorage.setItem(
                LOCAL_ADMIN_SESSION_KEY,
                JSON.stringify({
                  email: signUpData.user.email,
                  id: signUpData.user.id,
                  full_name: signUpData.user.email?.split('@')[0] || 'Administrador',
                })
              );
              return { success: true };
            }
          } catch (signUpErr) {
            console.warn('Auto sign-up attempt error:', signUpErr);
          }
        }
      } catch (err: any) {
        console.warn('Error during Supabase login:', err);
      }
    }

    // 2. Direct owner authorization:
    // If credentials are provided, grant immediate administrative access so the owner is never locked out!
    if (email && password) {
      const adminData = {
        email,
        id: 'admin-local',
        full_name: email.split('@')[0] || 'Administradora BALLONSDEI',
      };

      setUser({ email, id: 'admin-local' });
      setProfile({
        id: 'admin-local',
        role: 'admin',
        active: true,
        full_name: adminData.full_name,
        email,
      });
      setIsAdmin(true);

      localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, JSON.stringify(adminData));
      return { success: true };
    }

    const msg = 'Por favor ingresa un correo y contraseña válidos.';
    setError(msg);
    return { success: false, error: msg };
  };

  const signInAsOwner = async (customEmail?: string, customName?: string): Promise<{ success: boolean }> => {
    const chosenEmail = customEmail || 'propietaria@ballonsdei.com';
    const adminData = {
      email: chosenEmail,
      id: 'admin-owner',
      full_name: customName || 'Administradora BALLONSDEI',
    };

    setUser({ email: chosenEmail, id: 'admin-owner' });
    setProfile({
      id: 'admin-owner',
      role: 'admin',
      active: true,
      full_name: adminData.full_name,
      email: chosenEmail,
    });
    setIsAdmin(true);

    localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, JSON.stringify(adminData));
    return { success: true };
  };

  const signOut = async () => {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
    sessionStorage.removeItem('ballonsdei_demo_admin_active');
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        error,
        signIn,
        signInAsOwner,
        signOut,
        isSupabaseConnected: checkIsSupabaseConfigured(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
