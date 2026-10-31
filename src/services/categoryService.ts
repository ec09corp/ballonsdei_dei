import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Category } from '../types/database';
import { INITIAL_CATEGORIES } from '../lib/mockData';
import { processImageFile, dataUrlToBlob } from '../lib/imageUtils';

const LOCAL_CATEGORIES_KEY = 'balloonsdei_categories_clean_v5';

// Purge old mock/demo storage keys once on load
if (typeof window !== 'undefined') {
  try {
    ['balloonsdei_categories_clean_v4', 'balloonsdei_categories_v3', 'balloonsdei_categories'].forEach((k) => {
      if (localStorage.getItem(k) !== null) {
        localStorage.removeItem(k);
      }
    });
  } catch {}
}

function notifyDataUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('balloonsdei_data_updated'));
  }
}

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading local categories:', e);
  }
  return [];
}

function saveLocalCategories(cats: Category[], notify: boolean = true) {
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(cats));
    if (notify) {
      notifyDataUpdate();
    }
  } catch (e) {
    console.error('Error saving local categories:', e);
  }
}

export const categoryService = {
  async uploadCategoryImage(file: File, categoryId?: string): Promise<string> {
    // Compress image to compact web-safe Data URL (persists in DB/storage, works instantly on mobile/desktop)
    let fallbackDataUrl = '';
    try {
      fallbackDataUrl = await processImageFile(file, 850, 0.8);
    } catch {
      fallbackDataUrl = '';
    }

    if (supabase && isSupabaseConfigured) {
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const cleanId = (categoryId || 'cat').replace(/[^a-zA-Z0-9_-]/g, '');
        const filePath = `categories/category-${cleanId}-${Date.now()}.${ext}`;

        const uploadBlob = fallbackDataUrl ? dataUrlToBlob(fallbackDataUrl) : file;

        const uploadPromise = supabase.storage
          .from('product-images')
          .upload(filePath, uploadBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true,
          });

        const timeoutPromise = new Promise<{ error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('Storage timeout')), 4000)
        );

        const { error: uploadError } = await (Promise.race([uploadPromise, timeoutPromise]) as any);

        if (!uploadError) {
          const { data: pubData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          if (pubData?.publicUrl) {
            return pubData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Notice uploading category image to Supabase storage, using resilient Data URL:', err);
      }
    }

    return fallbackDataUrl;
  },

  async getCategories(activeOnly: boolean = false): Promise<Category[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        let query = supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (activeOnly) {
          query = query.eq('active', true);
        }

        const { data, error } = await query;
        if (!error && data) {
          const dbCats = data as Category[];
          const localCats = getLocalCategories();
          // Merge so any freshly created category never disappears
          const localOnly = localCats.filter((lc) => !dbCats.some((dc) => dc.id === lc.id));
          const allCats = [...dbCats, ...localOnly].sort(
            (a, b) => (a.display_order || 99) - (b.display_order || 99)
          );
          saveLocalCategories(allCats, false);
          return activeOnly ? allCats.filter((c) => c.active) : allCats;
        }
      } catch (err) {
        console.warn('Error querying categories in Supabase, using local:', err);
      }
    }

    let cats = getLocalCategories();
    if (activeOnly) {
      cats = cats.filter((c) => c.active);
    }
    return cats.sort((a, b) => (a.display_order || 99) - (b.display_order || 99));
  },

  async createCategory(cat: Partial<Category>): Promise<Category | null> {
    const slug =
      cat.slug ||
      (cat.name || 'categoria')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newId = `cat-${Date.now()}`;
    let createdInDb: Category | null = null;

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            id: newId,
            name: cat.name,
            slug,
            description: cat.description || null,
            image_url: cat.image_url || null,
            active: cat.active ?? true,
            display_order: cat.display_order || 99,
          })
          .select()
          .maybeSingle();

        if (!error && data) {
          createdInDb = data;
        }
      } catch (err) {
        console.error('Error creating category in Supabase:', err);
      }
    }

    const newCategory: Category = createdInDb || {
      id: newId,
      name: cat.name || 'Nueva Categoría',
      slug,
      description: cat.description || null,
      image_url:
        cat.image_url ||
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      active: cat.active ?? true,
      display_order: cat.display_order || 99,
    };

    const current = getLocalCategories().filter((c) => c.id !== newCategory.id);
    const updated = [...current, newCategory];
    saveLocalCategories(updated);
    return newCategory;
  },

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category | null> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .update(cat)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && data) {
          // Keep in local
          const current = getLocalCategories();
          const updated = current.map((c) => (c.id === id ? { ...c, ...data } : c));
          saveLocalCategories(updated);
          return data;
        }
      } catch (err) {
        console.error('Error updating category in Supabase:', err);
      }
    }

    const current = getLocalCategories();
    const updated = current.map((c) => (c.id === id ? { ...c, ...cat } : c));
    saveLocalCategories(updated);
    return updated.find((c) => c.id === id) || null;
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        // Disassociate products from this category first so no FK violation occurs
        await supabase.from('products').update({ category_id: null }).eq('category_id', id);
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) console.error('Error deleting category in Supabase:', error);
      } catch (err) {
        console.error('Error deleting category in Supabase:', err);
      }
    }

    const current = getLocalCategories();
    const filtered = current.filter((c) => c.id !== id);
    saveLocalCategories(filtered);
    return true;
  },

  async deleteAllCategories(): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('products').update({ category_id: null }).neq('id', 'placeholder');
        await supabase.from('categories').delete().neq('id', 'placeholder');
      } catch (err) {
        console.warn('Error clearing categories in Supabase:', err);
      }
    }
    saveLocalCategories([]);
    return true;
  },
};

