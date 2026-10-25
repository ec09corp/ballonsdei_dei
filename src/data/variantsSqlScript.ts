/**
 * Script SQL para Supabase (PostgreSQL) para soporte completo de Variantes y Opciones con Precios.
 * Ejecutar en el SQL Editor de Supabase: https://supabase.com/dashboard/project/_/sql
 */
export const SUPABASE_VARIANTS_SQL = `-- ==============================================================================
-- BALLONSDEI: TABLA Y COLUMNAS PARA VARIANTES / OPCIONES CON PRECIOS
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ==============================================================================

-- 1. Habilitar extensión pgcrypto para generación de UUID si no está activa
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Agregar columna 'variants' en formato JSONB a la tabla products si no existe
ALTER TABLE IF EXISTS products 
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- 3. Columnas de metadatos y disponibilidad en products
ALTER TABLE IF EXISTS products 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS products 
ADD COLUMN IF NOT EXISTS availability_type TEXT DEFAULT 'ready_now';

ALTER TABLE IF EXISTS products 
ADD COLUMN IF NOT EXISTS preparation_days INTEGER DEFAULT 0;

-- 4. Limpiar tabla previa si existió con tipos incompatibles
DROP TABLE IF EXISTS product_variants CASCADE;

-- 5. Crear tabla relacional 'product_variants' con product_id de tipo UUID (igual a products.id)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  sku TEXT,
  stock INTEGER DEFAULT 10,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Índice para búsquedas veloces por producto
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id 
ON product_variants(product_id);

-- 7. Habilitar Seguridad a Nivel de Fila (Row Level Security)
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de acceso (Permitir lectura y modificación para anon y autenticados)
DROP POLICY IF EXISTS "Lectura pública de variantes de producto" ON product_variants;
CREATE POLICY "Lectura pública de variantes de producto" 
ON product_variants FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Gestión completa de variantes de producto" ON product_variants;
CREATE POLICY "Gestión completa de variantes de producto" 
ON product_variants FOR ALL 
USING (true) 
WITH CHECK (true);

-- 9. Otorgar permisos a los roles de Supabase (evita el error 42501 Permission Denied)
GRANT ALL ON product_variants TO anon;
GRANT ALL ON product_variants TO authenticated;
GRANT ALL ON product_variants TO service_role;

GRANT ALL ON products TO anon;
GRANT ALL ON products TO authenticated;
GRANT ALL ON products TO service_role;

-- 10. Confirmación
COMMENT ON TABLE product_variants IS 'Variantes, tamaños y opciones con precios diferenciados para productos de Ballonsdei';
`;
