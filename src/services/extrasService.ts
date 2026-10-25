import { OrderExtraItem, AVAILABLE_EXTRAS } from '../data/colonDelivery';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_EXTRAS_KEY = 'balloonsdei_custom_extras_v3';

export const extrasService = {
  getExtras(): OrderExtraItem[] {
    try {
      const raw = localStorage.getItem(LOCAL_EXTRAS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading local extras:', e);
    }
    return [];
  },

  saveExtras(extras: OrderExtraItem[]) {
    try {
      localStorage.setItem(LOCAL_EXTRAS_KEY, JSON.stringify(extras));
    } catch (e) {
      console.error('Error saving local extras:', e);
    }
  },

  addExtra(extra: Omit<OrderExtraItem, 'id'>): OrderExtraItem {
    const current = this.getExtras();
    const newExtra: OrderExtraItem = {
      ...extra,
      id: `extra-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...current, newExtra];
    this.saveExtras(updated);
    return newExtra;
  },

  updateExtra(id: string, data: Partial<OrderExtraItem>): OrderExtraItem | null {
    const current = this.getExtras();
    const index = current.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updatedItem = { ...current[index], ...data };
    current[index] = updatedItem;
    this.saveExtras(current);
    return updatedItem;
  },

  deleteExtra(id: string): boolean {
    const current = this.getExtras();
    const filtered = current.filter((item) => item.id !== id);
    this.saveExtras(filtered);
    return true;
  },

  resetToDefaults(): OrderExtraItem[] {
    this.saveExtras(AVAILABLE_EXTRAS);
    return AVAILABLE_EXTRAS;
  },
};
