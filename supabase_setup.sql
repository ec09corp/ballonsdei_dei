-- ==============================================================================
-- BLOOMY DAY - SCRIPT SQL COMPLETO PARA SUPABASE
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase (https://app.supabase.com)
-- ==============================================================================

-- 1. Habilitar extensión para UUIDs automáticos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA: CATEGORÍAS (categories)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABLA: PRODUCTOS (products)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    previous_price NUMERIC(10, 2),
    sku TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    product_type TEXT DEFAULT 'product',
    gift_type TEXT DEFAULT 'fixed',
    availability_type TEXT DEFAULT 'ready_now',
    preparation_days INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 10,
    minimum_stock INTEGER DEFAULT 2,
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    available_for_rental BOOLEAN DEFAULT FALSE,
    rental_price NUMERIC(10, 2),
    rental_deposit NUMERIC(10, 2),
    rental_conditions TEXT,
    size TEXT,
    color TEXT,
    tags TEXT,
    variants JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABLA: IMÁGENES DE PRODUCTOS (product_images)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    position INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABLA: PERSONALIZADOR DE ARREGLOS (customizer_elements)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customizer_elements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00,
    image_url TEXT NOT NULL,
    available_colors JSONB DEFAULT '[]'::jsonb,
    default_color TEXT,
    active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 1,
    default_width INTEGER,
    default_height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABLA: INVENTARIO & INSUMOS DE PRODUCCIÓN (production_items)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.production_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Varios',
    unit TEXT DEFAULT 'unidades',
    current_quantity NUMERIC(10, 2) DEFAULT 0.00,
    minimum_quantity NUMERIC(10, 2) DEFAULT 5.00,
    unit_cost NUMERIC(10, 2) DEFAULT 0.00,
    supplier TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movimientos de inventario de producción
CREATE TABLE IF NOT EXISTS public.production_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.production_items(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. TABLA: ALQUILERES (rentals)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    customer_id UUID,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    quantity INTEGER DEFAULT 1,
    deposit NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'reserved',
    notes TEXT,
    order_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. TABLA: PEDIDOS Y RESERVAS (orders & order_items)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number BIGINT GENERATED ALWAYS AS IDENTITY,
    customer_id UUID,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT,
    desired_date DATE,
    delivery_method TEXT DEFAULT 'delivery',
    payment_method TEXT DEFAULT 'Yappy',
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'pending',
    subtotal NUMERIC(10, 2) DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID,
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2) DEFAULT 0.00,
    subtotal NUMERIC(10, 2) DEFAULT 0.00,
    product_snapshot JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. TABLA: CONFIGURACIÓN GENERAL (settings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT DEFAULT 'Bloomy Day',
    logo_url TEXT,
    instagram_url TEXT,
    whatsapp_number TEXT,
    phone_number TEXT,
    email TEXT,
    address TEXT,
    google_maps_url TEXT,
    opening_hours TEXT,
    currency TEXT DEFAULT 'USD',
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. POLÍTICAS DE ACCESO PÚBLICO (ROW LEVEL SECURITY - RLS)
-- Permite que la aplicación lea y guarde datos de forma instantánea sin bloqueos
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customizer_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas anteriores si existían y crear políticas abiertas
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
               AND tablename IN ('categories', 'products', 'product_images', 'customizer_elements', 
                                 'production_items', 'production_movements', 'rentals', 'orders', 
                                 'order_items', 'settings')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public full access on %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public full access on %I" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;
