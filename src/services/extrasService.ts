import { OrderExtraItem, AVAILABLE_EXTRAS } from '../data/colonDelivery';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_EXTRAS_KEY = 'balloonsdei_custom_extras_v4';
const SETTINGS_ROW_ID = '75b13ef3-b885-462e-a110-f2fccbc47530';

function safeUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class ExtrasService {
  private cache: OrderExtraItem[] = [];
  private hasInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(LOCAL_EXTRAS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.cache = parsed;
        }
      }
    } catch (e) {
      this.cache = [];
    }

    // Trigger async sync in background
    this.syncFromSupabase().catch(() => {});
  }

  async syncFromSupabase(): Promise<OrderExtraItem[]> {
    if (!supabase || !isSupabaseConfigured) return this.cache;
    try {
      const { data: setRow, error } = await supabase
        .from('settings')
        .select('metadata')
        .eq('id', SETTINGS_ROW_ID)
        .maybeSingle();

      if (!error && setRow?.metadata?.custom_extras && Array.isArray(setRow.metadata.custom_extras)) {
        const remoteExtras = setRow.metadata.custom_extras as OrderExtraItem[];
        // Merge any locally added items not yet remote
        const missingLocals = this.cache.filter((loc) => !remoteExtras.some((rem) => rem.id === loc.id || rem.name === loc.name));
        this.cache = [...remoteExtras, ...missingLocals];
        this.saveToStorage(this.cache);
        return this.cache;
      }
    } catch (e) {
      console.warn('Error reading extras from Supabase:', e);
    }
    return this.cache;
  }

  private saveToStorage(items: OrderExtraItem[]) {
    try {
      localStorage.setItem(LOCAL_EXTRAS_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage quota warning in extras:', e);
    }
  }

  private async persistToSupabase(items: OrderExtraItem[]) {
    if (!supabase || !isSupabaseConfigured) return;
    try {
      const { data: setRow } = await supabase
        .from('settings')
        .select('metadata')
        .eq('id', SETTINGS_ROW_ID)
        .maybeSingle();

      const existingMeta = setRow?.metadata || {};
      const updatedMeta = {
        ...existingMeta,
        custom_extras: items,
      };

      await supabase
        .from('settings')
        .update({ metadata: updatedMeta })
        .eq('id', SETTINGS_ROW_ID);
    } catch (e) {
      console.error('Error persisting extras to Supabase settings metadata:', e);
    }
  }

  getExtras(): OrderExtraItem[] {
    if (!this.hasInitialized) {
      this.hasInitialized = true;
      this.syncFromSupabase();
    }
    return this.cache;
  }

  saveExtras(extras: OrderExtraItem[]) {
    this.cache = extras;
    this.saveToStorage(extras);
    this.persistToSupabase(extras);
  }

  addExtra(extra: Omit<OrderExtraItem, 'id'>): OrderExtraItem {
    const newExtra: OrderExtraItem = {
      ...extra,
      id: safeUuid(),
    };
    const updated = [...this.cache, newExtra];
    this.saveExtras(updated);
    return newExtra;
  }

  updateExtra(id: string, data: Partial<OrderExtraItem>): OrderExtraItem | null {
    const index = this.cache.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updatedItem = { ...this.cache[index], ...data };
    this.cache[index] = updatedItem;
    this.saveExtras([...this.cache]);
    return updatedItem;
  }

  deleteExtra(id: string): boolean {
    const filtered = this.cache.filter((item) => item.id !== id);
    this.saveExtras(filtered);
    return true;
  }

  resetToDefaults(): OrderExtraItem[] {
    this.saveExtras(AVAILABLE_EXTRAS);
    return AVAILABLE_EXTRAS;
  }
}

export const extrasService = new ExtrasService();
