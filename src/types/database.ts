export type ProductType = 'product' | 'rental' | 'both';
export type GiftType = 'fixed' | 'variable' | 'none';
export type AvailabilityType = 'ready_now' | 'reservation';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type RentalStatus = 'reserved' | 'active' | 'returned' | 'cancelled';
export type MovementType = 'entry' | 'exit';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  active: boolean;
  display_order?: number;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  position: 1 | 2 | 3 | 4;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Pequeño (12 Rosas)", "Mediano (24 Rosas)", "Grande (50 Rosas)", "Caja Imperial Deluxe"
  price: number; // e.g. 35.00, 55.00, 95.00
  sku?: string;
  stock?: number;
  is_default?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  previous_price?: number | null;
  sku: string;
  category_id: string;
  product_type: ProductType;
  gift_type: GiftType;
  availability_type?: AvailabilityType;
  preparation_days?: number;
  stock: number;
  minimum_stock: number;
  active: boolean;
  featured: boolean;
  is_new: boolean;
  available_for_rental: boolean;
  rental_price?: number | null;
  rental_deposit?: number | null;
  rental_conditions?: string | null;
  size?: string | null;
  color?: string | null;
  tags?: string[] | string | null;
  variants?: ProductVariant[];
  metadata?: Record<string, any> | null;
  created_at?: string;
  // Computed / joined fields
  images?: ProductImage[];
  category?: Category;
}

/**
 * Helper to safely retrieve variants from a product (supports relational variants or metadata.variants)
 */
export function getProductVariants(product?: Product | null): ProductVariant[] {
  if (!product) return [];
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }
  if (product.metadata && Array.isArray(product.metadata.variants) && product.metadata.variants.length > 0) {
    return product.metadata.variants;
  }
  return [];
}

/**
 * Returns min and max price range for products with multiple presentation/size options
 */
export function getProductPriceRange(product?: Product | null): { min: number; max: number; hasVariants: boolean } {
  if (!product) return { min: 0, max: 0, hasVariants: false };
  const vars = getProductVariants(product);
  if (vars.length > 1) {
    const prices = vars.map((v) => Number(v.price) || 0).filter((p) => p > 0);
    if (prices.length > 0) {
      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
        hasVariants: true,
      };
    }
  }
  const basePrice = product.available_for_rental && product.rental_price ? product.rental_price : product.price;
  return { min: basePrice, max: basePrice, hasVariants: false };
}

/**
 * Checks if a product is ready for immediate dispatch ("Para Ya").
 * Ready-now products are pre-crafted and sold as-is ("tal cual como está en la foto").
 */
export function isProductReadyNow(product?: Product | null): boolean {
  if (!product) return true;
  if (product.availability_type === 'reservation') return false;
  if (product.availability_type === 'ready_now') return true;
  return product.gift_type !== 'variable' && !product.available_for_rental;
}

/**
 * Checks if a product requires reservation ("Por Reserva").
 * Reservation products are crafted to order, customizable, and require minimum preparation time.
 */
export function isProductReservation(product?: Product | null): boolean {
  if (!product) return false;
  if (product.availability_type === 'reservation') return true;
  if (product.availability_type === 'ready_now') return false;
  return product.gift_type === 'variable' || product.available_for_rental;
}

/**
 * Returns minimum preparation days required for delivery.
 * For "ready_now": 0 days (can be delivered same day).
 * For "reservation": defaults to 3 days (or product.preparation_days).
 */
export function getProductMinDeliveryDays(product?: Product | null): number {
  if (!product) return 0;
  if (isProductReadyNow(product)) return 0;
  return product.preparation_days && product.preparation_days > 0 ? product.preparation_days : 3;
}

export interface ProductionItem {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  unit: string;
  current_quantity: number;
  minimum_quantity: number;
  cost: number;
  supplier?: string | null;
  status: 'available' | 'low_stock' | 'out_of_stock';
  created_at?: string;
}

export interface ProductProductionItem {
  id: string;
  product_id: string;
  production_item_id: string;
  quantity_required: number;
  item?: ProductionItem;
}

export interface ProductionMovement {
  id: string;
  item_id: string;
  movement_type: MovementType;
  quantity: number;
  reason: string;
  created_at: string;
  item_name?: string;
}

export interface Profile {
  id: string;
  role: 'admin' | 'customer';
  active: boolean;
  full_name?: string | null;
  email?: string | null;
  created_at?: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string | null;
  created_at?: string;
}

export interface GiftCustomization {
  balloonType?: string;
  balloonText?: string;
  vinylColor?: string;
  colorPalette?: string;
  ribbonType?: string;
  plushToy?: string;
  plushPrice?: number;
  extras?: { name: string; price: number }[];
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
  is_rental?: boolean;
  rental_start_date?: string;
  rental_end_date?: string;
  selected_variant?: string;
  dedication_message?: string;
  customization?: GiftCustomization;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_date: string;
  delivery_type: 'delivery' | 'pickup';
  payment_method: string;
  payment_status: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  total: number;
  notes?: string | null;
  receipt_url?: string | null;
  receipt_ref?: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface Rental {
  id: string;
  product_id: string;
  product_name?: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  start_date: string;
  end_date: string;
  quantity: number;
  deposit_amount: number;
  total_price: number;
  status: RentalStatus;
  notes?: string | null;
  created_at?: string;
  product?: Product;
}

export interface StoreSettings {
  id?: string;
  store_name: string;
  logo_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  hero_badge_image?: string;
  hero_badge_title?: string;
  instagram_url: string;
  whatsapp_number: string;
  phone: string;
  email: string;
  address: string;
  google_maps_url: string;
  schedule_hours: string;
  currency: string;
  delivery_fee: number;
  footer_photo_1?: string;
  footer_photo_2?: string;
  footer_photo_3?: string;
  footer_photo_4?: string;
  footer_caption_1?: string;
  footer_caption_2?: string;
  footer_caption_3?: string;
  footer_caption_4?: string;
}
