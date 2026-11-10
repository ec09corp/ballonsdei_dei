/**
 * =====================================================================
 * BALLOONSDEI - CONFIGURACIÓN CENTRAL DE SUPABASE
 * =====================================================================
 * Este archivo se sincroniza con tu repositorio de GitHub y Vercel.
 *
 * PARA QUE ESTÉ CONECTADO EN VERCEL SIEMPRE TIENES 2 OPCIONES:
 *
 * OPCIÓN 1 (Recomendada en Vercel - Variables de Entorno):
 * -------------------------------------------------------------
 * 1. Ve a tu panel en vercel.com -> Entra a tu proyecto
 * 2. Ve a Settings -> Environment Variables
 * 3. Agrega:
 *      Nombre: VITE_SUPABASE_URL
 *      Valor: (Tu URL de Supabase, ej: https://xyzabcdefg.supabase.co)
 * 4. Agrega:
 *      Nombre: VITE_SUPABASE_ANON_KEY
 *      Valor: (Tu Clave Anónima anon public key)
 * 5. Haz clic en Deployments -> Redeploy.
 *
 * OPCIÓN 2 (Conexión Directa en Código - 100% Automático):
 * -------------------------------------------------------------
 * Si prefieres no lidiar con variables de entorno en Vercel,
 * simplemente pega tu URL y tu clave anon directamente abajo en:
 * DEFAULT_SUPABASE_CONFIG.
 *
 * Al hacer 'git push', ¡Vercel estará conectado para siempre y para
 * todos tus clientes desde cualquier celular o computadora!
 */

export interface SupabaseConfigDefinition {
  url: string;
  anonKey: string;
}

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfigDefinition = {
  url: 'https://wemcnljmazaxujqcvuuq.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbWNubGptYXpheHVqcWN2dXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NDI2MjYsImV4cCI6MjEwNjIxODYyNn0.U40p9HuqjzkD02-7Mjl3wD8w1OyK2xgVDnSwgh7VjDE',
};
