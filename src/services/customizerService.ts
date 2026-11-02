import { CustomizerElementItem, ArrangementDesignData } from '../types/customizer';
import { DEFAULT_CUSTOMIZER_ELEMENTS } from '../data/defaultCustomizerElements';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'ballonsdei_customizer_elements_v2';
const DESIGNS_STORAGE_KEY = 'ballonsdei_customizer_designs_v1';
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

class CustomizerService {
  private localElements: CustomizerElementItem[] = [];

  constructor() {
    this.initLocal();
  }

  private initLocal() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        this.localElements = JSON.parse(stored);
      } else {
        this.localElements = [...DEFAULT_CUSTOMIZER_ELEMENTS];
      }
    } catch {
      this.localElements = [...DEFAULT_CUSTOMIZER_ELEMENTS];
    }
  }

  private persistLocal() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localElements));
    } catch (e) {
      console.warn('Quota warning for customizer elements, trimming images:', e);
      try {
        const slim = this.localElements.map((el) => ({
          ...el,
          image_url: el.image_url?.length > 400 ? el.image_url.slice(0, 200) + '...' : el.image_url,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
      } catch (err2) {
        console.error('Failed to save even slim customizer elements:', err2);
      }
    }
  }

  async getElements(category?: string, activeOnly = true): Promise<CustomizerElementItem[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        let query = supabase
          .from('customizer_elements')
          .select('*')
          .order('order_index', { ascending: true });

        if (activeOnly) {
          query = query.eq('active', true);
        }
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          // Merge with any local elements not yet present in Supabase
          const remoteList = data as CustomizerElementItem[];
          const missingLocals = this.localElements.filter(
            (local) => !remoteList.some((rem) => rem.id === local.id || rem.name === local.name)
          );
          const merged = [...remoteList, ...missingLocals];
          if (!category || category === 'all') {
            this.localElements = merged;
            this.persistLocal();
          }
          return merged;
        }

        // Check fallback in settings.metadata
        const { data: setRow } = await supabase
          .from('settings')
          .select('metadata')
          .eq('id', SETTINGS_ROW_ID)
          .maybeSingle();

        if (setRow?.metadata?.customizer_elements && Array.isArray(setRow.metadata.customizer_elements)) {
          const metaList = setRow.metadata.customizer_elements as CustomizerElementItem[];
          if (metaList.length > 0) {
            this.localElements = metaList;
            this.persistLocal();
            let res = [...metaList];
            if (activeOnly) res = res.filter((e) => e.active);
            if (category && category !== 'all') res = res.filter((e) => e.category === category);
            return res;
          }
        }
      } catch (err) {
        console.warn('Error fetching customizer elements from Supabase:', err);
      }
    }

    // Local fallback
    let list = [...this.localElements];
    if (list.length === 0) {
      list = [...DEFAULT_CUSTOMIZER_ELEMENTS];
      this.localElements = list;
      this.persistLocal();
    }
    if (activeOnly) {
      list = list.filter((i) => i.active);
    }
    if (category && category !== 'all') {
      list = list.filter((i) => i.category === category);
    }
    return list.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }

  async addElement(item: Omit<CustomizerElementItem, 'id' | 'created_at'>): Promise<CustomizerElementItem> {
    const newId = safeUuid();
    const finalImageUrl = item.image_url?.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80';

    const newItem: CustomizerElementItem = {
      ...item,
      id: newId,
      image_url: finalImageUrl,
      created_at: new Date().toISOString(),
      order_index: item.order_index ?? this.localElements.length + 1,
    };

    this.localElements.push(newItem);
    this.persistLocal();

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('customizer_elements')
          .insert({
            id: newId,
            name: newItem.name,
            category: newItem.category,
            price: newItem.price || 0,
            image_url: finalImageUrl,
            available_colors: newItem.available_colors || [],
            default_color: newItem.default_color || null,
            active: newItem.active ?? true,
            order_index: newItem.order_index || 1,
          })
          .select()
          .maybeSingle();

        if (!error && data) {
          const idx = this.localElements.findIndex((e) => e.id === newId);
          if (idx !== -1) {
            this.localElements[idx] = data as CustomizerElementItem;
            this.persistLocal();
          }
          return data as CustomizerElementItem;
        } else if (error) {
          console.warn('Supabase customizer_elements insert note, updating metadata:', error.message);
          await this.syncToSettingsMetadata();
        }
      } catch (err) {
        console.error('Error inserting customizer element into Supabase:', err);
        await this.syncToSettingsMetadata();
      }
    }

    return newItem;
  }

  async updateElement(id: string, updates: Partial<CustomizerElementItem>): Promise<CustomizerElementItem | null> {
    const idx = this.localElements.findIndex((e) => e.id === id);
    if (idx > -1) {
      this.localElements[idx] = { ...this.localElements[idx], ...updates };
      this.persistLocal();
    }

    if (supabase && isSupabaseConfigured) {
      try {
        const payload: any = { ...updates };
        delete payload.id;
        delete payload.created_at;

        const { data, error } = await supabase
          .from('customizer_elements')
          .update(payload)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && data) {
          if (idx > -1) {
            this.localElements[idx] = data as CustomizerElementItem;
            this.persistLocal();
          }
          return data as CustomizerElementItem;
        } else {
          await this.syncToSettingsMetadata();
        }
      } catch (err) {
        console.error('Error updating customizer element in Supabase:', err);
        await this.syncToSettingsMetadata();
      }
    }

    return idx > -1 ? this.localElements[idx] : null;
  }

  async deleteElement(id: string): Promise<boolean> {
    this.localElements = this.localElements.filter((e) => e.id !== id);
    this.persistLocal();

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('customizer_elements').delete().eq('id', id);
        await this.syncToSettingsMetadata();
      } catch (err) {
        console.error('Error in deleteElement:', err);
        await this.syncToSettingsMetadata();
      }
    }

    return true;
  }

  async deleteAllElements(): Promise<boolean> {
    this.localElements = [];
    this.persistLocal();

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('customizer_elements').delete().neq('id', 'keep-all-placeholder');
        await this.syncToSettingsMetadata();
      } catch (err) {
        console.error('Error deleting all customizer elements in Supabase:', err);
      }
    }

    return true;
  }

  async resetToDefaults(): Promise<CustomizerElementItem[]> {
    this.localElements = [...DEFAULT_CUSTOMIZER_ELEMENTS];
    this.persistLocal();

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('customizer_elements').delete().neq('id', 'keep-all-placeholder');
        for (const el of DEFAULT_CUSTOMIZER_ELEMENTS) {
          await supabase.from('customizer_elements').insert({
            id: safeUuid(),
            name: el.name,
            category: el.category,
            price: el.price || 0,
            image_url: el.image_url,
            available_colors: el.available_colors || [],
            default_color: el.default_color || null,
            active: el.active ?? true,
            order_index: el.order_index || 1,
          });
        }
        await this.syncToSettingsMetadata();
      } catch (err) {
        console.warn('Error resetting defaults in Supabase:', err);
        await this.syncToSettingsMetadata();
      }
    }

    return this.localElements;
  }

  private async syncToSettingsMetadata() {
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
        customizer_elements: this.localElements.map((el) => ({
          ...el,
          image_url: el.image_url?.startsWith('data:') ? el.image_url.slice(0, 500) : el.image_url,
        })),
      };

      await supabase
        .from('settings')
        .update({ metadata: updatedMeta })
        .eq('id', SETTINGS_ROW_ID);
    } catch (e) {
      console.warn('Error syncing customizer elements to settings metadata:', e);
    }
  }

  async saveDesign(design: ArrangementDesignData): Promise<string> {
    const designId = `design-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      const stored = localStorage.getItem(DESIGNS_STORAGE_KEY);
      const all = stored ? JSON.parse(stored) : {};
      all[designId] = { ...design, id: designId, createdAt: new Date().toISOString() };
      localStorage.setItem(DESIGNS_STORAGE_KEY, JSON.stringify(all));
    } catch {}

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('custom_designs').insert({
          id: designId,
          product_id: design.productId,
          design_data: design,
          preview_image: design.previewImage?.slice(0, 500),
          total_price: design.totalPrice,
          created_at: new Date().toISOString(),
        });
      } catch {}
    }

    return designId;
  }

  getDesign(designId: string): ArrangementDesignData | null {
    try {
      const stored = localStorage.getItem(DESIGNS_STORAGE_KEY);
      if (stored) {
        const all = JSON.parse(stored);
        return all[designId] || null;
      }
    } catch {}
    return null;
  }
}

export const customizerService = new CustomizerService();
