import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProductionItem, ProductionMovement, ProductProductionItem, MovementType } from '../types/database';
import { INITIAL_PRODUCTION_ITEMS } from '../lib/mockData';

const LOCAL_PROD_ITEMS_KEY = 'ballonsdei_prod_items_v2';
const LOCAL_PROD_MOVEMENTS_KEY = 'ballonsdei_prod_movements_v2';
const LOCAL_PROD_RELATIONS_KEY = 'ballonsdei_prod_relations_v2';

function getLocalProductionItems(): ProductionItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROD_ITEMS_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local production items:', e);
  }
  return [];
}

function saveLocalProductionItems(items: ProductionItem[]) {
  try {
    localStorage.setItem(LOCAL_PROD_ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving local production items:', e);
  }
}

function getLocalMovements(): ProductionMovement[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROD_MOVEMENTS_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveLocalMovements(movs: ProductionMovement[]) {
  try {
    localStorage.setItem(LOCAL_PROD_MOVEMENTS_KEY, JSON.stringify(movs));
  } catch (e) {}
}

export const productionService = {
  async getItems(): Promise<ProductionItem[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('production_items')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data) {
          saveLocalProductionItems(data);
          return data;
        }
      } catch (err) {
        console.warn('Error fetching production items from Supabase, using local:', err);
      }
    }

    return getLocalProductionItems();
  },

  async createItem(item: Partial<ProductionItem>): Promise<ProductionItem | null> {
    const newId = `mat-${Date.now()}`;
    const status = (item.current_quantity ?? 0) <= 0
      ? 'out_of_stock'
      : (item.current_quantity ?? 0) <= (item.minimum_quantity ?? 5)
      ? 'low_stock'
      : 'available';

    const localItem: ProductionItem = {
      id: newId,
      name: item.name || 'Nuevo Insumo',
      description: item.description || null,
      category: item.category || 'Varios',
      unit: item.unit || 'unidades',
      current_quantity: item.current_quantity || 0,
      minimum_quantity: item.minimum_quantity || 5,
      cost: item.cost || 0,
      supplier: item.supplier || null,
      status,
      created_at: new Date().toISOString(),
    };

    const current = getLocalProductionItems();
    saveLocalProductionItems([...current, localItem]);

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('production_items')
          .insert({
            name: item.name,
            description: item.description || null,
            category: item.category || 'Varios',
            unit: item.unit || 'unidades',
            current_quantity: item.current_quantity || 0,
            minimum_quantity: item.minimum_quantity || 5,
            cost: item.cost || 0,
            supplier: item.supplier || null,
            status,
          })
          .select()
          .single();

        if (!error && data) {
          const fresh = getLocalProductionItems().map((i) => i.id === newId ? data : i);
          saveLocalProductionItems(fresh);
          return data;
        }
      } catch (err) {
        console.error('Error creating production item in Supabase:', err);
      }
    }

    return localItem;
  },

  async updateItem(id: string, updates: Partial<ProductionItem>): Promise<ProductionItem | null> {
    const current = getLocalProductionItems();
    const updated = current.map((it) => {
      if (it.id === id) {
        const merged = { ...it, ...updates };
        merged.status = merged.current_quantity <= 0
          ? 'out_of_stock'
          : merged.current_quantity <= merged.minimum_quantity
          ? 'low_stock'
          : 'available';
        return merged;
      }
      return it;
    });

    saveLocalProductionItems(updated);

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('production_items')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const fresh = getLocalProductionItems().map((i) => i.id === id ? data : i);
          saveLocalProductionItems(fresh);
          return data;
        }
      } catch (err) {
        console.error('Error updating production item in Supabase:', err);
      }
    }

    return updated.find((it) => it.id === id) || null;
  },

  async deleteItem(id: string): Promise<boolean> {
    const current = getLocalProductionItems();
    const filtered = current.filter((it) => it.id !== id);
    saveLocalProductionItems(filtered);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('production_movements').delete().eq('item_id', id);
        await supabase.from('product_production_items').delete().eq('production_item_id', id);
        const { error } = await supabase.from('production_items').delete().eq('id', id);
        if (error) console.error('Error deleting production item in Supabase:', error);
      } catch (err) {
        console.error('Error deleting production item in Supabase:', err);
      }
    }

    return true;
  },

  async recordMovement(
    itemId: string,
    type: MovementType,
    quantity: number,
    reason: string
  ): Promise<boolean> {
    const items = await this.getItems();
    const target = items.find((i) => i.id === itemId);
    if (!target) return false;

    const newQuantity =
      type === 'entry'
        ? target.current_quantity + quantity
        : Math.max(0, target.current_quantity - quantity);

    const status =
      newQuantity <= 0
        ? 'out_of_stock'
        : newQuantity <= target.minimum_quantity
        ? 'low_stock'
        : 'available';

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('production_movements')
          .insert({
            item_id: itemId,
            movement_type: type,
            quantity,
            reason,
          });

        await supabase
          .from('production_items')
          .update({ current_quantity: newQuantity, status })
          .eq('id', itemId);

        return true;
      } catch (err) {
        console.error('Error recording movement in Supabase:', err);
      }
    }

    // Local movement update
    await this.updateItem(itemId, { current_quantity: newQuantity, status });
    const currentMovs = getLocalMovements();
    const newMovement: ProductionMovement = {
      id: `mov-${Date.now()}`,
      item_id: itemId,
      item_name: target.name,
      movement_type: type,
      quantity,
      reason,
      created_at: new Date().toISOString(),
    };
    saveLocalMovements([newMovement, ...currentMovs]);
    return true;
  },

  async getMovements(): Promise<ProductionMovement[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('production_movements')
          .select(`
            *,
            item:production_items(name)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            ...d,
            item_name: d.item?.name || 'Insumo',
          }));
        }
      } catch (err) {
        console.warn('Error fetching movements from Supabase:', err);
      }
    }

    return getLocalMovements();
  },

  async getProductMaterials(productId: string): Promise<ProductProductionItem[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('product_production_items')
          .select(`
            *,
            item:production_items(*)
          `)
          .eq('product_id', productId);

        if (data) return data;
      } catch (err) {}
    }

    try {
      const raw = localStorage.getItem(LOCAL_PROD_RELATIONS_KEY);
      if (raw) {
        const all: ProductProductionItem[] = JSON.parse(raw);
        return all.filter((r) => r.product_id === productId);
      }
    } catch (e) {}

    return [];
  },

  async setProductMaterials(
    productId: string,
    materials: { production_item_id: string; quantity_required: number }[]
  ): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('product_production_items')
          .delete()
          .eq('product_id', productId);

        if (materials.length > 0) {
          await supabase.from('product_production_items').insert(
            materials.map((m) => ({
              product_id: productId,
              production_item_id: m.production_item_id,
              quantity_required: m.quantity_required,
            }))
          );
        }
        return true;
      } catch (err) {
        console.error('Error saving product materials in Supabase:', err);
      }
    }

    try {
      const raw = localStorage.getItem(LOCAL_PROD_RELATIONS_KEY);
      let all: ProductProductionItem[] = raw ? JSON.parse(raw) : [];
      all = all.filter((r) => r.product_id !== productId);
      const newItems: ProductProductionItem[] = materials.map((m, idx) => ({
        id: `rel-${productId}-${idx}`,
        product_id: productId,
        production_item_id: m.production_item_id,
        quantity_required: m.quantity_required,
      }));
      localStorage.setItem(LOCAL_PROD_RELATIONS_KEY, JSON.stringify([...all, ...newItems]));
      return true;
    } catch (e) {
      return false;
    }
  },

  async deleteAllItems(): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('production_movements').delete().neq('id', 'placeholder');
        await supabase.from('product_production_items').delete().neq('id', 'placeholder');
        await supabase.from('production_items').delete().neq('id', 'placeholder');
      } catch (err) {
        console.warn('Error clearing items in Supabase:', err);
      }
    }
    saveLocalProductionItems([]);
    saveLocalMovements([]);
    return true;
  },
};
