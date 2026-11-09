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

  // Seguridad: el panel SOLO se abre con una sesión real de Supabase y un perfil
  // marcado como administrador (role = 'admin' y active = true). Ya no existen
  // accesos locales, "acceso directo" ni cuentas creadas automáticamente.
  function checkLocalSession() {
    try {
      localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
    } catch {}
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  }

  async function loadProfile(authUser: any) {
    if (!supabase || !isSupabaseConfigured) {
      setIsAdmin(false);
      return false;
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const esAdmin = !!data && data.role === 'admin' && data.active === true;
      setProfile(data || null);
      setIsAdmin(esAdmin);
      return esAdmin;
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setProfile(null);
      setIsAdmin(false);
      return false;
    }
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);

    if (!email || !password) {
      const msg = 'Por favor ingresa un correo y contraseña válidos.';
      setError(msg);
      return { success: false, error: msg };
    }

    if (!supabase || !isSupabaseConfigured) {
      const msg = 'No hay conexión con la base de datos. Intenta más tarde.';
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data?.user) {
        const msg = 'Correo o contraseña incorrectos.';
        setError(msg);
        return { success: false, error: msg };
      }

      setUser(data.user);
      const esAdmin = await loadProfile(data.user);
      if (!esAdmin) {
        await supabase.auth.signOut();
        setUser(null);
        const msg = 'Esta cuenta no tiene permiso para entrar al panel.';
        setError(msg);
        return { success: false, error: msg };
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Error during Supabase login:', err);
      const msg = 'No se pudo iniciar sesión. Intenta nuevamente.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Eliminado por seguridad: daba acceso al panel sin contraseña.
  const signInAsOwner = async (): Promise<{ success: boolean }> => {
    return { success: false };
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
