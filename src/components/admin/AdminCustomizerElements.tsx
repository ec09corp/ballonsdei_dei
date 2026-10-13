import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  Image as ImageIcon, 
  RotateCcw, 
  Save, 
  Flower2, 
  CircleDot, 
  Candy, 
  HeartHandshake, 
  Ribbon, 
  Box, 
  Crown,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  CustomizerCategory, 
  CustomizerElementItem, 
  CustomizerColor 
} from '../../types/customizer';
import { customizerService } from '../../services/customizerService';
import { STANDARD_COLORS, CATEGORY_LABELS } from '../../data/defaultCustomizerElements';
import { processImageFile } from '../../lib/imageUtils';
import { CartoonIllustration } from '../customizer/CartoonIllustrations';

export const AdminCustomizerElements: React.FC = () => {
  const [elements, setElements] = useState<CustomizerElementItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<CustomizerCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomizerElementItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CustomizerCategory>('flores');
  const [price, setPrice] = useState('2.50');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedColors, setSelectedColors] = useState<CustomizerColor[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await customizerService.getElements('all', false);
      setElements(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory(activeCategory === 'all' ? 'flores' : activeCategory);
    setPrice('2.50');
    setImageUrl('');
    setSelectedColors([STANDARD_COLORS[0], STANDARD_COLORS[1], STANDARD_COLORS[2]]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CustomizerElementItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setImageUrl(item.image_url);
    setSelectedColors(item.available_colors || []);
    setIsActive(item.active);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64 = await processImageFile(file, 600, 0.85);
      setImageUrl(base64);
    } catch (err) {
      console.error('Error processing image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleColorInForm = (col: CustomizerColor) => {
    const exists = selectedColors.some((c) => c.hex === col.hex);
    if (exists) {
      setSelectedColors(selectedColors.filter((c) => c.hex !== col.hex));
    } else {
      setSelectedColors([...selectedColors, col]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numPrice = parseFloat(price) || 0;
    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80';

    if (editingItem) {
      await customizerService.updateElement(editingItem.id, {
        name: name.trim(),
        category,
        price: numPrice,
        image_url: finalImage,
        available_colors: selectedColors,
        default_color: selectedColors[0]?.hex,
        active: isActive,
      });
      setSuccessMsg('Elemento actualizado correctamente.');
    } else {
      await customizerService.addElement({
        name: name.trim(),
        category,
        price: numPrice,
        image_url: finalImage,
        available_colors: selectedColors,
        default_color: selectedColors[0]?.hex,
        active: isActive,
      });
      setSuccessMsg('Elemento agregado a la personalización.');
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(null), 3500);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este elemento del personalizador?')) {
      await customizerService.deleteElement(id);
      loadData();
    }
  };

  const handleToggleActive = async (item: CustomizerElementItem) => {
    await customizerService.updateElement(item.id, { active: !item.active });
    loadData();
  };

  const handleMove = async (item: CustomizerElementItem, direction: 'up' | 'down') => {
    const categoryItems = elements.filter((e) => e.category === item.category);
    const index = categoryItems.findIndex((e) => e.id === item.id);
    if (index < 0) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categoryItems.length) return;

    const targetItem = categoryItems[targetIndex];
    const currentOrder = item.order_index ?? index;
    const targetOrder = targetItem.order_index ?? targetIndex;

    await customizerService.updateElement(item.id, { order_index: targetOrder });
    await customizerService.updateElement(targetItem.id, { order_index: currentOrder });
    loadData();
  };

  const handleResetDefaults = async () => {
    if (window.confirm('¿Deseas restaurar la lista de elementos predeterminados de fábrica?')) {
      await customizerService.resetToDefaults();
      setSuccessMsg('Catálogo de personalización restaurado con éxito.');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadData();
    }
  };

  const filteredElements = elements.filter((e) => {
    if (activeCategory === 'all') return true;
    return e.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#763D8B] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#F6E3BA]" />
            </span>
            <h2 className="text-xl font-bold text-stone-900">
              Personalización de Arreglos
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Gestiona los elementos que los clientes pueden arrastrar y agregar en el lienzo (flores, globos, peluches, cintas, etc.).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Restaurar catálogo inicial"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restaurar Originales</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-[#763D8B] hover:bg-[#602F72] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Elemento</span>
          </button>
        </div>
      </div>

      {/* Success alert message */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2 animate-fade-in shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#763D8B] text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Todos ({elements.length})
        </button>
        {Object.entries(CATEGORY_LABELS).map(([catKey, val]) => {
          const count = elements.filter((e) => e.category === catKey).length;
          const isCurrent = activeCategory === catKey;
          return (
            <button
              type="button"
              key={catKey}
              onClick={() => setActiveCategory(catKey as CustomizerCategory)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-[#763D8B] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span>{val.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isCurrent ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Elements Table / Grid */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-stone-500">
            Cargando elementos del personalizador...
          </div>
        ) : filteredElements.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
              <Sparkles className="w-5 h-5 text-stone-400" />
            </div>
            <p className="text-xs text-stone-500 font-medium">
              No hay elementos en esta categoría.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-2 text-xs text-[#763D8B] font-bold hover:underline"
            >
              + Agregar el primer elemento
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredElements.map((item, idx) => (
              <div 
                key={item.id}
                className="p-3 sm:p-4 flex items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors"
              >
                {/* Left: Thumbnail & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#EADBCE] p-1 shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image_url.startsWith('data:image/svg+xml') || !item.image_url.startsWith('http') ? (
                      <CartoonIllustration
                        type={item.name}
                        color={item.default_color || '#DC2626'}
                        className="w-full h-full pointer-events-none"
                      />
                    ) : (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow-xs"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-stone-900 truncate">
                        {item.name}
                      </span>
                      {!item.active && (
                        <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-medium">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span className="capitalize font-medium text-[#763D8B]">
                        {CATEGORY_LABELS[item.category]?.label || item.category}
                      </span>
                      <span>·</span>
                      <span className="font-bold text-stone-800">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Colors swatches preview */}
                    {item.available_colors && item.available_colors.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-stone-400">Colores:</span>
                        {item.available_colors.map((c) => (
                          <span
                            key={c.hex}
                            className="w-2.5 h-2.5 rounded-full border border-stone-300"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Order Up / Down */}
                  <button
                    type="button"
                    onClick={() => handleMove(item, 'up')}
                    className="p-1.5 hover:bg-stone-200 text-stone-500 rounded-lg cursor-pointer"
                    title="Mover arriba"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(item, 'down')}
                    className="p-1.5 hover:bg-stone-200 text-stone-500 rounded-lg cursor-pointer"
                    title="Mover abajo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Active Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                      item.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-100'
                    }`}
                    title={item.active ? 'Desactivar elemento' : 'Activar elemento'}
                  >
                    {item.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg cursor-pointer"
                    title="Editar elemento"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                    title="Eliminar elemento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT ELEMENT                                 */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-hidden">
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between shrink-0 bg-[#FAF8F5]">
              <h3 className="font-bold text-stone-900 text-base">
                {editingItem ? 'Editar Elemento' : 'Nuevo Elemento del Personalizador'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden text-xs">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Name */}
                <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  Nombre del Elemento:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Rosa Roja Terciopelo"
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-900"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">
                    Categoría:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CustomizerCategory)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-900 bg-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-800 block mb-1">
                    Precio Adicional ($):
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-stone-900"
                  />
                </div>
              </div>

              {/* Image URL or File Upload */}
              <div className="space-y-2">
                <label className="font-semibold text-stone-800 block">
                  Imagen con fondo transparente (PNG / WebP / SVG):
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-stone-300 bg-stone-50 flex items-center justify-center overflow-hidden shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Vista previa" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="https://ejemplo.com/rosa-transparente.png"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full p-2 rounded-xl border border-stone-300 text-stone-900 text-[11px]"
                    />
                    <label className="inline-block px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold rounded-lg cursor-pointer border border-stone-200">
                      {isUploading ? 'Subiendo...' : 'O subir archivo desde mi equipo'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Available Colors Selection */}
              <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  Colores Disponibles para este elemento:
                </label>
                <p className="text-[10px] text-stone-500 mb-2">
                  Selecciona qué colores el cliente podrá elegir en el lienzo interactivo:
                </p>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_COLORS.map((col) => {
                    const isSelected = selectedColors.some((c) => c.hex === col.hex);
                    return (
                      <button
                        type="button"
                        key={col.hex}
                        onClick={() => toggleColorInForm(col)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-[#763D8B] bg-[#763D8B]/10 font-bold text-[#763D8B] shadow-2xs' 
                            : 'border-stone-200 bg-white text-stone-600'
                        }`}
                      >
                        <span 
                          className="w-3 h-3 rounded-full border border-stone-300"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#763D8B]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block">Elemento Activo</span>
                  <span className="text-[10px] text-stone-500">Visible para los clientes en el personalizador</span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#763D8B] cursor-pointer"
                />
              </div>
            </div>

            {/* Sticky Submit Buttons Footer */}
            <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#763D8B] hover:bg-[#602F72] text-white text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
              >
                Guardar Elemento
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
    </div>
  );
};
