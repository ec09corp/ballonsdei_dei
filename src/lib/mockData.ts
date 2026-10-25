import { Category, Product, ProductionItem, StoreSettings } from '../types/database';

export const INITIAL_SETTINGS: StoreSettings = {
  store_name: 'BALLOONSDEI',
  logo_url: '/logo/logo.jpg',
  hero_title: 'Detalles que hacen florecer cada momento',
  hero_subtitle: 'Obsequios personalizados, arreglos florales originales, globos de lujo y alquiler de mobiliario para celebraciones en toda la provincia de Colón.',
  hero_image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1800&q=80',
  hero_badge_image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
  hero_badge_title: 'Bouquets & Cajas Sombrereras',
  instagram_url: 'https://instagram.com/balloonsdei',
  whatsapp_number: '+507 6432-4750',
  phone: '+507 6432-4750',
  email: 'contacto@balloonsdei.com',
  address: 'BALLOONSDEI, Calle 11 y Ave. Central, Ciudad de Colón, Panamá',
  google_maps_url: 'https://www.google.com/maps/search/?api=1&query=BALLOONSDEI+Colon+Panama',
  schedule_hours: 'Lunes a Sábado: 8:30 AM – 6:30 PM | Domingos: 9:00 AM – 2:00 PM',
  currency: 'USD',
  delivery_fee: 4.00,
  footer_photo_1: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
  footer_photo_2: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
  footer_photo_3: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  footer_photo_4: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=600&q=80',
  footer_caption_1: 'Bouquets y arreglos personalizados para momentos inolvidables 🌸',
  footer_caption_2: 'Cajas sombrereras con detalles de lujo y rosas ✨',
  footer_caption_3: 'Montaje de Quinceaños y eventos con mobiliario exclusivo 💖',
  footer_caption_4: 'Detalles y regalos gigantes que sorprenden de verdad 🧸',
};

// Start in 0 as requested by the user, so they can add everything from the admin panel
export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PRODUCTION_ITEMS: ProductionItem[] = [];
