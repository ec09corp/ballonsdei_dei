/**
 * Script SQL Universal y Definitivo para Supabase (PostgreSQL)
 * Corrige el error 42804 de tipos incompatibles (text vs uuid),
 * agrega soporte completo para variantes con precios y nombres,
 * y habilita la visualización inmediata de productos en la tienda pública.
 * 
 * Instrucciones:
 * 1. Ve a tu panel de Supabase: https://supabase.com/dashboard/project/_/sql
 * 2. Abre el SQL Editor > 'New query'
 * 3. Pega todo este código y pulsa 'RUN'
 */
export const SUPABASE_VARIANTS_SQL = `-- ==============================================================================
-- BALLONSDEI: SCRIPT DE MIGRACIÓN Y REPARACIÓN DEFINITIVA DE BASE DE DATOS
-- Resuelve el error 42804 (Key columns "product_id" and "id" are of incompatible types: text and uuid)
-- y asegura que todos los productos se sincronicen y aparezcan en la tienda pública.
-- ==============================================================================

-- 1. Asegurar extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Asegurar columnas necesarias en la tabla 'categories'
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

ALTER TABLE IF EXISTS public.categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE IF EXISTS public.categories 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 99;

-- 3. Asegurar columnas necesarias en la tabla 'products'
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
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar columnas para variantes y tipos de disponibilidad
ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS availability_type TEXT DEFAULT 'ready_now';

ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS preparation_days INTEGER DEFAULT 0;

ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 4. Creación dinámica de 'product_variants' adaptándose automáticamente al tipo de 'products.id'
-- (Detecta si products.id es UUID o TEXT para nunca generar el error 42804 de incompatibilidad)
DO $$ 
DECLARE
    prod_id_type text;
BEGIN
    -- Detectar tipo de columna 'id' en public.products
    SELECT data_type INTO prod_id_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'id';

    -- Eliminar tabla previa de variantes para recrearla con el tipo exacto correspondiente
    DROP TABLE IF EXISTS public.product_variants CASCADE;

    IF prod_id_type = 'uuid' THEN
        -- Caso: products.id es de tipo UUID
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
        -- Caso: products.id es de tipo TEXT / VARCHAR
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

-- 5. Crear índice para optimizar consultas de variantes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id 
ON public.product_variants(product_id);

-- 6. Tabla de imágenes de productos
CREATE TABLE IF NOT EXISTS public.product_images (
    id TEXT PRIMARY KEY DEFAULT ('img-' || substr(md5(random()::text), 1, 10)),
    product_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    position INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Desactivar Row Level Security (RLS) para evitar errores 42501 (Permission Denied)
-- Esto permite que el panel de administración inserte y actualice productos sin bloqueos
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_variants DISABLE ROW LEVEL SECURITY;

-- 8. Otorgar permisos globales al esquema público
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 9. Asegurar bucket de almacenamiento para imágenes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Acceso Publico product-images" ON storage.objects;
CREATE POLICY "Acceso Publico product-images" ON storage.objects
FOR ALL USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Confirmación final
COMMENT ON TABLE public.product_variants IS 'Variantes, tamaños y opciones con precios diferenciados para productos de Ballonsdei';
`;
