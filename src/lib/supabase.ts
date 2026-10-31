import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { processImageFile, dataUrlToBlob } from './imageUtils';
import { DEFAULT_SUPABASE_CONFIG } from '../config/supabaseConfig';

const STORAGE_URL_KEY = 'ballonsdei_supabase_url';
const STORAGE_ANON_KEY = 'ballonsdei_supabase_key';

export function isValidSupabaseUrl(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim();
  return Boolean(
    clean.startsWith('https://') &&
    clean.includes('.supabase.co') &&
    !clean.includes('your-project') &&
    !clean.includes('xyzabcdefg')
  );
}

export function isValidSupabaseKey(key?: string): boolean {
  if (!key) return false;
  const clean = key.trim();
  return Boolean(
    clean.length > 20 &&
    !clean.includes('your-anon') &&
    !clean.includes('your-key')
  );
}

// Read from localStorage (admin testing) > env vars (Vercel) > default config (direct file)
export function getSupabaseCredentials(): { url: string; anonKey: string; source: 'localStorage' | 'env' | 'config' | 'none' } {
  // 1. Browser localStorage (allows override from Admin panel)
  const storedUrl = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_URL_KEY) || '').trim() : '';
  const storedKey = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_ANON_KEY) || '').trim() : '';

  // 2. Vite & Vercel Environment Variables (supports both VITE_ and non-prefixed)
  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL || metaEnv.SUPABASE_URL || '').trim();
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.SUPABASE_ANON_KEY || '').trim();

  // 3. Central direct config file (src/config/supabaseConfig.ts)
  const configUrl = (DEFAULT_SUPABASE_CONFIG?.url || '').trim();
  const configKey = (DEFAULT_SUPABASE_CONFIG?.anonKey || '').trim();

  let finalUrl = '';
  let finalKey = '';
  let source: 'localStorage' | 'env' | 'config' | 'none' = 'none';

  if (isValidSupabaseUrl(storedUrl) && isValidSupabaseKey(storedKey)) {
    finalUrl = storedUrl;
    finalKey = storedKey;
    source = 'localStorage';
  } else if (isValidSupabaseUrl(envUrl) && isValidSupabaseKey(envKey)) {
    finalUrl = envUrl;
    finalKey = envKey;
    source = 'env';
  } else if (isValidSupabaseUrl(configUrl) && isValidSupabaseKey(configKey)) {
    finalUrl = configUrl;
    finalKey = configKey;
    source = 'config';
  } else {
    // Partial fallback for display in Admin
    finalUrl = storedUrl || envUrl || configUrl;
    finalKey = storedKey || envKey || configKey;
  }

  return { url: finalUrl, anonKey: finalKey, source };
}

export function checkIsSupabaseConfigured(urlInput?: string, keyInput?: string): boolean {
  const { url: currentUrl, anonKey: currentKey } = getSupabaseCredentials();
  const testUrl = (urlInput ?? currentUrl).trim();
  const testKey = (keyInput ?? currentKey).trim();

  return isValidSupabaseUrl(testUrl) && isValidSupabaseKey(testKey);
}

export let isSupabaseConfigured: boolean = checkIsSupabaseConfigured();

let activeClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getActiveSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  const isConfigured = checkIsSupabaseConfigured(url, anonKey);
  isSupabaseConfigured = isConfigured;

  if (!isConfigured) {
    activeClient = null;
    return null;
  }

  // Reuse existing client if credentials haven't changed
  if (activeClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return activeClient;
  }

  try {
    activeClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return activeClient;
  } catch (err) {
    console.error('Error inicializando Supabase Client:', err);
    activeClient = null;
    return null;
  }
}

// Initialize on module load
getActiveSupabaseClient();

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    if (cleanUrl) {
      localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
    }

    if (cleanKey) {
      localStorage.setItem(STORAGE_ANON_KEY, cleanKey);
    } else {
      localStorage.removeItem(STORAGE_ANON_KEY);
    }

    // Force client recreation immediately
    lastUsedUrl = '';
    lastUsedKey = '';
    isSupabaseConfigured = checkIsSupabaseConfigured(cleanUrl, cleanKey);
    getActiveSupabaseClient();
  }
}

/**
 * Transparent proxy to always execute against the live, active Supabase client.
 * If Supabase is not configured, returns safe fallback no-op objects to prevent crashes.
 */
export const supabase: SupabaseClient | any = new Proxy({}, {
  get(_target, prop) {
    const client = getActiveSupabaseClient();
    if (!client) {
      // Return safe chainable fallbacks for common calls if checked before configuration
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: async () => ({ data: null, error: new Error('Supabase no configurado') }),
          signOut: async () => ({ error: null }),
        };
      }
      return undefined;
    }
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

/**
 * Storage helper for uploading images to 'product-images' bucket
 * or falling back to persistent compact Data URL if storage bucket is not configured.
 */
export async function uploadProductImage(
  file: File, 
  productId: string, 
  position: number,
  precomputedDataUrl?: string
): Promise<{ url: string | null; error: Error | null }> {
  // Use precomputed data URL if available to avoid redundant canvas compression
  let fallbackDataUrl = precomputedDataUrl || '';
  if (!fallbackDataUrl) {
    try {
      fallbackDataUrl = await processImageFile(file, 850, 0.8);
    } catch {
      fallbackDataUrl = '';
    }
  }

  const client = getActiveSupabaseClient();
  if (!client) {
    return {
      url: fallbackDataUrl,
      error: null,
    };
  }

  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `products/${productId}/image-${position}-${Date.now()}.${ext}`;

    // Upload tiny lightweight blob instead of 10MB uncompressed raw file
    const uploadPayload = fallbackDataUrl ? dataUrlToBlob(fallbackDataUrl) : file;

    // Fast 4-second timeout to avoid any device freezing on slow connections
    const uploadPromise = client.storage
      .from('product-images')
      .upload(filePath, uploadPayload, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });

    const timeoutPromise = new Promise<{ error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error('Storage timeout')), 4000)
    );

    const { error: uploadError } = await (Promise.race([uploadPromise, timeoutPromise]) as any);

    if (uploadError) {
      console.warn('Supabase storage notice, using ultra-fast data URL:', uploadError.message);
      return { url: fallbackDataUrl, error: null };
    }

    const { data: publicUrlData } = client.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.warn('Storage fallback to high-quality data URL:', err?.message || err);
    return { url: fallbackDataUrl, error: null };
  }
}

/**
 * Storage helper for uploading payment receipt screenshots/comprobantes to Supabase Storage
 * under 'comprobantes' or 'product-images' bucket, with fallback to web-safe compressed Data URL.
 */
export async function uploadReceiptImage(
  fileOrBlobOrUrl: File | Blob | string,
  orderIdentifier: string = 'pedido'
): Promise<{ url: string; isRemote: boolean; error: Error | null }> {
  // If already a remote URL (http/https), return as is
  if (typeof fileOrBlobOrUrl === 'string' && fileOrBlobOrUrl.startsWith('http')) {
    return { url: fileOrBlobOrUrl, isRemote: true, error: null };
  }

  let finalBlob: Blob | File | null = null;
  let fallbackDataUrl = '';

  if (typeof fileOrBlobOrUrl === 'string') {
    fallbackDataUrl = fileOrBlobOrUrl;
    try {
      const res = await fetch(fileOrBlobOrUrl);
      finalBlob = await res.blob();
    } catch {
      return { url: fallbackDataUrl, isRemote: false, error: null };
    }
  } else {
    finalBlob = fileOrBlobOrUrl;
    try {
      if (fileOrBlobOrUrl instanceof File) {
        fallbackDataUrl = await processImageFile(fileOrBlobOrUrl, 900, 0.85);
      }
    } catch {
      fallbackDataUrl = '';
    }
  }

  const client = getActiveSupabaseClient();
  if (!client || !finalBlob) {
    return { url: fallbackDataUrl, isRemote: false, error: null };
  }

  const cleanId = orderIdentifier.replace(/[^a-zA-Z0-9_-]/g, '') || 'recibo';
  const timestamp = Date.now();
  const filePath = `comprobantes/recibo-${cleanId}-${timestamp}.jpg`;

  // First try 'comprobantes' bucket, then 'product-images'
  const bucketsToTry = ['comprobantes', 'product-images'];

  for (const bucket of bucketsToTry) {
    try {
      const { error: uploadErr } = await client.storage
        .from(bucket)
        .upload(filePath, finalBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadErr) {
        const { data: pubData } = client.storage.from(bucket).getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          return { url: pubData.publicUrl, isRemote: true, error: null };
        }
      }
    } catch (bErr) {
      console.warn(`Bucket ${bucket} upload notice:`, bErr);
    }
  }

  return { url: fallbackDataUrl, isRemote: false, error: null };
}

/**
 * Test connectivity with Supabase project
 */
export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string; tablesReady?: boolean }> {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();

  if (!cleanUrl || !cleanKey) {
    return { success: false, message: 'La URL y la clave anónima (anon public key) son requeridas.' };
  }

  if (!cleanUrl.startsWith('https://') || !cleanUrl.includes('.supabase.co')) {
    return { success: false, message: 'La URL debe comenzar con https:// y pertenecer al dominio supabase.co' };
  }

  if (cleanKey.length < 20) {
    return { success: false, message: 'La clave anónima debe ser una cadena JWT válida (más de 20 caracteres).' };
  }

  try {
    const testClient = createClient(cleanUrl, cleanKey);
    // Ping public categories table
    const { error } = await testClient.from('categories').select('count', { count: 'exact', head: true });
    
    if (error) {
      // If table doesn't exist yet, the connection itself is valid!
      if (error.code === 'PGRST116' || error.message.includes('relation "categories" does not exist') || error.message.includes('does not exist')) {
        return { 
          success: true, 
          tablesReady: false,
          message: '¡Conexión verificada con tu proyecto Supabase! Ahora copia y ejecuta el script SQL para crear las tablas necesarias.' 
        };
      }
      
      if (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('Invalid API key')) {
        return { success: false, message: 'La clave anónima (anon key) parece incorrecta o expirada. Verifica en Project Settings > API.' };
      }

      // Other PostgreSQL notices
      return { 
        success: true, 
        tablesReady: false,
        message: `Conectado con Supabase (${error.message}). Recuerda ejecutar el script SQL con los permisos.` 
      };
    }

    return { 
      success: true, 
      tablesReady: true,
      message: '¡Conexión y tablas de Supabase verificadas exitosamente!' 
    };
  } catch (err: any) {
    return { success: false, message: `Error conectando con Supabase: ${err.message || err}` };
  }
}

/**
 * Returns a complete SQL migration script to setup ALL 14 tables in Supabase
 */
export function getSupabaseSQLScript(): string {
  return `-- ================================================================
-- BALLONSDEI - ESQUEMA COMPLETO Y DEFINITIVO DE BASE DE DATOS
-- Copia y pega TODO este script en: Supabase > SQL Editor > New query > Run
-- ================================================================

-- 1. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT ('cat-' || substr(md5(random()::text), 1, 10)),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 99,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Productos (Venta y Alquiler)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || substr(md5(random()::text), 1, 10)),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    previous_price NUMERIC(10, 2),
    sku TEXT,
    category_id TEXT,
    product_type TEXT DEFAULT 'product',
    gift_type TEXT DEFAULT 'none',
    availability_type TEXT DEFAULT 'ready_now',
    preparation_days INTEGER DEFAULT 0,
    variants JSONB DEFAULT '[]'::jsonb,
    stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 2,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT true,
    available_for_rental BOOLEAN DEFAULT false,
    rental_price NUMERIC(10, 2),
    rental_deposit NUMERIC(10, 2),
    rental_conditions TEXT,
    size TEXT,
    color TEXT,
    tags TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- 3. Tabla de Imágenes de Productos (Hasta 4 fotos por producto)
CREATE TABLE IF NOT EXISTS public.product_images (
    id TEXT PRIMARY KEY DEFAULT ('img-' || substr(md5(random()::text), 1, 10)),
    product_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    position INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Clientes
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT ('cust-' || substr(md5(random()::text), 1, 10)),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Órdenes / Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ord-' || substr(md5(random()::text), 1, 10)),
    order_number TEXT NOT NULL UNIQUE,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT,
    delivery_date TEXT,
    delivery_type TEXT DEFAULT 'delivery',
    payment_method TEXT DEFAULT 'Yappy',
    payment_status TEXT DEFAULT 'pending',
    status TEXT DEFAULT 'pending',
    subtotal NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    receipt_url TEXT,
    receipt_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de Ítems de Orden
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT ('item-' || substr(md5(random()::text), 1, 10)),
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    is_rental BOOLEAN DEFAULT false,
    rental_start_date TEXT,
    rental_end_date TEXT,
    selected_variant TEXT,
    dedication_message TEXT,
    customization JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabla de Alquileres de Mobiliario y Estructuras
CREATE TABLE IF NOT EXISTS public.rentals (
    id TEXT PRIMARY KEY DEFAULT ('rent-' || substr(md5(random()::text), 1, 10)),
    product_id TEXT,
    product_name TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    deposit_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_price NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'reserved',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tabla de Ajustes de Tienda
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'current_settings',
    store_name TEXT DEFAULT 'Ballonsdei',
    logo_url TEXT,
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_image TEXT,
    hero_badge_image TEXT,
    hero_badge_title TEXT,
    instagram_url TEXT,
    whatsapp_number TEXT DEFAULT '+50764324750',
    phone TEXT,
    email TEXT,
    address TEXT,
    google_maps_url TEXT,
    schedule_hours TEXT,
    currency TEXT DEFAULT 'USD',
    delivery_fee NUMERIC(10, 2) DEFAULT 5.00,
    footer_photo_1 TEXT,
    footer_photo_2 TEXT,
    footer_photo_3 TEXT,
    footer_photo_4 TEXT,
    footer_caption_1 TEXT,
    footer_caption_2 TEXT,
    footer_caption_3 TEXT,
    footer_caption_4 TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Tabla de Perfiles de Administrador
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    role TEXT DEFAULT 'admin',
    active BOOLEAN DEFAULT true,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Tabla de Elementos del Personalizador de Arreglos
CREATE TABLE IF NOT EXISTS public.customizer_elements (
    id TEXT PRIMARY KEY DEFAULT ('elem-' || substr(md5(random()::text), 1, 10)),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT NOT NULL,
    available_colors JSONB DEFAULT '[]'::jsonb,
    order_index INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Tabla de Diseños Personalizados de Clientes
CREATE TABLE IF NOT EXISTS public.custom_designs (
    id TEXT PRIMARY KEY DEFAULT ('des-' || substr(md5(random()::text), 1, 10)),
    customer_id TEXT,
    customer_name TEXT,
    base_product_id TEXT,
    title TEXT,
    elements JSONB DEFAULT '[]'::jsonb,
    total_price NUMERIC(10, 2) DEFAULT 0.00,
    preview_image TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Tabla de Insumos y Materias Primas de Producción
CREATE TABLE IF NOT EXISTS public.production_items (
    id TEXT PRIMARY KEY DEFAULT ('mat-' || substr(md5(random()::text), 1, 10)),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Varios',
    unit TEXT DEFAULT 'unidades',
    current_quantity NUMERIC(10, 2) DEFAULT 0,
    minimum_quantity NUMERIC(10, 2) DEFAULT 5,
    cost NUMERIC(10, 2) DEFAULT 0.00,
    supplier TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Tabla de Movimientos de Inventario de Producción
CREATE TABLE IF NOT EXISTS public.production_movements (
    id TEXT PRIMARY KEY DEFAULT ('mov-' || substr(md5(random()::text), 1, 10)),
    item_id TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    performed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Tabla de Relación Producto -> Insumos de Producción
CREATE TABLE IF NOT EXISTS public.product_production_items (
    id TEXT PRIMARY KEY DEFAULT ('ppi-' || substr(md5(random()::text), 1, 10)),
    product_id TEXT NOT NULL,
    production_item_id TEXT NOT NULL,
    required_quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- PERMISOS Y DESACTIVACIÓN DE ROW LEVEL SECURITY (RLS)
-- Esto permite que tu panel guarde productos, fotos y pedidos sin bloqueos
-- ================================================================
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rentals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customizer_elements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.custom_designs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.production_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.production_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_production_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_variants DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos globales al esquema public a los roles de Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Crear Buckets de Storage para Imágenes y Comprobantes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprobantes', 'comprobantes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas públicas para el bucket de imágenes
DROP POLICY IF EXISTS "Public Access product-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert product-images" ON storage.objects;
CREATE POLICY "Public Access product-images" ON storage.objects
FOR ALL USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Políticas públicas para el bucket de comprobantes
DROP POLICY IF EXISTS "Public Access comprobantes" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert comprobantes" ON storage.objects;
CREATE POLICY "Public Access comprobantes" ON storage.objects
FOR ALL USING (bucket_id = 'comprobantes')
WITH CHECK (bucket_id = 'comprobantes');

-- Asegurar columnas de comprobantes en orders
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS receipt_ref TEXT;
`;
}

/**
 * Returns a quick SQL snippet to fix permissions across all tables
 */
export function getSupabasePermissionFixScript(): string {
  return `-- RESOLVER PERMISOS Y ACTIVAR ACCESO EN TODAS LAS TABLAS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rentals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customizer_elements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.custom_designs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.production_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.production_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_production_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_variants DISABLE ROW LEVEL SECURITY;
`;

}

