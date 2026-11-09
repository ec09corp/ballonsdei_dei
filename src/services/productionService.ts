import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProductionItem, ProductionMovement, ProductProductionItem, MovementType } from '../types/database';

const LOCAL_PROD_ITEMS_KEY = 'ballonsdei_prod_items_v3';
const LOCAL_PROD_MOVEMENTS_KEY = 'ballonsdei_prod_movements_v3';
const LOCAL_PROD_RELATIONS_KEY = 'ballonsdei_prod_relations_v3';
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

function calculateStatus(curr: number, min: number): 'available' | 'low_stock' | 'out_of_stock' {
  if (curr <= 0) return 'out_of_stock';
  if (curr <= min) return 'low_stock';
  return 'available';
}

function getLocalProductionItems(): ProductionItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROD_ITEMS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading local production items:', e);
  }
  return [];
}

function saveLocalProductionItems(items: ProductionItem[]) {
  try {
    localStorage.setItem(LOCAL_PROD_ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Quota error saving local production items, slimming entries:', e);
    try {
      const slim = items.map((it) => ({
        ...it,
        description: it.description?.slice(0, 80) || null,
      }));
      localStorage.setItem(LOCAL_PROD_ITEMS_KEY, JSON.stringify(slim));
    } catch (err2) {
      console.error('Could not save production items locally:', err2);
    }
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
    localStorage.setItem(LOCAL_PROD_MOVEMENTS_KEY, JSON.stringify(movs.slice(0, 100)));
  } catch (e) {}
}

export const productionService = {
  async getItems(): Promise<ProductionItem[]> {
    const local = getLocalProductionItems();

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('production_items')
          .select('*')
          .order('name', { ascending: true });

        if (!error && Array.isArray(data)) {
          const mapped: ProductionItem[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description || null,
            category: d.category || 'Varios',
            unit: d.unit || 'unidades',
            current_quantity: Number(d.current_quantity) || 0,
            minimum_quantity: Number(d.minimum_quantity) || 0,
            cost: Number(d.unit_cost ?? d.cost) || 0,
            supplier: d.supplier || null,
            status: calculateStatus(Number(d.current_quantity) || 0, Number(d.minimum_quantity) || 0),
            created_at: d.created_at,
          }));

          // Merge any newly added local items not yet in remote
          const missingLocals = local.filter((loc) => !mapped.some((rem) => rem.id === loc.id || rem.name === loc.name));
          const finalItems = [...mapped, ...missingLocals];
          saveLocalProductionItems(finalItems);
          return finalItems;
        }

        // Check metadata backup
        const { data: setRow } = await supabase
          .from('settings')
          .select('metadata')
          .eq('id', SETTINGS_ROW_ID)
          .maybeSingle();

        if (setRow?.metadata?.production_items && Array.isArray(setRow.metadata.production_items)) {
          const metaItems = setRow.metadata.production_items as ProductionItem[];
          if (metaItems.length > 0) {
            saveLocalProductionItems(metaItems);
            return metaItems;
          }
        }
      } catch (err) {
        console.warn('Error fetching production items from Supabase, using local:', err);
      }
    }

    return local;
  },

  async createItem(item: Partial<ProductionItem>): Promise<ProductionItem | null> {
    const newId = safeUuid();
    const curr = Number(item.current_quantity ?? 0);
    const min = Number(item.minimum_quantity ?? 5);
    const cost = Number(item.cost ?? 0);
    const status = calculateStatus(curr, min);

    const localItem: ProductionItem = {
      id: newId,
      name: item.name || 'Nuevo Insumo',
      description: item.description || null,
      category: item.category || 'Varios',
      unit: item.unit || 'unidades',
      current_quantity: curr,
      minimum_quantity: min,
      cost,
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
            id: newId,
            name: localItem.name,
            description: localItem.description,
            category: localItem.category,
            unit: localItem.unit,
            current_quantity: localItem.current_quantity,
            minimum_quantity: localItem.minimum_quantity,
            unit_cost: cost,
            supplier: localItem.supplier,
            active: true,
          })
          .select()
          .single();

        if (!error && data) {
          const freshItem: ProductionItem = {
            id: data.id,
            name: data.name,
            description: data.description,
            category: data.category,
            unit: data.unit,
            current_quantity: Number(data.current_quantity) || 0,
            minimum_quantity: Number(data.minimum_quantity) || 0,
            cost: Number(data.unit_cost) || 0,
            supplier: data.supplier,
            status: calculateStatus(Number(data.current_quantity) || 0, Number(data.minimum_quantity) || 0),
            created_at: data.created_at,
          };
          const fresh = getLocalProductionItems().map((i) => (i.id === newId ? freshItem : i));
          saveLocalProductionItems(fresh);
          await this.syncToMetadata();
          return freshItem;
        } else if (error) {
          console.warn('Production insert note, syncing to metadata:', error.message);
          await this.syncToMetadata();
        }
      } catch (err) {
        console.error('Error creating production item in Supabase:', err);
        await this.syncToMetadata();
      }
    }

    return localItem;
  },

  async updateItem(id: string, updates: Partial<ProductionItem>): Promise<ProductionItem | null> {
    const current = getLocalProductionItems();
    let updatedTarget: ProductionItem | null = null;

    const updated = current.map((it) => {
      if (it.id === id) {
        const merged = { ...it, ...updates };
        merged.status = calculateStatus(merged.current_quantity, merged.minimum_quantity);
        updatedTarget = merged;
        return merged;
      }
      return it;
    });

    saveLocalProductionItems(updated);

    if (supabase && isSupabaseConfigured) {
      try {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.unit !== undefined) payload.unit = updates.unit;
        if (updates.current_quantity !== undefined) payload.current_quantity = Number(updates.current_quantity);
        if (updates.minimum_quantity !== undefined) payload.minimum_quantity = Number(updates.minimum_quantity);
        if (updates.cost !== undefined) payload.unit_cost = Number(updates.cost);
        if (updates.supplier !== undefined) payload.supplier = updates.supplier;

        const { data, error } = await supabase
          .from('production_items')
          .update(payload)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && data) {
          const freshItem: ProductionItem = {
            id: data.id,
            name: data.name,
            description: data.description,
            category: data.category,
            unit: data.unit,
            current_quantity: Number(data.current_quantity) || 0,
            minimum_quantity: Number(data.minimum_quantity) || 0,
            cost: Number(data.unit_cost) || 0,
            supplier: data.supplier,
            status: calculateStatus(Number(data.current_quantity) || 0, Number(data.minimum_quantity) || 0),
            created_at: data.created_at,
          };
          const fresh = getLocalProductionItems().map((i) => (i.id === id ? freshItem : i));
          saveLocalProductionItems(fresh);
          await this.syncToMetadata();
          return freshItem;
        } else {
          await this.syncToMetadata();
        }
      } catch (err) {
        console.error('Error updating production item in Supabase:', err);
        await this.syncToMetadata();
      }
    }

    return updatedTarget;
  },

  async deleteItem(id: string): Promise<boolean> {
    const current = getLocalProductionItems();
    const filtered = current.filter((it) => it.id !== id);
    saveLocalProductionItems(filtered);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('production_items').delete().eq('id', id);
        await this.syncToMetadata();
      } catch (err) {
        console.error('Error deleting production item in Supabase:', err);
        await this.syncToMetadata();
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

    const status = calculateStatus(newQuantity, target.minimum_quantity);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('production_items')
          .update({ current_quantity: newQuantity })
          .eq('id', itemId);
      } catch (err) {
        console.error('Error updating quantity in Supabase:', err);
      }
    }

    // Local movement update
    await this.updateItem(itemId, { current_quantity: newQuantity, status });
    const newMovement: ProductionMovement = {
      id: `mov-${Date.now()}`,
      item_id: itemId,
      item_name: target.name,
      movement_type: type,
      quantity,
      reason,
      created_at: new Date().toISOString(),
    };

    // Historial en Supabase (antes solo quedaba en este navegador)
    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('production_movements')
        .insert({
          production_item_id: itemId,
          movement_type: type,
          quantity,
          reason: reason || null,
        })
        .select('id, created_at')
        .maybeSingle();
      if (error) {
        console.error('Error guardando el movimiento en Supabase:', error.message);
        throw new Error('La cantidad se actualizó, pero el historial no se pudo guardar: ' + error.message);
      }
      if (data) {
        newMovement.id = data.id;
        newMovement.created_at = data.created_at;
      }
    }

    const currentMovs = getLocalMovements();
    saveLocalMovements([newMovement, ...currentMovs]);
    return true;
  },

  async getMovements(): Promise<ProductionMovement[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('production_movements')
          .select('id, production_item_id, movement_type, quantity, reason, created_at, item:production_items(name)')
          .order('created_at', { ascending: false })
          .limit(200);
        if (!error && data) {
          const movs: ProductionMovement[] = data.map((m: any) => ({
            id: m.id,
            item_id: m.production_item_id,
            item_name: m.item?.name || '',
            movement_type: m.movement_type,
            quantity: Number(m.quantity) || 0,
            reason: m.reason || '',
            created_at: m.created_at,
          }));
          saveLocalMovements(movs);
          return movs;
        }
      } catch (err) {
        console.warn('Error leyendo movimientos de Supabase, usando copia local:', err);
      }
    }
    return getLocalMovements();
  },

  async getProductMaterials(productId: string): Promise<ProductProductionItem[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('product_production_items')
          .select('id, product_id, production_item_id, quantity_required')
          .eq('product_id', productId);
        if (!error && data) {
          return data.map((r: any) => ({ ...r, quantity_required: Number(r.quantity_required) || 0 }));
        }
      } catch (err) {
        console.warn('Error leyendo receta de Supabase, usando copia local:', err);
      }
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
    // Receta en Supabase (antes solo quedaba en este navegador)
    if (supabase && isSupabaseConfigured) {
      const { error: delErr } = await supabase
        .from('product_production_items')
        .delete()
        .eq('product_id', productId);
      if (delErr) {
        console.error('Error borrando receta anterior:', delErr.message);
        return false;
      }
      const rows = materials
        .filter((m) => m.production_item_id && Number(m.quantity_required) > 0)
        .map((m) => ({
          product_id: productId,
          production_item_id: m.production_item_id,
          quantity_required: Number(m.quantity_required),
        }));
      if (rows.length > 0) {
        const { error } = await supabase.from('product_production_items').insert(rows);
        if (error) {
          console.error('Error guardando receta:', error.message);
          return false;
        }
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
    } catch (e) {}
    return true;
  },

  async deleteAllItems(): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('production_items').delete().neq('id', 'keep-all-placeholder');
      } catch (err) {
        console.warn('Error clearing items in Supabase:', err);
      }
    }
    saveLocalProductionItems([]);
    saveLocalMovements([]);
    await this.syncToMetadata();
    return true;
  },

  async syncToMetadata() {
    // Desactivado por seguridad: copiaba las insumos (costos y proveedores) a settings.metadata,
    // que cualquiera puede leer.
    return;
  },
};
