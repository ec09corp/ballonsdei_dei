import { CustomizerElementItem, ArrangementDesignData } from '../types/customizer';
import { DEFAULT_CUSTOMIZER_ELEMENTS } from '../data/defaultCustomizerElements';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'ballonsdei_customizer_elements_v1';
const DESIGNS_STORAGE_KEY = 'ballonsdei_customizer_designs_v1';

class CustomizerService {
  private localElements: CustomizerElementItem[] = [];

  constructor() {
    this.initLocal();
  }

  private initLocal() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const hasOldPhotos = Array.isArray(parsed) && parsed.some((p: any) => p.image_url && p.image_url.includes('unsplash.com'));
        if (hasOldPhotos) {
          this.localElements = [...DEFAULT_CUSTOMIZER_ELEMENTS];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localElements));
        } else {
          this.localElements = parsed;
        }
      } else {
        this.localElements = [...DEFAULT_CUSTOMIZER_ELEMENTS];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localElements));
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
      console.warn('Error saving local elements:', e);
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
        if (!error && data && data.length > 0) {
          return data as CustomizerElementItem[];
        }
      } catch (err) {
        // Fallback to local
      }
    }

    // Local fallback
    let list = [...this.localElements];
    if (activeOnly) {
      list = list.filter((i) => i.active);
    }
    if (category && category !== 'all') {
      list = list.filter((i) => i.category === category);
    }
    return list.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }

  async addElement(item: Omit<CustomizerElementItem, 'id' | 'created_at'>): Promise<CustomizerElementItem> {
    const newItem: CustomizerElementItem = {
      ...item,
      id: `elem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      order_index: item.order_index ?? this.localElements.length + 1,
    };

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('customizer_elements')
          .insert(newItem)
          .select()
          .maybeSingle();

        if (!error && data) {
          this.localElements.push(data as CustomizerElementItem);
          this.persistLocal();
          return data as CustomizerElementItem;
        }
      } catch (err) {
        // Fallback to local
      }
    }

    this.localElements.push(newItem);
    this.persistLocal();
    return newItem;
  }

  async updateElement(id: string, updates: Partial<CustomizerElementItem>): Promise<CustomizerElementItem | null> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('customizer_elements')
          .update(updates)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && data) {
          const idx = this.localElements.findIndex((e) => e.id === id);
          if (idx > -1) {
            this.localElements[idx] = data as CustomizerElementItem;
            this.persistLocal();
          }
          return data as CustomizerElementItem;
        }
      } catch (err) {
        // fallback
      }
    }

    const idx = this.localElements.findIndex((e) => e.id === id);
    if (idx > -1) {
      this.localElements[idx] = { ...this.localElements[idx], ...updates };
      this.persistLocal();
      return this.localElements[idx];
    }
    return null;
  }

  async deleteElement(id: string): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('customizer_elements').delete().eq('id', id);
      } catch {}
    }

    this.localElements = this.localElements.filter((e) => e.id !== id);
    this.persistLocal();
    return true;
  }

  async resetToDefaults(): Promise<CustomizerElementItem[]> {
    this.localElements = [...DEFAULT_CUSTOMIZER_ELEMENTS];
    this.persistLocal();

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('customizer_elements').delete().neq('id', 'keep-all');
        await supabase.from('customizer_elements').insert(DEFAULT_CUSTOMIZER_ELEMENTS);
      } catch {}
    }

    return this.localElements;
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
          preview_image: design.previewImage,
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
