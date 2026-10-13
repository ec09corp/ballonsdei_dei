import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, AlertCircle, Sparkles, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminLoginProps {
  onBackToStore: () => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onBackToStore,
  onLoginSuccess,
}) => {
  const { signIn, signInAsOwner, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);

    try {
      const res = await signIn(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setLocalError(res.error || 'No se pudo iniciar sesión. Puedes usar el botón de Acceso Directo Propietario abajo.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Error en autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerAccess = async () => {
    setLoading(true);
    const chosenEmail = email.trim() || 'propietaria@ballonsdei.com';
    const res = await signInAsOwner(chosenEmail, 'Propietaria BALLONSDEI');
    setLoading(false);
    if (res.success) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2EC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-1.5 text-xs text-[#7A6B63] hover:text-[#2E2421] mb-6 mx-auto sm:mx-0 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la tienda BALLONSDEI</span>
        </button>

        <div className="text-center">
          <span className="font-serif text-3xl font-medium tracking-[0.2em] text-[#2E2421] block uppercase">
            BALLONSDEI
          </span>
          <span className="text-xs uppercase tracking-widest text-[#8D5844] mt-1 block">
            Panel de Administración Exclusivo
          </span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-[#E8DED7] space-y-6">
          {(localError || authError) && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#423530]">
                Tu Correo Electrónico
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com o admin@ballonsdei.com"
                  className="w-full text-xs p-3 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8] text-[#2E2421] focus:border-[#8D5844] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#423530]">
                Tu Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="w-full text-xs p-3 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8] text-[#2E2421] focus:border-[#8D5844] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#8D5844] hover:bg-[#744533] disabled:bg-[#D5C2B8] text-white text-xs font-medium uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Accediendo...' : 'Iniciar Sesión con mis Datos'}</span>
            </button>
          </form>

          {/* Direct Owner Access Button */}
          <div className="pt-4 border-t border-[#EBE2DB] space-y-2">
            <span className="text-[11px] text-[#7A6B63] block text-center font-light">
              ¿Quieres acceder de inmediato como dueña de la tienda?
            </span>
            <button
              type="button"
              onClick={handleOwnerAccess}
              disabled={loading}
              className="w-full py-3 px-3 bg-[#382B26] hover:bg-[#251D1A] text-white rounded-lg text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#E6C6B0]" />
              <span>Acceso Directo Propietaria BALLONSDEI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
