import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  RotateCcw,
  DollarSign,
  Tag
} from 'lucide-react';
import { OrderExtraItem } from '../../data/colonDelivery';
import { extrasService } from '../../services/extrasService';

export const AdminExtras: React.FC = () => {
  const [extras, setExtras] = useState<OrderExtraItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<OrderExtraItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'chocolate' | 'peluche' | 'globo' | 'accesorio'>('chocolate');
  const [price, setPrice] = useState<number>(5.00);
  const [description, setDescription] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadExtras = () => {
    setExtras(extrasService.getExtras());
  };

  useEffect(() => {
    loadExtras();
  }, []);

  const openCreateModal = () => {
    setEditingExtra(null);
    setName('');
    setCategory('chocolate');
    setPrice(5.00);
    setDescription('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: OrderExtraItem) => {
    setEditingExtra(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setDescription(item.description);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre del implemento es obligatorio.');
      return;
    }
    if (price < 0) {
      setErrorMsg('El precio no puede ser negativo.');
      return;
    }

    try {
      if (editingExtra) {
        extrasService.updateExtra(editingExtra.id, {
          name: name.trim(),
          category,
          price: Number(price),
          description: description.trim(),
        });
        setSuccessMsg(`Implemento "${name}" actualizado correctamente.`);
      } else {
        extrasService.addExtra({
          name: name.trim(),
          category,
          price: Number(price),
          description: description.trim(),
        });
        setSuccessMsg(`Implemento "${name}" añadido correctamente.`);
      }

      setIsModalOpen(false);
      loadExtras();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error guardando el implemento.');
    }
  };

  const handleDelete = (id: string) => {
    extrasService.deleteExtra(id);
    setDeleteConfirmId(null);
    setSuccessMsg('Implemento eliminado correctamente.');
    loadExtras();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm('¿Deseas restaurar la lista de chocolates e implementos a los valores por defecto?')) {
      extrasService.resetToDefaults();
      loadExtras();
      setSuccessMsg('Implementos restablecidos a los valores originales.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2E2421] flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#763D8B]" />
            <span>Implementos, Chocolates & Extras</span>
          </h1>
          <p className="text-xs text-[#7A6B63] mt-1 font-light">
            Administra los complementos que los clientes pueden añadir a sus arreglos durante el checkout (precios, descripciones y disponibilidad).
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 border border-[#D5C2B8] text-[#55434F] rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
            title="Restaurar a valores predeterminados"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Restaurar Predeterminados</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#763D8B] hover:bg-[#602F72] text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Implemento</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold cursor-pointer">×</button>
        </div>
      )}

      {/* Extras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {extras.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded-xl border border-[#EDE5DF] shadow-2xs flex flex-col justify-between hover:border-[#D5C2B8] transition-all group"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#763D8B]/10 text-[#763D8B]">
                  {item.category === 'chocolate' && '🍫 Chocolate'}
                  {item.category === 'peluche' && '🧸 Peluche'}
                  {item.category === 'globo' && '🎈 Globo Extra'}
                  {item.category === 'accesorio' && '✨ Accesorio'}
                </span>
                <span className="text-sm font-bold text-[#763D8B]">
                  ${item.price.toFixed(2)}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-base font-medium text-[#2E2421]">
                  {item.name}
                </h3>
                <p className="text-xs text-[#7A6B63] font-light mt-1 leading-relaxed">
                  {item.description || 'Sin descripción adicional.'}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-[#F5EFEB] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => openEditModal(item)}
                className="p-1.5 text-stone-600 hover:text-[#763D8B] hover:bg-[#FAF4F7] rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
                title="Editar implemento"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>

              {deleteConfirmId === item.id ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-semibold cursor-pointer"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="p-1 text-stone-500 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar implemento"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-[#EBE2DB] animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#EBE2DB] flex items-center justify-between bg-[#FAF8F5]">
              <h2 className="font-serif text-lg font-medium text-[#2E2421]">
                {editingExtra ? 'Editar Implemento o Chocolate' : 'Nuevo Implemento o Extra'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-500 hover:text-stone-900 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#423530] block mb-1">
                  Nombre del Implemento *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Caja de Bombones Ferrero Rocher (8 uds)"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#D5C2B8] focus:border-[#763D8B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#423530] block mb-1">
                    Categoría *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D5C2B8] focus:border-[#763D8B] focus:outline-none"
                  >
                    <option value="chocolate">Chocolate</option>
                    <option value="peluche">Peluche</option>
                    <option value="globo">Globo Extra</option>
                    <option value="accesorio">Accesorio / Luces</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#423530] block mb-1">
                    Precio ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D5C2B8] focus:border-[#763D8B] focus:outline-none font-semibold text-[#763D8B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#423530] block mb-1">
                  Descripción o Detalles *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción para mostrar al cliente en el selector de extras..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#D5C2B8] focus:border-[#763D8B] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE2DB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D5C2B8] text-[#55434F] text-xs font-medium rounded-lg hover:bg-stone-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#763D8B] hover:bg-[#602F72] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  {editingExtra ? 'Guardar Cambios' : 'Crear Implemento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
