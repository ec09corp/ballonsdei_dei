import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  Phone, 
  MapPin, 
  Check, 
  X, 
  Clock, 
  Send, 
  AlertCircle,
  Trash2,
  ExternalLink,
  MessageCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/database';
import { orderService } from '../../services/orderService';

interface AdminOrdersProps {
  orders: Order[];
  onRefreshOrders: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onRefreshOrders }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el pedido #${orderNumber}? Esta acción no se puede deshacer.`)) {
      return;
    }
    const ok = await orderService.deleteOrder(orderId);
    if (ok) {
      setStatusMsg(`Pedido #${orderNumber} eliminado correctamente.`);
      onRefreshOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } else {
      setStatusMsg('No se pudo eliminar el pedido.');
    }
  };

  const statuses: { key: OrderStatus; label: string; color: string }[] = [
    { key: 'pending', label: 'Pendiente', color: 'bg-orange-100 text-orange-800' },
    { key: 'confirmed', label: 'Confirmado', color: 'bg-indigo-100 text-indigo-800' },
    { key: 'preparing', label: 'En Preparación', color: 'bg-blue-100 text-blue-800' },
    { key: 'ready', label: 'Listo', color: 'bg-teal-100 text-teal-800' },
    { key: 'delivered', label: 'Entregado', color: 'bg-emerald-100 text-emerald-800' },
    { key: 'cancelled', label: 'Cancelado', color: 'bg-rose-100 text-rose-800' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(s) ||
        o.customer_name.toLowerCase().includes(s) ||
        o.customer_phone.includes(s)
      );
    }
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(true);
    setStatusMsg(null);
    try {
      const ok = await orderService.updateOrderStatus(orderId, newStatus);
      if (ok) {
        setStatusMsg('Estado del pedido actualizado correctamente.');
        onRefreshOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      setStatusMsg('No se pudo actualizar el estado del pedido.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2E2421]">
            Ventas y Pedidos
          </h1>
          <p className="text-xs text-[#7A6B63] mt-1 font-light">
            Gestiona los pedidos de la tienda, visualiza los productos y actualiza el estado de entrega.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-900 font-bold">×</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EDE5DF] shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#8A796F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente o # pedido..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8] text-[#2E2421] focus:outline-none focus:border-[#8D5844]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'all'
                ? 'bg-[#8D5844] text-white'
                : 'bg-[#FAF8F5] text-[#5C4D46] hover:bg-[#F2ECE6]'
            }`}
          >
            Todos ({orders.length})
          </button>
          {statuses.map((st) => (
            <button
              key={st.key}
              onClick={() => setFilterStatus(st.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterStatus === st.key
                  ? 'bg-[#8D5844] text-white'
                  : 'bg-[#FAF8F5] text-[#5C4D46] hover:bg-[#F2ECE6]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Display: Mobile Cards + Desktop Table */}
      <div className="bg-white rounded-2xl border border-[#EDE5DF] shadow-2xs overflow-hidden">
        {/* Mobile View: Touch-friendly order cards */}
        <div className="block md:hidden divide-y divide-[#F2ECE6]">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8A796F]">
              No se encontraron pedidos con los filtros seleccionados.
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div key={ord.id} className="p-3.5 space-y-2.5 hover:bg-[#FAF8F5]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-xs text-[#2E2421] block">
                      Pedido #{ord.order_number}
                    </span>
                    <span className="font-medium text-xs text-[#423530]">
                      {ord.customer_name}
                    </span>
                    <span className="text-[10px] text-[#8A796F] block">
                      Tel: {ord.customer_phone}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-[#8D5844] block">
                      ${ord.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#8A796F]">
                      {ord.delivery_date || 'Sin fecha'}
                    </span>
                    {ord.receipt_url && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 text-[#763D8B] text-[9px] font-semibold rounded mt-0.5 block border border-purple-200">
                        📸 Comprobante
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F7F3EF]">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] text-[#8A796F]">Estado:</label>
                    <select
                      value={ord.status}
                      disabled={isUpdating}
                      onChange={(e) =>
                        handleStatusChange(ord.id, e.target.value as OrderStatus)
                      }
                      className="text-[11px] py-1 px-2 rounded-lg border border-[#D5C2B8] bg-white font-medium text-[#2E2421] cursor-pointer"
                    >
                      {statuses.map((st) => (
                        <option key={st.key} value={st.key}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="p-1.5 text-[#8D5844] bg-[#FAF8F5] hover:bg-[#F2ECE6] border border-[#E3D7CE] rounded-lg transition-colors"
                      title="Ver detalle del pedido"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(ord.id, ord.order_number)}
                      className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                      title="Eliminar pedido"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EBE2DB] text-[#7A6B63] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Nº Pedido</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Fecha Entrega</th>
                <th className="py-3 px-4">Artículos</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Método Pago</th>
                <th className="py-3 px-4">Comprobante</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE6]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#8A796F]">
                    No se encontraron pedidos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3.5 px-4 font-semibold text-[#2E2421]">
                      #{ord.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#2E2421]">{ord.customer_name}</div>
                      <div className="text-[10px] text-[#8A796F]">{ord.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5C4D46]">
                      {ord.delivery_date}
                    </td>
                    <td className="py-3.5 px-4 text-[#5C4D46]">
                      {ord.order_items?.length || 1} producto(s)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#2E2421]">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-[#5C4D46]">
                      {ord.payment_method}
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.receipt_url ? (
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#763D8B] rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Ver captura de comprobante"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Ver Captura</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#A6978E] italic">Sin captura</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        disabled={isUpdating}
                        onChange={(e) =>
                          handleStatusChange(ord.id, e.target.value as OrderStatus)
                        }
                        className="text-xs p-1 rounded border border-[#D5C2B8] bg-white font-medium text-[#2E2421] cursor-pointer"
                      >
                        {statuses.map((st) => (
                          <option key={st.key} value={st.key}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 text-[#8D5844] hover:bg-[#F2ECE6] rounded-md transition-colors"
                          title="Ver detalle del pedido"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(ord.id, ord.order_number)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Eliminar pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#EDE5DF] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#EBE2DB] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8D5844] uppercase font-bold tracking-wider">
                  Detalles del Pedido
                </span>
                <h3 className="font-serif text-xl font-medium text-[#2E2421]">
                  Pedido #{selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#7A6B63] hover:text-[#2E2421] hover:bg-[#EFE8E2] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Customer summary */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EDE5DF] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#8A796F] block">Cliente:</span>
                    <span className="font-semibold text-[#2E2421]">{selectedOrder.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-[#8A796F] block">Teléfono / WhatsApp:</span>
                    <span className="font-semibold text-[#2E2421]">{selectedOrder.customer_phone}</span>
                  </div>
                  <div>
                    <span className="text-[#8A796F] block">Fecha de Entrega:</span>
                    <span className="font-semibold text-[#2E2421]">{selectedOrder.delivery_date}</span>
                  </div>
                  <div>
                    <span className="text-[#8A796F] block">Modalidad:</span>
                    <span className="font-semibold text-[#2E2421] uppercase">
                      {selectedOrder.delivery_type === 'delivery' ? 'A Domicilio' : 'Retiro en Boutique'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EBE2DB]">
                  <span className="text-[#8A796F] block">Dirección:</span>
                  <span className="font-medium text-[#2E2421]">{selectedOrder.delivery_address}</span>
                </div>

                {selectedOrder.notes && (
                  <div className="pt-2 border-t border-[#EBE2DB]">
                    <span className="text-[#8A796F] block">Notas / Dedicatoria:</span>
                    <span className="italic text-[#5C4D46]">"{selectedOrder.notes}"</span>
                  </div>
                )}

                {/* Receipt Proof in Admin */}
                {(selectedOrder.receipt_url || selectedOrder.receipt_ref) && (
                  <div className="pt-3 border-t border-[#EBE2DB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A796F] block font-medium">
                        Comprobante de Pago ({selectedOrder.payment_method}):
                      </span>
                      {selectedOrder.receipt_ref && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded border border-purple-200">
                          Ref: #{selectedOrder.receipt_ref}
                        </span>
                      )}
                    </div>
                    {selectedOrder.receipt_url && (
                      <div className="space-y-2">
                        <div className="rounded-xl overflow-hidden border border-[#D5C2B8] max-h-64 bg-black/5 flex items-center justify-center p-2">
                          <img
                            src={selectedOrder.receipt_url}
                            alt={`Comprobante ${selectedOrder.payment_method}`}
                            className="max-h-60 w-auto object-contain rounded shadow-xs"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <a
                            href={selectedOrder.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#763D8B] hover:underline font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir captura en tamaño completo</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Direct WhatsApp Message to Customer */}
                <div className="pt-2 border-t border-[#EBE2DB]">
                  <a
                    href={`https://wa.me/${(selectedOrder.customer_phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hola ${selectedOrder.customer_name}, te saludamos de BALLONSDEI con respecto a tu pedido #${selectedOrder.order_number} (${selectedOrder.delivery_type === 'delivery' ? 'entrega en Colón' : 'retiro en tienda'}). ¡Estamos preparando tu orden!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contactar al Cliente por WhatsApp ({selectedOrder.customer_phone})</span>
                  </a>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-medium text-[#2E2421] uppercase tracking-wider text-[11px]">
                  Productos Solicitados ({selectedOrder.order_items?.length || 0})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedOrder.order_items || []).map((it, idx) => (
                    <div
                      key={it.id || idx}
                      className="flex items-center justify-between p-2.5 bg-white border border-[#EDE5DF] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#FAF8F5] overflow-hidden shrink-0 border border-[#EAE2DC]">
                          <img
                            src={it.image_url || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=150&q=80'}
                            alt={it.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-[#2E2421]">{it.product_name}</div>
                          <div className="text-[10px] text-[#8A796F]">
                            {it.quantity} x ${it.unit_price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-[#2E2421]">${it.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#EBE2DB] flex justify-between font-bold text-sm text-[#2E2421]">
                  <span>Total Pedido:</span>
                  <span className="text-[#8D5844]">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div className="pt-3 border-t border-[#EBE2DB] flex items-center justify-between">
                <span className="font-medium text-[#423530]">Actualizar Estado:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="p-1.5 rounded-md border border-[#D5C2B8] bg-[#FAF8F5] font-semibold text-xs"
                >
                  {statuses.map((st) => (
                    <option key={st.key} value={st.key}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
