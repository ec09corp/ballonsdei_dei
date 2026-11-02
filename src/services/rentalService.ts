import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Rental, RentalStatus } from '../types/database';

const LOCAL_RENTALS_KEY = 'ballonsdei_rentals_v3';
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

function parseCustomerFromNotes(notes?: string | null): {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  total_price?: number;
} {
  if (!notes) return {};
  const nameMatch = notes.match(/\[Cliente:\s*([^|\]]+)/i);
  const phoneMatch = notes.match(/Tel:\s*([^|\]]+)/i);
  const emailMatch = notes.match(/Email:\s*([^|\]]+)/i);
  const totalMatch = notes.match(/Total:\s*\$?([\d.]+)/i);

  return {
    customer_name: nameMatch ? nameMatch[1].trim() : undefined,
    customer_phone: phoneMatch ? phoneMatch[1].trim() : undefined,
    customer_email: emailMatch ? emailMatch[1].trim() : undefined,
    total_price: totalMatch ? parseFloat(totalMatch[1]) : undefined,
  };
}

function getLocalRentals(): Rental[] {
  try {
    const raw = localStorage.getItem(LOCAL_RENTALS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function saveLocalRentals(rentals: Rental[]) {
  try {
    localStorage.setItem(LOCAL_RENTALS_KEY, JSON.stringify(rentals));
  } catch (e) {
    console.warn('Storage quota warning in rentals:', e);
  }
}

export const rentalService = {
  async getRentals(): Promise<Rental[]> {
    const local = getLocalRentals();

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('rentals')
          .select(`
            *,
            product:products(name, rental_price, rental_deposit)
          `)
          .order('start_date', { ascending: true });

        if (!error && Array.isArray(data)) {
          const mapped: Rental[] = data.map((r: any) => {
            const parsed = parseCustomerFromNotes(r.notes);
            return {
              id: r.id,
              product_id: r.product_id,
              product_name: r.product?.name || r.product_name || 'Artículo de Alquiler',
              customer_id: r.customer_id || null,
              customer_name: r.customer_name || parsed.customer_name || 'Cliente',
              customer_phone: r.customer_phone || parsed.customer_phone || '',
              customer_email: r.customer_email || parsed.customer_email || '',
              start_date: r.start_date,
              end_date: r.end_date,
              quantity: Number(r.quantity) || 1,
              deposit_amount: Number(r.deposit ?? r.deposit_amount) || 0,
              total_price: Number(r.total_price ?? parsed.total_price) || 0,
              status: (r.status || 'reserved') as RentalStatus,
              notes: r.notes || '',
              created_at: r.created_at,
            };
          });

          // Merge any newly added local rentals not yet in remote
          const missingLocals = local.filter((loc) => !mapped.some((rem) => rem.id === loc.id));
          const finalRentals = [...mapped, ...missingLocals];
          saveLocalRentals(finalRentals);
          return finalRentals;
        }

        // Check fallback in settings.metadata
        const { data: setRow } = await supabase
          .from('settings')
          .select('metadata')
          .eq('id', SETTINGS_ROW_ID)
          .maybeSingle();

        if (setRow?.metadata?.rentals && Array.isArray(setRow.metadata.rentals)) {
          const metaRentals = setRow.metadata.rentals as Rental[];
          if (metaRentals.length > 0) {
            saveLocalRentals(metaRentals);
            return metaRentals;
          }
        }
      } catch (err) {
        console.warn('Error fetching rentals from Supabase, using local:', err);
      }
    }

    return local;
  },

  async checkAvailability(
    productId: string,
    startDate: string,
    endDate: string,
    excludeRentalId?: string
  ): Promise<{ available: boolean; conflictingRental?: Rental }> {
    const allRentals = await this.getRentals();
    const activeRentals = allRentals.filter(
      (r) =>
        r.product_id === productId &&
        (r.status === 'reserved' || r.status === 'active') &&
        r.id !== excludeRentalId
    );

    const reqStart = new Date(startDate).getTime();
    const reqEnd = new Date(endDate).getTime();

    for (const r of activeRentals) {
      const rStart = new Date(r.start_date).getTime();
      const rEnd = new Date(r.end_date).getTime();

      // Check date collision
      if (reqStart <= rEnd && reqEnd >= rStart) {
        return { available: false, conflictingRental: r };
      }
    }

    return { available: true };
  },

  async createRental(rentalData: {
    product_id: string;
    product_name?: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    start_date: string;
    end_date: string;
    quantity: number;
    deposit_amount: number;
    total_price: number;
    notes?: string;
  }): Promise<{ rental: Rental | null; error: Error | null }> {
    // 1. Validate date conflict
    const availability = await this.checkAvailability(
      rentalData.product_id,
      rentalData.start_date,
      rentalData.end_date
    );

    if (!availability.available) {
      return {
        rental: null,
        error: new Error(
          `El artículo ya se encuentra reservado para las fechas seleccionadas (${availability.conflictingRental?.start_date} al ${availability.conflictingRental?.end_date}).`
        ),
      };
    }

    const newId = safeUuid();
    const formattedNotes = `[Cliente: ${rentalData.customer_name} | Tel: ${rentalData.customer_phone} | Email: ${rentalData.customer_email || 'N/A'} | Total: $${rentalData.total_price.toFixed(2)}] ${rentalData.notes || ''}`.trim();

    const newRental: Rental = {
      id: newId,
      product_id: rentalData.product_id,
      product_name: rentalData.product_name || 'Artículo de Alquiler',
      customer_name: rentalData.customer_name,
      customer_phone: rentalData.customer_phone,
      customer_email: rentalData.customer_email || '',
      start_date: rentalData.start_date,
      end_date: rentalData.end_date,
      quantity: rentalData.quantity || 1,
      deposit_amount: rentalData.deposit_amount || 0,
      total_price: rentalData.total_price || 0,
      status: 'reserved',
      notes: formattedNotes,
      created_at: new Date().toISOString(),
    };

    const current = getLocalRentals();
    saveLocalRentals([newRental, ...current]);

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('rentals')
          .insert({
            id: newId,
            product_id: rentalData.product_id,
            start_date: rentalData.start_date,
            end_date: rentalData.end_date,
            quantity: rentalData.quantity || 1,
            deposit: rentalData.deposit_amount || 0,
            status: 'reserved',
            notes: formattedNotes,
          })
          .select()
          .maybeSingle();

        if (!error && data) {
          const freshRental: Rental = {
            ...newRental,
            id: data.id,
            created_at: data.created_at,
          };
          const fresh = getLocalRentals().map((r) => (r.id === newId ? freshRental : r));
          saveLocalRentals(fresh);
          await this.syncToMetadata();
          return { rental: freshRental, error: null };
        } else if (error) {
          console.warn('Rentals direct insert notice, syncing to metadata:', error.message);
          await this.syncToMetadata();
        }
      } catch (err: any) {
        console.error('Error creating rental in Supabase:', err);
        await this.syncToMetadata();
      }
    }

    await this.syncToMetadata();
    return { rental: newRental, error: null };
  },

  async updateRentalStatus(rentalId: string, status: RentalStatus): Promise<boolean> {
    const current = getLocalRentals();
    const updated = current.map((r) => (r.id === rentalId ? { ...r, status } : r));
    saveLocalRentals(updated);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('rentals')
          .update({ status })
          .eq('id', rentalId);
        await this.syncToMetadata();
      } catch (err) {
        console.error('Error updating rental status in Supabase:', err);
        await this.syncToMetadata();
      }
    }

    return true;
  },

  async deleteRental(rentalId: string): Promise<boolean> {
    const current = getLocalRentals();
    const filtered = current.filter((r) => r.id !== rentalId);
    saveLocalRentals(filtered);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('rentals').delete().eq('id', rentalId);
        await this.syncToMetadata();
      } catch (err) {
        console.error('Error deleting rental in Supabase:', err);
        await this.syncToMetadata();
      }
    }

    return true;
  },

  async deleteAllRentals(): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('rentals').delete().neq('id', 'keep-all-placeholder');
      } catch (err) {
        console.warn('Error clearing rentals in Supabase:', err);
      }
    }
    saveLocalRentals([]);
    await this.syncToMetadata();
    return true;
  },

  async syncToMetadata() {
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
        rentals: getLocalRentals(),
      };

      await supabase
        .from('settings')
        .update({ metadata: updatedMeta })
        .eq('id', SETTINGS_ROW_ID);
    } catch (e) {
      console.warn('Error syncing rentals to metadata:', e);
    }
  },
};

