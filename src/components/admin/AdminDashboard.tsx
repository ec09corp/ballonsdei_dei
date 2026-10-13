import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Warehouse, 
  Package, 
  Hammer,
  ArrowRight,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Order, Product, ProductionItem } from '../../types/database';
import { AdminTab } from './AdminLayout';

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  productionItems: ProductionItem[];
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  products,
  productionItems,
  onNavigateTab,
}) => {
  // Compute real metrics
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Daily sales (orders created today)
  const todayOrders = orders.filter((o) => (o.created_at || '').slice(0, 10) === todayStr);
  const todaySales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Monthly sales (orders created this month)
  const monthOrders = orders.filter((o) => {
    if (!o.created_at) return false;
    const d = new Date(o.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthSales = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Order status counts
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  // Product inventory stats
  const activeProducts = products.filter((p) => p.active);
  const lowStockProducts = products.filter(
    (p) => !p.available_for_rental && p.stock <= p.minimum_stock
  );

  // Raw materials / production items stats
  const lowStockMaterials = productionItems.filter(
    (item) => item.current_quantity <= item.minimum_quantity
  );

  const stats = [
    {
      title: 'Ventas de Hoy',
      value: `$${todaySales.toFixed(2)}`,
      subtitle: `${todayOrders.length} pedidos hoy`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Ventas del Mes',
      value: `$${monthSales.toFixed(2)}`,
      subtitle: `${monthOrders.length} pedidos en el mes`,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Pedidos Pendientes',
      value: pendingOrders.length.toString(),
      subtitle: 'Requieren confirmación',
      icon: Clock,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      action: () => onNavigateTab('orders'),
    },
    {
      title: 'En Preparación',
      value: preparingOrders.length.toString(),
      subtitle: 'En taller floral/empaque',
      icon: ShoppingBag,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      action: () => onNavigateTab('orders'),
    },
    {
      title: 'Pedidos Entregados',
      value: completedOrders.length.toString(),
      subtitle: 'Completados con éxito',
      icon: CheckCircle2,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      action: () => onNavigateTab('orders'),
    },
    {
      title: 'Productos Activos',
      value: activeProducts.length.toString(),
      subtitle: 'Disponibles en tienda',
      icon: Package,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      action: () => onNavigateTab('products'),
    },
    {
      title: 'Productos Stock Bajo',
      value: lowStockProducts.length.toString(),
      subtitle: 'Requieren reabastecer',
      icon: Warehouse,
      color: lowStockProducts.length > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-stone-50 text-stone-700 border-stone-200',
      action: () => onNavigateTab('inventory'),
    },
    {
      title: 'Insumos en Alerta',
      value: lowStockMaterials.length.toString(),
      subtitle: 'Cajas, cintas, flores...',
      icon: Hammer,
      color: lowStockMaterials.length > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-stone-50 text-stone-700 border-stone-200',
      action: () => onNavigateTab('production'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2E2421]">
            Panel de Control General
          </h1>
          <p className="text-xs text-[#7A6B63] mt-1 font-light">
            Resumen en tiempo real de pedidos, stock de productos e insumos de producción.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              onClick={st.action}
              className={`p-4 rounded-xl border bg-white shadow-2xs hover:shadow-md transition-all ${
                st.action ? 'cursor-pointer hover:border-[#8D5844]' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#7A6B63]">{st.title}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${st.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-serif font-semibold text-[#2E2421]">
                {st.value}
              </div>
              <div className="text-[11px] text-[#8C7A70] mt-1 font-light">
                {st.subtitle}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Grid: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#EDE5DF] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-medium text-[#2E2421]">
                Últimos Pedidos Registrados
              </h3>
              <p className="text-xs text-[#8C7A70] font-light">Pedidos recibidos recientemente</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-medium text-[#8D5844] hover:text-[#64473C] flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EFE8E2] text-[#7A6B63] uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Pedido</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Fecha Entrega</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EFEB]">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-semibold text-[#2E2421]">
                      #{ord.order_number}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#2E2421]">{ord.customer_name}</div>
                      <div className="text-[10px] text-[#8A796F]">{ord.customer_phone}</div>
                    </td>
                    <td className="py-3 px-3 text-[#5C4D46]">
                      {ord.delivery_date}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#2E2421]">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                          ord.status === 'pending'
                            ? 'bg-orange-100 text-orange-800'
                            : ord.status === 'preparing'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Inventory Warnings */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#EDE5DF] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-medium text-[#2E2421] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Alertas de Stock</span>
            </h3>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-medium text-[#8D5844] hover:text-[#64473C]"
            >
              Ajustar
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8A796F] font-semibold block mb-2">
                Productos con Stock Crítico
              </span>
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  ✓ Todos los productos tienen stock adecuado.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {lowStockProducts.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-rose-950 truncate max-w-[150px]">
                        {p.name}
                      </span>
                      <span className="font-bold text-rose-800">
                        {p.stock} unid (mín. {p.minimum_stock})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#F2ECE6]">
              <span className="text-[10px] uppercase tracking-wider text-[#8A796F] font-semibold block mb-2">
                Insumos de Producción Críticos
              </span>
              {lowStockMaterials.length === 0 ? (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  ✓ Todos los insumos tienen inventario suficiente.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {lowStockMaterials.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-amber-950 truncate max-w-[150px]">
                        {item.name}
                      </span>
                      <span className="font-bold text-amber-800">
                        {item.current_quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
