import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  FolderTree, 
  AlertCircle, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  Camera, 
  Loader2, 
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
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
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);

  // Gallery file upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setActive(true);
    setDisplayOrder(categories.length + 1);
    setShowManualUrlInput(false);
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
    setShowManualUrlInput(Boolean(cat.image_url && cat.image_url.startsWith('http')));
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setErrorMsg(null);

    try {
      const uploadedUrl = await categoryService.uploadCategoryImage(
        file, 
        editingCategory?.id || `cat-${Date.now()}`
      );
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error procesando la imagen de la galería.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre de la categoría es obligatorio.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const fallbackImg = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80';
    const payload = {
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim() || null,
      image_url: imageUrl.trim() || fallbackImg,
      active,
      display_order: Number(displayOrder) || 1,
    };

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, payload);
        setSuccessMsg('¡Categoría actualizada con éxito!');
      } else {
        await categoryService.createCategory(payload);
        setSuccessMsg('¡Categoría creada con éxito!');
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
          <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-[#C5A059] uppercase mb-1">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Colecciones y Secciones</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2E2421]">
            Gestión de Categorías
          </h1>
          <p className="text-xs text-[#7A6B63] mt-1 font-light">
            Crea colecciones con fotos reales desde tu galería para flores, arreglos, globos, alquileres o temporadas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#763D8B] hover:bg-[#5E2F70] text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="font-bold text-emerald-600 hover:text-emerald-900 cursor-pointer">×</button>
        </div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-[#EDE5DF] p-4 flex gap-4 items-center shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#EDE5DF] relative">
              <img
                src={c.image_url || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=200&q=80'}
                alt={c.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span
                className={`absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                  c.active ? 'bg-emerald-500' : 'bg-stone-300'
                }`}
                title={c.active ? 'Activa' : 'Inactiva'}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-sm font-semibold text-[#2E2421] truncate">
                  {c.name}
                </h3>
              </div>
              <span className="text-[10px] text-[#C5A059] font-medium block mt-0.5">slug: /{c.slug}</span>
              <p className="text-[11px] text-[#6B5A52] font-light line-clamp-2 mt-1">
                {c.description || 'Sin descripción adicional'}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => openEditModal(c)}
                className="p-2 text-[#763D8B] hover:bg-[#FAF4F7] rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#E4D7E0]"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCategoryToDelete({ id: c.id, name: c.name })}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Creación / Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-hidden">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EDE5DF] overflow-hidden flex flex-col max-h-[92dvh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-[#EBE2DB] bg-[#FAF8F5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#763D8B]/10 flex items-center justify-center text-[#763D8B]">
                  <FolderTree className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-semibold text-[#2E2421]">
                  {editingCategory ? `Editar Categoría: ${editingCategory.name}` : 'Crear Nueva Categoría'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#7A6B63] hover:text-[#2E2421] rounded-full cursor-pointer hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden text-xs">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Subir Imagen desde Galería */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#423530] flex items-center justify-between">
                    <span>Imagen de Portada de la Categoría</span>
                    <span className="text-[10px] text-stone-500 font-normal">Galería de fotos o cámara</span>
                  </label>

                  {/* Hidden file input for gallery selection */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    id="category-gallery-input"
                  />

                  {imageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-[#D5C2B8] bg-stone-50 group">
                      <div className="aspect-16/9 w-full max-h-48 overflow-hidden bg-black/5 flex items-center justify-center">
                        <img
                          src={imageUrl}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                        <label
                          htmlFor="category-gallery-input"
                          className="px-3 py-1.5 bg-white text-stone-800 rounded-lg text-[11px] font-semibold cursor-pointer shadow-md hover:bg-stone-100 flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#763D8B]" />
                          <span>Cambiar foto</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[11px] font-semibold cursor-pointer shadow-md hover:bg-rose-700 flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Quitar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#D5C2B8] hover:border-[#763D8B] rounded-2xl p-6 text-center transition-colors bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]">
                      <div className="flex flex-col items-center justify-center space-y-2.5">
                        <div className="w-12 h-12 rounded-full bg-[#763D8B]/10 text-[#763D8B] flex items-center justify-center">
                          {isUploadingImage ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <ImageIcon className="w-6 h-6" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-stone-800">
                            {isUploadingImage ? 'Procesando imagen...' : 'Selecciona una foto desde tu galería'}
                          </p>
                          <p className="text-[11px] text-stone-500 font-light">
                            Compatible con fotos de celular, iPhone, Android o computadora (JPG, PNG, WebP)
                          </p>
                        </div>
                        <label
                          htmlFor="category-gallery-input"
                          className={`mt-1 inline-flex items-center gap-2 px-4 py-2 bg-[#763D8B] hover:bg-[#5E2F70] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all ${
                            isUploadingImage ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Elegir de mi Galería</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Toggle para ingresar URL manual si lo prefiere */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                      className="text-[11px] text-[#763D8B] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>{showManualUrlInput ? 'Ocultar opción de URL manual' : '¿Prefieres pegar un enlace URL de internet?'}</span>
                    </button>

                    {showManualUrlInput && (
                      <div className="mt-2 animate-in fade-in duration-150">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full p-2.5 rounded-xl border border-[#D5C2B8] text-xs bg-white focus:outline-none focus:border-[#763D8B]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label className="text-xs font-semibold text-[#423530] block mb-1">Nombre de la Categoría *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Arreglos Florales, Ramos Buchones, Globos Gigantes..."
                    className="w-full p-2.5 rounded-xl border border-[#D5C2B8] text-xs focus:outline-none focus:border-[#763D8B]"
                  />
                </div>

                {/* Slug opcional */}
                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Slug / Identificador URL (opcional)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-generado si lo dejas en blanco"
                    className="w-full p-2.5 rounded-xl border border-[#D5C2B8] text-xs bg-stone-50/50"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">Descripción Breve</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles sobre esta colección que tus clientes verán..."
                    className="w-full p-2.5 rounded-xl border border-[#D5C2B8] text-xs resize-none"
                  />
                </div>

                {/* Opciones y orden */}
                <div className="flex items-center justify-between pt-2 border-t border-[#EAE3DC]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="rounded text-[#763D8B] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-xs text-[#2E2421]">Categoría Visible en Tienda</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[#7A6B63]">Orden:</label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="w-16 p-1.5 rounded-lg border border-[#D5C2B8] text-center text-xs"
                      min={1}
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="p-4 sm:p-5 border-t border-[#EBE2DB] bg-[#FAF8F5] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D5C2B8] text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingImage}
                  className="px-5 py-2 bg-[#763D8B] hover:bg-[#5E2F70] text-white rounded-xl shadow-xs transition-colors cursor-pointer text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-[#EDE5DF]">
            <h4 className="font-serif text-lg font-medium text-stone-900">¿Eliminar categoría?</h4>
            <p className="text-xs text-stone-600">
              ¿Estás seguro de que deseas eliminar la categoría <strong>"{categoryToDelete.name}"</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium cursor-pointer hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium cursor-pointer hover:bg-rose-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

