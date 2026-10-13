import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, FolderTree, AlertCircle, Check } from 'lucide-react';
import { Category } from '../../types/database';
import { categoryService } from '../../services/categoryService';

interface AdminCategoriesProps {
  categories: Category[];
  onRefresh: () => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80');
    setActive(true);
    setDisplayOrder(categories.length + 1);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setActive(cat.active);
    setDisplayOrder(cat.display_order || 1);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre de la categoría es obligatorio.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description || null,
      image_url: imageUrl || null,
      active,
      display_order: Number(displayOrder) || 1,
    };

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, payload);
        setSuccessMsg('Categoría actualizada con éxito.');
      } else {
        await categoryService.createCategory(payload);
        setSuccessMsg('Categoría creada con éxito.');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error guardando categoría.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    const { id, name: catName } = categoryToDelete;
    const ok = await categoryService.deleteCategory(id);
    if (ok) {
      setSuccessMsg(`Categoría "${catName}" eliminada correctamente.`);
      onRefresh();
    } else {
      setErrorMsg('No se pudo eliminar la categoría.');
    }
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2E2421]">
            Gestión de Categorías
          </h1>
          <p className="text-xs text-[#7A6B63] mt-1 font-light">
            Crea colecciones dinámicas para flores, regalos, alquileres, eventos o temporadas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8D5844] hover:bg-[#744533] text-white rounded-lg text-xs font-medium uppercase tracking-wider shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-[#EDE5DF] p-4 flex gap-4 items-center shadow-2xs hover:shadow-sm transition-all"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#EDE5DF]">
              <img
                src={c.image_url || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=200&q=80'}
                alt={c.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif text-sm font-medium text-[#2E2421] truncate">
                  {c.name}
                </h3>
                <span
                  className={`w-2 h-2 rounded-full ${
                    c.active ? 'bg-emerald-500' : 'bg-stone-300'
                  }`}
                  title={c.active ? 'Activa' : 'Inactiva'}
                />
              </div>
              <span className="text-[10px] text-[#8A796F] block mt-0.5">slug: /{c.slug}</span>
              <p className="text-[11px] text-[#6B5A52] font-light line-clamp-1 mt-1">
                {c.description || 'Sin descripción adicional'}
              </p>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={() => openEditModal(c)}
                className="p-1.5 text-[#8D5844] hover:bg-[#F2ECE6] rounded-md transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCategoryToDelete({ id: c.id, name: c.name })}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-hidden">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#EDE5DF] overflow-hidden flex flex-col max-h-[92dvh]">
            <div className="p-4 sm:p-5 border-b border-[#EBE2DB] bg-[#FAF8F5] flex items-center justify-between shrink-0">
              <h3 className="font-serif text-lg font-medium text-[#2E2421]">
                {editingCategory ? `Editar Categoría: ${editingCategory.name}` : 'Crear Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#7A6B63] hover:text-[#2E2421] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden text-xs">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMsg}</span>
                  </div>
                )}

              <div>
                <label className="text-xs font-medium text-[#423530] block mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Centros de Mesa"
                  className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#423530] block mb-1">URL de Imagen</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#423530] block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve reseña que aparecerá en la tienda..."
                  className="w-full p-2.5 rounded-lg border border-[#D5C2B8]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-[#8D5844] w-4 h-4"
                  />
                  <span className="font-medium text-[#2E2421]">Categoría Activa</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-[#7A6B63]">Orden:</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-16 p-1.5 rounded border border-[#D5C2B8] text-center"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#EBE2DB] bg-white flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-[#D5C2B8] rounded-lg text-[#423530] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#8D5844] hover:bg-[#744533] text-white rounded-lg font-medium cursor-pointer"
              >
                {isSaving ? 'Guardando...' : 'Guardar Categoría'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-rose-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#2E2421]">
                ¿Eliminar categoría?
              </h3>
              <p className="text-xs text-[#7A6B63] mt-1">
                ¿Estás seguro de que deseas eliminar la categoría <strong>"{categoryToDelete.name}"</strong>?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Eliminar
              </button>
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F2ECE6] text-[#423530] border border-[#D5C2B8] text-xs font-medium uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
