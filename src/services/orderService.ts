import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '../types/database';

const LOCAL_ORDERS_KEY = 'balloonsdei_orders_v4';
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

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading local orders:', e);
  }
  return [];
}

function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Storage quota warning in orders, slimming entries:', e);
    try {
      const slim = orders.map((o) => ({
        ...o,
        receipt_url: o.receipt_url?.slice(0, 150) || null,
        order_items: o.order_items?.map((it) => ({
          ...it,
          image_url: undefined,
        })),
      }));
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(slim));
    } catch (err2) {
      console.error('Failed to save even slim local orders:', err2);
    }
  }
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const localOrders = getLocalOrders();

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items:order_items(*)
          `)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mappedOrders: Order[] = data.map((d: any) => {
            const rawNum = d.order_number !== undefined ? String(d.order_number).padStart(5, '0') : d.id.slice(0, 6);
            const formattedOrderNumber = `BD-${rawNum}`;

            return {
              id: d.id,
              order_number: formattedOrderNumber,
              customer_id: d.customer_id || null,
              customer_name: d.customer_name || 'Cliente',
              customer_email: d.customer_email || '',
              customer_phone: d.customer_phone || '',
              delivery_address: d.customer_address || d.delivery_address || 'Entrega a coordinar',
              delivery_date: d.desired_date || d.delivery_date || new Date(d.created_at).toISOString().split('T')[0],
              delivery_type: (d.delivery_method || d.delivery_type || 'delivery') as 'delivery' | 'pickup',
              payment_method: d.payment_method || 'Yappy',
              payment_status: (d.payment_status || 'pending') as PaymentStatus,
              status: (d.order_status || d.status || 'pending') as OrderStatus,
              subtotal: Number(d.subtotal) || 0,
              total: Number(d.total) || 0,
              notes: d.notes || '',
              receipt_url: d.receipt_url || null,
              receipt_ref: d.receipt_ref || null,
              created_at: d.created_at,
              order_items: Array.isArray(d.order_items)
                ? d.order_items.map((it: any) => ({
                    id: it.id,
                    order_id: it.order_id,
                    product_id: it.product_id,
                    product_name: it.product_name,
                    unit_price: Number(it.unit_price) || 0,
                    quantity: Number(it.quantity) || 1,
                    total_price: (Number(it.unit_price) || 0) * (Number(it.quantity) || 1),
                  }))
                : [],
            };
          });

          // Merge with any local orders not yet reflected in remote
          const missingLocals = localOrders.filter(
            (loc) => !mappedOrders.some((rem) => rem.id === loc.id || rem.order_number === loc.order_number)
          );
          const finalOrders = [...mappedOrders, ...missingLocals];
          saveLocalOrders(finalOrders);
          return finalOrders;
        }

        // Check metadata backup
        const { data: setRow } = await supabase
          .from('settings')
          .select('metadata')
          .eq('id', SETTINGS_ROW_ID)
          .maybeSingle();

        if (setRow?.metadata?.orders && Array.isArray(setRow.metadata.orders)) {
          const metaOrders = setRow.metadata.orders as Order[];
          if (metaOrders.length > 0) {
            saveLocalOrders(metaOrders);
            return metaOrders;
          }
        }
      } catch (err) {
        console.warn('Error fetching orders from Supabase, using local:', err);
      }
    }

    return localOrders;
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
    const newId = safeUuid();
    const tempOrderNumber = `BD-${Date.now().toString().slice(-5)}`;

    let formattedNotes = orderData.notes || '';
    if (orderData.receipt_ref) {
      formattedNotes += ` [Comprobante Ref: ${orderData.receipt_ref}]`;
    }
    if (orderData.receipt_url && !formattedNotes.includes('[Comprobante Adjunto]')) {
      formattedNotes += ` [Comprobante: Sí]`;
    }

    const localNewOrder: Order = {
      id: newId,
      order_number: tempOrderNumber,
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
        id: safeUuid(),
        order_id: newId,
      })),
    };

    const currentOrders = getLocalOrders();
    saveLocalOrders([localNewOrder, ...currentOrders]);

    if (supabase && isSupabaseConfigured) {
      try {
        // Insert into orders table without order_number (since order_number is an identity GENERATED ALWAYS column in PostgreSQL)
        const orderInsertPayload = {
          id: newId,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          customer_email: orderData.customer_email || null,
          customer_address: orderData.delivery_address,
          desired_date: orderData.delivery_date,
          delivery_method: orderData.delivery_type,
          payment_method: orderData.payment_method,
          payment_status: 'pending',
          order_status: 'pending',
          subtotal,
          delivery_fee: deliveryFee,
          total,
          notes: formattedNotes,
        };

        // Se guarda con la función segura crear_pedido (el público ya no puede
        // leer ni modificar la tabla orders directamente).
        const itemsPayload = items.map((it) => ({
          product_id: it.product_id?.length === 36 ? it.product_id : null,
          product_name: it.product_name || 'Arreglo Floral',
          quantity: it.quantity || 1,
          unit_price: it.unit_price || 0,
        }));

        const { data: insertedOrder, error: orderErr } = await supabase.rpc('crear_pedido', {
          p_pedido: orderInsertPayload,
          p_items: itemsPayload,
        });

        if (!orderErr && insertedOrder) {
          const actualOrderNumber = insertedOrder.order_number
            ? `BD-${String(insertedOrder.order_number).padStart(5, '0')}`
            : tempOrderNumber;

          const completedOrder: Order = {
            ...localNewOrder,
            id: insertedOrder.id,
            order_number: actualOrderNumber,
            created_at: insertedOrder.created_at,
          };

          const fresh = getLocalOrders().map((o) => (o.id === newId ? completedOrder : o));
          saveLocalOrders(fresh);
          await this.syncToMetadata();
          return { order: completedOrder, error: null };
        } else {
          console.warn('Orders direct insert notice, syncing to metadata:', orderErr?.message);
          await this.syncToMetadata();
        }
      } catch (err: any) {
        console.error('Error inserting order into Supabase:', err);
        await this.syncToMetadata();
      }
    }

    await this.syncToMetadata();
    return { order: localNewOrder, error: null };
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    const current = getLocalOrders();
    const updated = current.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
    saveLocalOrders(updated);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('orders')
          .update({ order_status: status })
          .eq('id', orderId);
        await this.syncToMetadata();
      } catch (err) {
        console.error('Error updating order status in Supabase:', err);
        await this.syncToMetadata();
      }
    }

    return true;
  },

  async updatePaymentStatus(orderId: string, payment_status: PaymentStatus): Promise<boolean> {
    const current = getLocalOrders();
    const updated = current.map((ord) => (ord.id === orderId ? { ...ord, payment_status } : ord));
    saveLocalOrders(updated);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('orders')
          .update({ payment_status })
          .eq('id', orderId);
        await this.syncToMetadata();
      } catch (err) {
        console.error('Error updating payment status in Supabase:', err);
        await this.syncToMetadata();
      }
    }

    return true;
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    const current = getLocalOrders();
    const filtered = current.filter((o) => o.id !== orderId);
    saveLocalOrders(filtered);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('order_items').delete().eq('order_id', orderId);
        await supabase.from('orders').delete().eq('id', orderId);
        await this.syncToMetadata();
      } catch (err) {
        console.error('Error deleting order in Supabase:', err);
        await this.syncToMetadata();
      }
    }

    return true;
  },

  async syncToMetadata() {
    // Desactivado por seguridad: antes copiaba TODOS los pedidos (nombre, teléfono,
    // dirección) dentro de settings.metadata, que cualquiera puede leer.
    return;
  },
};

