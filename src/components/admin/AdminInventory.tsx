import React, { useState } from 'react';
import { Warehouse, Search, Plus, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Product } from '../../types/database';
import { productService } from '../../services/productService';

interface AdminInventoryProps {
  products: Product[];
  onRefresh: () => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({ products, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    if (p.available_for_rental) return false; // Rentals handled in rentals tab
    const isOut = p.stock <= 0;
    const isLow = p.stock > 0 && p.stock <= p.minimum_stock;

    if (filterType === 'out' && !isOut) return false;
    if (filterType === 'low' && !isLow) return false;

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s);
    }
    return true;
  });

  const handleStockAdjust = async (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    setUpdatingId(productId);
    try {
      await productService.updateStock(productId, newStock);
      onRefresh();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2E2421]">
          Control de Inventario de Productos
        </h1>
        <p className="text-xs text-[#7A6B63] mt-1 font-light">
          Supervisa las existencias de arreglos, peluches y sombrereras terminadas. Ajusta unidades rápidamente con +/-.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EDE5DF] shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#8A796F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por producto o SKU..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8] text-[#2E2421] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-[#8D5844] text-white'
                : 'bg-[#FAF8F5] text-[#5C4D46] hover:bg-[#F2ECE6]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'low'
                ? 'bg-amber-600 text-white'
                : 'bg-[#FAF8F5] text-[#5C4D46] hover:bg-[#F2ECE6]'
            }`}
          >
            Stock Bajo
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'out'
                ? 'bg-rose-600 text-white'
                : 'bg-[#FAF8F5] text-[#5C4D46] hover:bg-[#F2ECE6]'
            }`}
          >
            Agotados
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EDE5DF] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EBE2DB] text-[#7A6B63] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Stock Mínimo</th>
                <th className="py-3 px-4">Stock Actual</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Ajuste Rápido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE6]">
              {filtered.map((p) => {
                const isOut = p.stock <= 0;
                const isLow = p.stock > 0 && p.stock <= p.minimum_stock;

                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#2E2421]">{p.name}</div>
                      <div className="text-[10px] text-[#8A796F]">
                        {p.gift_type === 'fixed'
                          ? 'Regalo Fijo'
                          : p.gift_type === 'variable'
                          ? 'Regalo Variable'
                          : 'Arreglo Floral'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#5C4D46]">{p.sku}</td>
                    <td className="py-3.5 px-4 text-[#5C4D46]">{p.minimum_stock} unidades</td>
                    <td className="py-3.5 px-4 font-bold text-sm text-[#2E2421]">
                      {p.stock} unidades
                    </td>
                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" />
                          Agotado
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          Stock Bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          Disponible
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 border border-[#D5C2B8] rounded-lg bg-white p-0.5">
                        <button
                          onClick={() => handleStockAdjust(p.id, p.stock, -1)}
                          disabled={p.stock <= 0 || updatingId === p.id}
                          className="p-1 hover:bg-[#F2ECE6] rounded text-[#423530] disabled:opacity-30"
                          title="Restar 1 unidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs">
                          {p.stock}
                        </span>
                        <button
                          onClick={() => handleStockAdjust(p.id, p.stock, 1)}
                          disabled={updatingId === p.id}
                          className="p-1 hover:bg-[#F2ECE6] rounded text-[#423530]"
                          title="Sumar 1 unidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
