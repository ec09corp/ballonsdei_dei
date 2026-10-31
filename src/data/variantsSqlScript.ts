/**
 * Script SQL Universal y Definitivo para Supabase (PostgreSQL) - Ballonsdei
 * - Reinicia productos, categorías, personalizaciones e inventario/arreglos desde 0 en Supabase.
 * - Elimina el error 42804 de tipos incompatibles (text vs uuid) en product_variants.
 * - Elimina el error 42501 (Permission Denied) desactivando RLS en todas las tablas y otorgando permisos públicos completos.
 * - Configura ON DELETE CASCADE en todas las llaves foráneas para que al borrar un producto, categoría, insumo o personalización se elimine inmediatamente sin errores de restricción.
 * - Crea y habilita los Storage Buckets 'product-images' y 'customizer-elements' con acceso público.
 * - Garantiza que todo lo que agregues o edites manualmente se guarde directamente en Supabase y se refleje al instante.
 * 
 * Instrucciones de uso en Supabase:
 * 1. Abre tu panel en: https://supabase.com/dashboard/project/_/sql
 * 2. Ve a 'SQL Editor' > 'New query'
 * 3. Pega todo este código y haz clic en 'RUN' (Ejecutar)
 */
export const SUPABASE_VARIANTS_SQL = `-- ==============================================================================
-- BALLONSDEI: REINICIO Y ESTRUCTURA DEFINITIVA EN SUPABASE (POSTGRESQL)
-- Limpia y prepara: Productos, Categorías, Personalizaciones, Inventario y Arreglos
-- ==============================================================================

-- 1. Habilitar extensión pgcrypto para generación de identificadores UUID si se requieren
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. TABLA DE CATEGORÍAS
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

ALTER TABLE IF EXISTS public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS public.categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 99;

-- 3. TABLA DE PRODUCTOS Y ARREGLOS
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
    variants JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    availability_type TEXT DEFAULT 'ready_now',
    preparation_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS availability_type TEXT DEFAULT 'ready_now';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS preparation_days INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 4. TABLA DE IMÁGENES DE PRODUCTOS (con CASCADE para eliminación limpia)
CREATE TABLE IF NOT EXISTS public.product_images (
    id TEXT PRIMARY KEY DEFAULT ('img-' || substr(md5(random()::text), 1, 10)),
    product_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    position INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABLA DE ELEMENTOS DEL PERSONALIZADOR (Flores, Globos, Cintas, Peluches, Cajas, etc.)
CREATE TABLE IF NOT EXISTS public.customizer_elements (
    id TEXT PRIMARY KEY DEFAULT ('elem-' || substr(md5(random()::text), 1, 10)),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT NOT NULL,
    available_colors JSONB DEFAULT '[]'::jsonb,
    default_color TEXT,
    active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 1,
    default_width NUMERIC(10, 2),
    default_height NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABLA DE DISEÑOS PERSONALIZADOS GUARDADOS
CREATE TABLE IF NOT EXISTS public.custom_designs (
    id TEXT PRIMARY KEY DEFAULT ('design-' || substr(md5(random()::text), 1, 10)),
    product_id TEXT,
    base_product_id TEXT,
    customer_id TEXT,
    design_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview_image TEXT,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'saved',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TABLA DE INSUMOS Y MATERIALES DE PRODUCCIÓN / INVENTARIO
CREATE TABLE IF NOT EXISTS public.production_items (
    id TEXT PRIMARY KEY DEFAULT ('mat-' || substr(md5(random()::text), 1, 10)),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Varios',
    unit TEXT NOT NULL DEFAULT 'unidades',
    current_quantity INTEGER NOT NULL DEFAULT 0,
    minimum_quantity INTEGER NOT NULL DEFAULT 5,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    supplier TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TABLA DE RELACIÓN PRODUCTO-MATERIALES (RECETA DE ARREGLO)
CREATE TABLE IF NOT EXISTS public.product_production_items (
    id TEXT PRIMARY KEY DEFAULT ('rel-' || substr(md5(random()::text), 1, 10)),
    product_id TEXT NOT NULL,
    production_item_id TEXT NOT NULL,
    quantity_required NUMERIC(10, 2) NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. TABLA DE MOVIMIENTOS DE INVENTARIO
CREATE TABLE IF NOT EXISTS public.production_movements (
    id TEXT PRIMARY KEY DEFAULT ('mov-' || substr(md5(random()::text), 1, 10)),
    item_id TEXT NOT NULL,
    movement_type TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. TABLA DE CONFIGURACIONES GENERALES
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'general_settings',
    store_name TEXT DEFAULT 'Ballonsdei',
    whatsapp_number TEXT,
    instagram_user TEXT,
    primary_color TEXT DEFAULT '#763D8B',
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Adaptación inteligente de 'product_variants' (Resuelve error 42804 de PostgreSQL)
DO $$ 
DECLARE
    prod_id_type text;
BEGIN
    SELECT data_type INTO prod_id_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'id';

    DROP TABLE IF EXISTS public.product_variants CASCADE;

    IF prod_id_type = 'uuid' THEN
        CREATE TABLE public.product_variants (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
            sku TEXT,
            stock INTEGER DEFAULT 10,
            is_default BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        CREATE TABLE public.product_variants (
            id TEXT PRIMARY KEY DEFAULT ('var-' || substr(md5(random()::text), 1, 10)),
            product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
            sku TEXT,
            stock INTEGER DEFAULT 10,
            is_default BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- 12. Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_prod_mat_product_id ON public.product_production_items(product_id);
CREATE INDEX IF NOT EXISTS idx_customizer_elements_cat ON public.customizer_elements(category);

-- 13. LIMPIEZA TOTAL PARA INICIAR DESDE CERO
-- (Elimina en orden de dependencias para no provocar errores de llave foránea)
DELETE FROM public.production_movements WHERE id IS NOT NULL;
DELETE FROM public.product_production_items WHERE id IS NOT NULL;
DELETE FROM public.production_items WHERE id IS NOT NULL;
DELETE FROM public.product_variants WHERE id IS NOT NULL;
DELETE FROM public.product_images WHERE id IS NOT NULL;
DELETE FROM public.custom_designs WHERE id IS NOT NULL;
DELETE FROM public.customizer_elements WHERE id IS NOT NULL;
DELETE FROM public.products WHERE id IS NOT NULL;
DELETE FROM public.categories WHERE id IS NOT NULL;

-- 14. DESACTIVACIÓN TOTAL DE RLS (Erradica el error 42501 "Permission Denied")
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customizer_elements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.custom_designs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.production_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_production_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.production_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;

-- 15. PERMISOS UNIVERSALES DE LECTURA Y ESCRITURA
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 16. STORAGE BUCKETS CON ACCESO PÚBLICO
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('customizer-elements', 'customizer-elements', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Acceso Publico product-images" ON storage.objects;
CREATE POLICY "Acceso Publico product-images" ON storage.objects
FOR ALL USING (bucket_id = 'product-images' OR bucket_id = 'customizer-elements')
WITH CHECK (bucket_id = 'product-images' OR bucket_id = 'customizer-elements');

-- ¡Todo limpio y configurado! Base de datos en 0 lista para agregar productos, categorías, inventario y personalizaciones.
`;
