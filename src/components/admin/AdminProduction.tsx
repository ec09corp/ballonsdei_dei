import React, { useState, useEffect } from 'react';
import { 
  Hammer, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  Edit, 
  History, 
  X, 
  Check, 
  Layers,
  Link,
  Trash2
} from 'lucide-react';
import { ProductionItem, ProductionMovement, MovementType, Product } from '../../types/database';
import { productionService } from '../../services/productionService';

interface AdminProductionProps {
  products: Product[];
}

export const AdminProduction: React.FC<AdminProductionProps> = ({ products }) => {
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [movements, setMovements] = useState<ProductionMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el insumo "${itemName}"?`)) {
      return;
    }
    const ok = await productionService.deleteItem(itemId);
    if (ok) {
      setFeedbackMsg({ type: 'success', text: `Insumo "${itemName}" eliminado.` });
      loadData();
    } else {
      setFeedbackMsg({ type: 'error', text: 'No se pudo eliminar el insumo.' });
    }
  };

  // Modal states
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);

  // New/edit item form
  const [editingItem, setEditingItem] = useState<ProductionItem | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cajas');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('unidades');
  const [currentQuantity, setCurrentQuantity] = useState<number>(20);
  const [minimumQuantity, setMinimumQuantity] = useState<number>(5);
  const [cost, setCost] = useState<number>(2.5);
  const [supplier, setSupplier] = useState('');

  // Movement form
  const [movementItemId, setMovementItemId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('entry');
  const [movementQty, setMovementQty] = useState<number>(10);
  const [movementReason, setMovementReason] = useState('');

  // Product materials relationship form
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productMaterials, setProductMaterials] = useState<
    { production_item_id: string; quantity_required: number }[]
  >([]);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    'Cajas',
    'Bolsas',
    'Cintas',
    'Papel',
    'Flores',
    'Globos',
    'Bases',
    'Tarjetas',
    'Peluches',
    'Otros',
  ];

  const loadData = async () => {
    setIsLoading(true);
    const [fetchedItems, fetchedMovements] = await Promise.all([
      productionService.getItems(),
      productionService.getMovements(),
    ]);
    setItems(fetchedItems);
    setMovements(fetchedMovements);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateItem = () => {
    setEditingItem(null);
    setName('');
    setCategory('Cajas');
    setDescription('');
    setUnit('unidades');
    setCurrentQuantity(20);
    setMinimumQuantity(5);
    setCost(2.5);
    setSupplier('');
    setIsItemModalOpen(true);
  };

  const openEditItem = (item: ProductionItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setDescription(item.description || '');
    setUnit(item.unit);
    setCurrentQuantity(item.current_quantity);
    setMinimumQuantity(item.minimum_quantity);
    setCost(item.cost);
    setSupplier(item.supplier || '');
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      category,
      description,
      unit,
      current_quantity: Number(currentQuantity),
      minimum_quantity: Number(minimumQuantity),
      cost: Number(cost),
      supplier: supplier || null,
    };

    if (editingItem) {
      await productionService.updateItem(editingItem.id, payload);
      setFeedbackMsg({ type: 'success', text: 'Insumo de producción actualizado.' });
    } else {
      await productionService.createItem(payload);
      setFeedbackMsg({ type: 'success', text: 'Insumo de producción registrado.' });
    }

    setIsItemModalOpen(false);
    loadData();
  };

  const openMovementModal = (item?: ProductionItem) => {
    setMovementItemId(item?.id || items[0]?.id || '');
    setMovementType('entry');
    setMovementQty(5);
    setMovementReason('');
    setIsMovementModalOpen(true);
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementItemId || movementQty <= 0) return;

    const ok = await productionService.recordMovement(
      movementItemId,
      movementType,
      movementQty,
      movementReason || (movementType === 'entry' ? 'Entrada manual' : 'Salida manual')
    );

    if (ok) {
      setFeedbackMsg({ type: 'success', text: 'Movimiento de inventario registrado correctamente.' });
      setIsMovementModalOpen(false);
      loadData();
    } else {
      setFeedbackMsg({ type: 'error', text: 'No se pudo registrar el movimiento.' });
    }
  };

  // Open recipe / relation modal
  const openRelationModal = async (product: Product) => {
    setSelectedProductId(product.id);
    const existing = await productionService.getProductMaterials(product.id);
    setProductMaterials(
      existing.map((e) => ({
        production_item_id: e.production_item_id,
        quantity_required: e.quantity_required,
      }))
    );
    setIsRelationModalOpen(true);
  };

  const handleSaveRelations = async () => {
    await productionService.setProductMaterials(selectedProductId, productMaterials);
    setFeedbackMsg({ type: 'success', text: 'Relación de insumos del producto guardada.' });
    setIsRelationModalOpen(false);
  };

  const addMaterialRow = () => {
    if (items.length === 0) return;
    setProductMaterials((prev) => [
      ...prev,
      { production_item_id: items[0].id, quantity_required: 1 },
    ]);
  };

  const removeMaterialRow = (idx: number) => {
    setProductMaterials((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2E2421]">
            Producción e Insumos
          </h1>
          <p className="text-xs text-[#7A6B63] mt-1 font-light">
            Administra los insumos de taller (cajitas, bolsas, cintas, papel, rosas, globos) y registra entradas o salidas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => openMovementModal()}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F2ECE6] text-[#423530] border border-[#D5C2B8] rounded-lg text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Registrar Movimiento</span>
          </button>

          <button
            onClick={openCreateItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8D5844] hover:bg-[#744533] text-white rounded-lg text-xs font-medium uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Insumo</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Insumos Table */}
      <div className="bg-white rounded-2xl border border-[#EDE5DF] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#EBE2DB] bg-[#FAF8F5] flex items-center justify-between">
          <h3 className="font-serif text-base font-medium text-[#2E2421]">
            Catálogo de Insumos & Materias Primas ({items.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EBE2DB] text-[#7A6B63] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Insumo</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Stock Actual</th>
                <th className="py-3 px-4">Mínimo</th>
                <th className="py-3 px-4">Costo Est.</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE6]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-4 font-medium text-[#2E2421]">
                    {item.name}
                    {item.description && (
                      <span className="block text-[10px] text-[#8A796F] font-normal truncate max-w-xs">
                        {item.description}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#5C4D46]">{item.category}</td>
                  <td className="py-3.5 px-4 font-bold text-[#2E2421]">
                    {item.current_quantity} {item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-[#7A6B63]">
                    {item.minimum_quantity} {item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-[#5C4D46]">${item.cost.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-[#7A6B63]">{item.supplier || '—'}</td>
                  <td className="py-3.5 px-4">
                    {item.status === 'out_of_stock' ? (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-semibold">
                        Agotado
                      </span>
                    ) : item.status === 'low_stock' ? (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                        Stock Bajo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                        Disponible
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openMovementModal(item)}
                        className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded"
                        title="Registrar entrada/salida rápida"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditItem(item)}
                        className="p-1.5 text-[#8D5844] hover:bg-[#F2ECE6] rounded"
                        title="Editar insumo"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                        title="Eliminar insumo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product-Materials Recipe Association Section */}
      <div className="p-5 bg-white rounded-2xl border border-[#EDE5DF] shadow-2xs space-y-4">
        <div>
          <h3 className="font-serif text-base font-medium text-[#2E2421] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8D5844]" />
            <span>Asociación de Insumos a Productos (Recetas de Fabricación)</span>
          </h3>
          <p className="text-xs text-[#7A6B63] font-light mt-0.5">
            Configura qué insumos y cantidades consume cada arreglo o sombrerera terminada.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.slice(0, 6).map((prod) => (
            <div
              key={prod.id}
              className="p-3 rounded-xl border border-[#EDE5DF] bg-[#FAF8F5] flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <span className="font-medium text-xs text-[#2E2421] block truncate">
                  {prod.name}
                </span>
                <span className="text-[10px] text-[#8A796F] font-mono">{prod.sku}</span>
              </div>
              <button
                onClick={() => openRelationModal(prod)}
                className="px-2.5 py-1.5 bg-white hover:bg-[#EFE8E2] border border-[#D5C2B8] rounded text-[11px] font-medium text-[#423530] shrink-0 transition-colors"
              >
                Insumos
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Movements History */}
      <div className="bg-white rounded-2xl border border-[#EDE5DF] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#EBE2DB] bg-[#FAF8F5]">
          <h3 className="font-serif text-base font-medium text-[#2E2421]">
            Historial de Movimientos de Insumos
          </h3>
        </div>
        <div className="divide-y divide-[#F2ECE6] max-h-56 overflow-y-auto">
          {movements.map((m) => (
            <div key={m.id} className="p-3 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    m.movement_type === 'entry'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {m.movement_type === 'entry' ? (
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <span className="font-semibold text-[#2E2421] block">{m.item_name}</span>
                  <span className="text-[10px] text-[#7A6B63]">{m.reason}</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`font-bold block ${
                    m.movement_type === 'entry' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {m.movement_type === 'entry' ? '+' : '-'}
                  {m.quantity}
                </span>
                <span className="text-[10px] text-[#A68F83]">
                  {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Hoy'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: New / Edit Item */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#EDE5DF] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#EBE2DB] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium text-[#2E2421]">
                {editingItem ? `Editar Insumo: ${editingItem.name}` : 'Registrar Nuevo Insumo'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 text-[#7A6B63] hover:text-[#2E2421]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-[#423530] block mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Cintas de Seda Rosada"
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="unidades, pliegos, rollos, tallos..."
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">Cantidad Actual</label>
                  <input
                    type="number"
                    required
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">Cantidad Mínima</label>
                  <input
                    type="number"
                    required
                    value={minimumQuantity}
                    onChange={(e) => setMinimumQuantity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">Costo Unitario ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">Proveedor (Opcional)</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Ej. Importadora Floral"
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#423530] block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE2DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 border border-[#D5C2B8] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8D5844] hover:bg-[#744533] text-white rounded-lg font-medium"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Movement */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#EDE5DF] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#EBE2DB] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium text-[#2E2421]">
                Registrar Movimiento de Insumo
              </h3>
              <button onClick={() => setIsMovementModalOpen(false)}>
                <X className="w-5 h-5 text-[#7A6B63]" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-xs font-medium text-[#423530] block mb-1">Insumo *</label>
                <select
                  value={movementItemId}
                  onChange={(e) => setMovementItemId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.current_quantity} {it.unit} disponibles)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">Tipo</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value as MovementType)}
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  >
                    <option value="entry">Entrada (+) Reabastecimiento</option>
                    <option value="exit">Salida (-) Uso en Taller / Merma</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementQty}
                    onChange={(e) => setMovementQty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#423530] block mb-1">Motivo / Observación</label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Ej. Factura proveedor #3304 o Arreglo especial"
                  className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE2DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 border border-[#D5C2B8] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8D5844] hover:bg-[#744533] text-white rounded-lg font-medium"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Associate Insumos to Product */}
      {isRelationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#EDE5DF] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#EBE2DB] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#2E2421]">
                  Insumos Necesarios para este Producto
                </h3>
                <span className="text-[10px] text-[#7A6B63]">
                  Se descontarán automáticamente en la preparación.
                </span>
              </div>
              <button onClick={() => setIsRelationModalOpen(false)}>
                <X className="w-5 h-5 text-[#7A6B63]" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {productMaterials.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={row.production_item_id}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProductMaterials((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, production_item_id: val } : r))
                        );
                      }}
                      className="flex-1 p-2 rounded border border-[#D5C2B8]"
                    >
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name} ({it.unit})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={row.quantity_required}
                      onChange={(e) => {
                        const q = Number(e.target.value);
                        setProductMaterials((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, quantity_required: q } : r))
                        );
                      }}
                      className="w-20 p-2 rounded border border-[#D5C2B8] text-center"
                    />

                    <button
                      type="button"
                      onClick={() => removeMaterialRow(idx)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addMaterialRow}
                className="w-full py-2 bg-[#FAF8F5] border border-dashed border-[#D5C2B8] rounded-lg text-[#8D5844] font-medium"
              >
                + Agregar Insumo a la Lista
              </button>

              <div className="pt-3 border-t border-[#EBE2DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRelationModalOpen(false)}
                  className="px-4 py-2 border border-[#D5C2B8] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveRelations}
                  className="px-5 py-2 bg-[#8D5844] hover:bg-[#744533] text-white rounded-lg font-medium"
                >
                  Guardar Relación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
