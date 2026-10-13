import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Rental, RentalStatus } from '../types/database';

const LOCAL_RENTALS_KEY = 'ballonsdei_rentals_v2';

const INITIAL_RENTALS: Rental[] = [];

function getLocalRentals(): Rental[] {
  try {
    const raw = localStorage.getItem(LOCAL_RENTALS_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {}
  return INITIAL_RENTALS;
}

function saveLocalRentals(rentals: Rental[]) {
  try {
    localStorage.setItem(LOCAL_RENTALS_KEY, JSON.stringify(rentals));
  } catch (e) {}
}

export const rentalService = {
  async getRentals(): Promise<Rental[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('rentals')
          .select(`
            *,
            product:products(name, rental_price, rental_deposit)
          `)
          .order('start_date', { ascending: true });

        if (!error && data) {
          return data.map((r: any) => ({
            ...r,
            product_name: r.product?.name || r.product_name || 'Artículo de Alquiler',
          }));
        }
      } catch (err) {
        console.warn('Error fetching rentals from Supabase, using local:', err);
      }
    }

    return getLocalRentals();
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

    const newId = `rent-${Date.now()}`;

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('rentals')
          .insert({
            product_id: rentalData.product_id,
            customer_name: rentalData.customer_name,
            customer_phone: rentalData.customer_phone,
            customer_email: rentalData.customer_email || null,
            start_date: rentalData.start_date,
            end_date: rentalData.end_date,
            quantity: rentalData.quantity || 1,
            deposit_amount: rentalData.deposit_amount || 0,
            total_price: rentalData.total_price || 0,
            status: 'reserved' as RentalStatus,
            notes: rentalData.notes || '',
          })
          .select()
          .single();

        if (error) throw error;
        return { rental: data, error: null };
      } catch (err: any) {
        console.error('Error creating rental in Supabase:', err);
      }
    }

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
      notes: rentalData.notes || '',
      created_at: new Date().toISOString(),
    };

    const current = getLocalRentals();
    saveLocalRentals([newRental, ...current]);
    return { rental: newRental, error: null };
  },

  async updateRentalStatus(rentalId: string, status: RentalStatus): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('rentals')
          .update({ status })
          .eq('id', rentalId);
        if (!error) return true;
      } catch (err) {
        console.error('Error updating rental status in Supabase:', err);
      }
    }

    const current = getLocalRentals();
    const updated = current.map((r) => (r.id === rentalId ? { ...r, status } : r));
    saveLocalRentals(updated);
    return true;
  },

  async deleteRental(rentalId: string): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('rentals').delete().eq('id', rentalId);
        if (!error) return true;
      } catch (err) {
        console.error('Error deleting rental in Supabase:', err);
      }
    }

    const current = getLocalRentals();
    const filtered = current.filter((r) => r.id !== rentalId);
    saveLocalRentals(filtered);
    return true;
  },

  async deleteAllRentals(): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('rentals').delete().neq('id', 'placeholder');
      } catch (err) {
        console.warn('Error clearing rentals in Supabase:', err);
      }
    }
    saveLocalRentals([]);
    return true;
  },
};

