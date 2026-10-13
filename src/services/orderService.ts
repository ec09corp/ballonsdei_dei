import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '../types/database';

const LOCAL_ORDERS_KEY = 'ballonsdei_orders_v2';

const INITIAL_ORDERS: Order[] = [];

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local orders:', e);
  }
  return INITIAL_ORDERS;
}

function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving local orders:', e);
  }
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items:order_items(*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Error fetching orders from Supabase, using local:', err);
      }
    }

    return getLocalOrders();
  },

  async createOrder(
    orderData: {
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      delivery_address: string;
      delivery_date: string;
      delivery_type: 'delivery' | 'pickup';
      payment_method: string;
      notes?: string;
      receipt_url?: string | null;
      receipt_ref?: string | null;
    },
    items: OrderItem[],
    deliveryFee: number = 0
  ): Promise<{ order: Order | null; error: Error | null }> {
    const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const total = subtotal + (orderData.delivery_type === 'delivery' ? deliveryFee : 0);
    const orderNumber = `BD-${Date.now().toString().slice(-6)}`;
    const newId = `ord-${Date.now()}`;

    // Format notes to include receipt info so it's always preserved in database
    let formattedNotes = orderData.notes || '';
    if (orderData.receipt_ref) {
      formattedNotes += ` [Comprobante Yappy Ref: ${orderData.receipt_ref}]`;
    }
    if (orderData.receipt_url && !formattedNotes.includes('[Comprobante Adjunto]')) {
      formattedNotes += ` [Comprobante Adjunto: Sí]`;
    }

    if (supabase && isSupabaseConfigured) {
      try {
        // 1. Find or create customer
        let customerId: string | null = null;
        try {
          if (orderData.customer_email) {
            const { data: existingCust } = await supabase
              .from('customers')
              .select('id')
              .eq('email', orderData.customer_email)
              .maybeSingle();

            if (existingCust) {
              customerId = existingCust.id;
            }
          }

          if (!customerId) {
            const { data: customerData } = await supabase
              .from('customers')
              .insert({
                full_name: orderData.customer_name,
                email: orderData.customer_email || null,
                phone: orderData.customer_phone,
                address: orderData.delivery_address,
              })
              .select()
              .maybeSingle();

            if (customerData) customerId = customerData.id;
          }
        } catch (cErr) {
          console.warn('Customer upsert non-critical warning:', cErr);
        }

        // 2. Insert order
        const { data: insertedOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            customer_id: customerId,
            customer_name: orderData.customer_name,
            customer_email: orderData.customer_email,
            customer_phone: orderData.customer_phone,
            delivery_address: orderData.delivery_address,
            delivery_date: orderData.delivery_date,
            delivery_type: orderData.delivery_type,
            payment_method: orderData.payment_method,
            payment_status: 'pending' as PaymentStatus,
            status: 'pending' as OrderStatus,
            subtotal,
            total,
            notes: formattedNotes,
          })
          .select()
          .single();

        if (orderErr) throw orderErr;

        // 3. Insert order items
        const itemsToInsert = items.map((it) => ({
          order_id: insertedOrder.id,
          product_id: it.product_id,
          product_name: it.product_name,
          unit_price: it.unit_price,
          quantity: it.quantity,
          total_price: it.unit_price * it.quantity,
          image_url: it.image_url || null,
        }));

        const { data: insertedItems } = await supabase
          .from('order_items')
          .insert(itemsToInsert)
          .select();

        const completeOrder: Order = {
          ...insertedOrder,
          receipt_url: orderData.receipt_url || null,
          receipt_ref: orderData.receipt_ref || null,
          order_items: insertedItems || itemsToInsert,
        };

        // Cache locally as well for immediate admin display
        const currentOrders = getLocalOrders();
        saveLocalOrders([completeOrder, ...currentOrders]);

        return { order: completeOrder, error: null };
      } catch (err: any) {
        console.error('Error creating order in Supabase:', err);
        // Fall back to local creation
      }
    }

    // Local fallback
    const newOrder: Order = {
      id: newId,
      order_number: orderNumber,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      delivery_address: orderData.delivery_address,
      delivery_date: orderData.delivery_date,
      delivery_type: orderData.delivery_type,
      payment_method: orderData.payment_method,
      payment_status: 'pending',
      status: 'pending',
      subtotal,
      total,
      notes: formattedNotes,
      receipt_url: orderData.receipt_url || null,
      receipt_ref: orderData.receipt_ref || null,
      created_at: new Date().toISOString(),
      order_items: items.map((it, idx) => ({
        ...it,
        id: `item-${Date.now()}-${idx}`,
        order_id: newId,
      })),
    };

    const current = getLocalOrders();
    saveLocalOrders([newOrder, ...current]);
    return { order: newOrder, error: null };
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId);
        if (!error) return true;
      } catch (err) {
        console.error('Error updating order status in Supabase:', err);
      }
    }

    const current = getLocalOrders();
    const updated = current.map((ord) =>
      ord.id === orderId ? { ...ord, status } : ord
    );
    saveLocalOrders(updated);
    return true;
  },

  async updatePaymentStatus(orderId: string, payment_status: PaymentStatus): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ payment_status })
          .eq('id', orderId);
        if (!error) return true;
      } catch (err) {
        console.error('Error updating payment status in Supabase:', err);
      }
    }

    const current = getLocalOrders();
    const updated = current.map((ord) =>
      ord.id === orderId ? { ...ord, payment_status } : ord
    );
    saveLocalOrders(updated);
    return true;
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('order_items').delete().eq('order_id', orderId);
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (!error) return true;
      } catch (err) {
        console.error('Error deleting order in Supabase:', err);
      }
    }

    const current = getLocalOrders();
    const filtered = current.filter((o) => o.id !== orderId);
    saveLocalOrders(filtered);
    return true;
  },
};

