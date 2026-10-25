import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Category } from '../types/database';
import { INITIAL_CATEGORIES } from '../lib/mockData';

const LOCAL_CATEGORIES_KEY = 'balloonsdei_categories_clean_v4';

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local categories:', e);
  }
  return [];
}

function saveLocalCategories(cats: Category[]) {
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(cats));
  } catch (e) {
    console.error('Error saving local categories:', e);
  }
}

export const categoryService = {
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
          return data;
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

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: cat.name,
            slug,
            description: cat.description || null,
            image_url: cat.image_url || null,
            active: cat.active ?? true,
            display_order: cat.display_order || 99,
          })
          .select()
          .single();

        if (!error && data) return data;
      } catch (err) {
        console.error('Error creating category in Supabase:', err);
      }
    }

    const newCategory: Category = {
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

    const current = getLocalCategories();
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
          .single();

        if (!error && data) return data;
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
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.error('Error deleting category in Supabase:', err);
      }
    }

    const current = getLocalCategories();
    const filtered = current.filter((c) => c.id !== id);
    saveLocalCategories(filtered);
    return true;
  },
};
