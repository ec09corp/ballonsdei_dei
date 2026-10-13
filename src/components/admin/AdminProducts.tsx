import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Check, 
  AlertCircle,
  Eye,
  Star,
  Sparkles,
  Loader2,
  FolderOpen,
  Copy,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { Product, Category, GiftType, ProductType } from '../../types/database';
import { productService } from '../../services/productService';
import { processImageFile } from '../../lib/imageUtils';
import { isSupabaseConfigured, getSupabasePermissionFixScript } from '../../lib/supabase';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
}

interface ImageSlot {
  file?: File;
  url: string;
  position: 1 | 2 | 3 | 4;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  categories,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [previousPrice, setPreviousPrice] = useState<number | ''>('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [giftType, setGiftType] = useState<GiftType>('none');
  const [stock, setStock] = useState<number>(10);
  const [minimumStock, setMinimumStock] = useState<number>(2);
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [availableForRental, setAvailableForRental] = useState(false);
  const [rentalPrice, setRentalPrice] = useState<number | ''>('');
  const [rentalDeposit, setRentalDeposit] = useState<number | ''>('');
  const [rentalConditions, setRentalConditions] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');

  // 4 image slots
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([
    { url: '', position: 1 },
    { url: '', position: 2 },
    { url: '', position: 3 },
    { url: '', position: 4 },
  ]);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [permissionNotice, setPermissionNotice] = useState<boolean>(false);
  const [copiedSqlFix, setCopiedSqlFix] = useState<boolean>(false);

  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);

  const handleCopyPermissionFix = () => {
    const script = getSupabasePermissionFixScript();
    navigator.clipboard?.writeText(script);
    setCopiedSqlFix(true);
    setTimeout(() => setCopiedSqlFix(false), 3000);
  };

  const handleSyncWithSupabase = async () => {
    setIsSyncingSupabase(true);
    setErrorMsg(null);
    try {
      const res = await productService.syncAllProductsToSupabase();
      if (res.success) {
        setSuccessMsg(`¡Sincronización exitosa! ${res.syncedCount} producto(s) guardados y sincronizados en Supabase.`);
        onRefresh();
      } else {
        setErrorMsg(res.error || 'No se pudo sincronizar con Supabase. Verifica tus credenciales en Ajustes > Supabase.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al sincronizar con Supabase.');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        (p.tags && String(p.tags).toLowerCase().includes(s))
      );
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setDescription('');
    setPrice(45);
    setPreviousPrice('');
    setSku(`BD-${Date.now().toString().slice(-4)}`);
    setCategoryId(categories[0]?.id || 'cat-flores');
    setGiftType('none');
    setStock(10);
    setMinimumStock(3);
    setActive(true);
    setFeatured(false);
    setIsNew(true);
    setAvailableForRental(false);
    setRentalPrice('');
    setRentalDeposit('');
    setRentalConditions('');
    setSize('');
    setColor('');
    // Start with blank slots so user can upload their own pictures cleanly
    setImageSlots([
      { url: '', position: 1 },
      { url: '', position: 2 },
      { url: '', position: 3 },
      { url: '', position: 4 },
    ]);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description || '');
    setPrice(p.price);
    setPreviousPrice(p.previous_price || '');
    setSku(p.sku);
    setCategoryId(p.category_id);
    setGiftType(p.gift_type || 'none');
    setStock(p.stock);
    setMinimumStock(p.minimum_stock);
    setActive(p.active);
    setFeatured(p.featured);
    setIsNew(p.is_new);
    setAvailableForRental(p.available_for_rental);
    setRentalPrice(p.rental_price || '');
    setRentalDeposit(p.rental_deposit || '');
    setRentalConditions(p.rental_conditions || '');
    setSize(p.size || '');
    setColor(p.color || '');

    // Setup 4 slots from existing product images
    const slots: ImageSlot[] = [1, 2, 3, 4].map((pos) => {
      const match = (p.images || []).find((img) => img.position === pos);
      return {
        url: match?.image_url || '',
        position: pos as 1 | 2 | 3 | 4,
      };
    });
    setImageSlots(slots);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (position: 1 | 2 | 3 | 4, file: File | null) => {
    if (!file) return;

    setErrorMsg(null);
    setUploadingSlot(position);

    // Instant local preview so user sees the picture immediately
    try {
      const instantPreview = URL.createObjectURL(file);
      setImageSlots((prev) =>
        prev.map((slot) =>
          slot.position === position ? { ...slot, file, url: instantPreview } : slot
        )
      );
    } catch {}

    try {
      // Process and compress image file to persistent Data URL (never breaks or expires)
      const dataUrl = await processImageFile(file);
      setImageSlots((prev) =>
        prev.map((slot) =>
          slot.position === position ? { ...slot, file, url: dataUrl } : slot
        )
      );
    } catch (err: any) {
      console.warn('Canvas compression warning:', err);
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleRemoveImageSlot = (position: 1 | 2 | 3 | 4) => {
    setImageSlots((prev) =>
      prev.map((slot) =>
        slot.position === position ? { position, url: '', file: undefined } : slot
      )
    );
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre del producto es obligatorio.');
      return;
    }

    let activeImages = imageSlots.filter((s) => s.url && s.url.trim().length > 0);
    // If user hasn't chosen an image, assign an elegant floral placeholder so they are NEVER blocked!
    if (activeImages.length === 0) {
      activeImages = [
        {
          url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
          position: 1 as const,
        },
      ];
    }

    setIsSaving(true);
    setErrorMsg(null);

    const productPayload: Partial<Product> = {
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      price: Number(price) || 0,
      previous_price: previousPrice !== '' ? Number(previousPrice) : null,
      sku: sku.trim() || `BD-${Date.now().toString().slice(-4)}`,
      category_id: categoryId,
      product_type: availableForRental ? 'rental' : 'product',
      gift_type: giftType,
      stock: Number(stock) || 0,
      minimum_stock: Number(minimumStock) || 2,
      active,
      featured,
      is_new: isNew,
      available_for_rental: availableForRental,
      rental_price: rentalPrice !== '' ? Number(rentalPrice) : null,
      rental_deposit: rentalDeposit !== '' ? Number(rentalDeposit) : null,
      rental_conditions: rentalConditions || null,
      size: size || null,
      color: color || null,
    };

    try {
      if (editingProduct) {
        const { product, error } = await productService.updateProduct(
          editingProduct.id,
          productPayload,
          activeImages
        );
        if (error) throw error;
        setSuccessMsg('¡Producto actualizado correctamente!');
      } else {
        const { product, error, savedLocally } = await productService.createProduct(
          productPayload,
          activeImages
        );
        if (savedLocally && error) {
          if (error.message?.includes('profiles') || error.message?.includes('42501') || error.message?.includes('permission')) {
            setPermissionNotice(true);
            setSuccessMsg('Producto guardado en tu catálogo local. Se requiere otorgar permisos en Supabase para sincronizar.');
          } else {
            setSuccessMsg(`Producto guardado en tu catálogo local. (${error.message})`);
          }
        } else if (savedLocally) {
          setSuccessMsg('¡Producto guardado exitosamente en tu catálogo!');
        } else {
          setSuccessMsg('¡Producto guardado y sincronizado con Supabase con éxito!');
        }
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error guardando el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const { id, name: prodName } = productToDelete;
    const ok = await productService.deleteProduct(id);
    if (ok) {
      setSuccessMsg(`Producto "${prodName}" eliminado correctamente.`);
      onRefresh();
    } else {
      setErrorMsg('No se pudo eliminar el producto.');
    }
    setProductToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#2E2421]">
            Catálogo de Productos
          </h1>
          <p className="text-xs text-[#7A6B63] mt-1 font-light">
            Crea y administra productos, flores, sombrereras fijas, personalizables, peluches y mobiliario de alquiler con hasta 4 fotografías.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-white shadow-2xs">
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Nube Supabase Conectada</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700" title="Para sincronizar en la nube, ve a Ajustes > Supabase">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Guardado Local Activo</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSyncWithSupabase}
            disabled={isSyncingSupabase}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 border border-[#D5C2B8] text-[#423530] rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Sincronizar todos los productos con tu base de datos Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#763D8B] ${isSyncingSupabase ? 'animate-spin' : ''}`} />
            <span>{isSyncingSupabase ? 'Sincronizando...' : 'Sincronizar Supabase'}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#763D8B] hover:bg-[#602F72] text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Supabase Permissions 42501 Alert Banner */}
      {permissionNotice && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">
                Aviso de Supabase: Permiso denegado para tabla profiles (Error 42501)
              </p>
              <p className="text-[11px] text-amber-800 font-light mt-0.5">
                Tu producto se guardó seguro en tu catálogo. Para que Supabase lo almacene en la nube, debes otorgar permisos en tu SQL Editor.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyPermissionFix}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Copiar SQL para resolver error 42501"
            >
              {copiedSqlFix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSqlFix ? '¡Script Copiado!' : 'Copiar Solución SQL'}</span>
            </button>
            <button
              onClick={() => setPermissionNotice(false)}
              className="text-amber-700 hover:text-amber-900 text-xs px-2 py-1 font-medium"
            >
              Descartar
            </button>
          </div>
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
            placeholder="Buscar por nombre, SKU o tags..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8] text-[#2E2421] focus:outline-none focus:border-[#8D5844]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-[#7A6B63] whitespace-nowrap">Categoría:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs p-2 rounded-lg border border-[#D5C2B8] bg-white text-[#2E2421] focus:outline-none"
          >
            <option value="all">Todas las categorías ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Display: Responsive Cards on Mobile + Table on Desktop */}
      <div className="bg-white rounded-2xl border border-[#EDE5DF] shadow-2xs overflow-hidden">
        {/* Mobile View: Touch-friendly cards */}
        <div className="block md:hidden divide-y divide-[#F2ECE6]">
          {filteredProducts.map((p) => {
            const mainImg = p.images?.[0]?.image_url || '';
            const imgCount = p.images?.length || 0;
            return (
              <div key={p.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF8F5]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-[#FAF8F5] overflow-hidden border border-[#EDE5DF] shrink-0">
                    {mainImg ? (
                      <img src={mainImg} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#B3A298]">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-[#2E2421] text-xs truncate">{p.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-xs text-[#8D5844]">
                        ${(p.available_for_rental && p.rental_price ? p.rental_price : p.price).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-[#8A796F]">
                        • {p.stock} en stock
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {p.gift_type === 'fixed' && (
                        <span className="px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 text-[9px] font-medium">
                          Fijo
                        </span>
                      )}
                      {p.gift_type === 'variable' && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[9px] font-medium">
                          A tu Gusto
                        </span>
                      )}
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-medium ${p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                        {p.active ? 'Activo' : 'Oculto'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 text-[#8D5844] bg-[#FAF8F5] hover:bg-[#F2ECE6] border border-[#E3D7CE] rounded-lg transition-colors cursor-pointer"
                    aria-label="Editar producto"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProductToDelete({ id: p.id, name: p.name })}
                    className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Data Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EBE2DB] text-[#7A6B63] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Foto Principal</th>
                <th className="py-3 px-4">Producto / SKU</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Fotos</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE6]">
              {filteredProducts.map((p) => {
                const mainImg = p.images?.[0]?.image_url || '';
                const imgCount = p.images?.length || 0;
                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] overflow-hidden border border-[#EDE5DF]">
                        {mainImg ? (
                          <img src={mainImg} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#B3A298]">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#2E2421] max-w-xs truncate">{p.name}</div>
                      <div className="text-[10px] text-[#8A796F]">{p.sku}</div>
                    </td>
                    <td className="py-3 px-4">
                      {p.available_for_rental ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                          Alquiler
                        </span>
                      ) : p.gift_type === 'fixed' ? (
                        <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 text-[10px] font-medium">
                          Regalo Fijo
                        </span>
                      ) : p.gift_type === 'variable' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">
                          Personalizable
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-medium">
                          Venta Floral
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#2E2421]">
                      ${(p.available_for_rental && p.rental_price ? p.rental_price : p.price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          p.stock <= 0
                            ? 'text-rose-600'
                            : p.stock <= p.minimum_stock
                            ? 'text-amber-600'
                            : 'text-[#2E2421]'
                        }`}
                      >
                        {p.stock} unid.
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E3D7CE] text-[10px] text-[#6B5A52]">
                        {imgCount} / 4 fotos
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-[#8D5844] hover:bg-[#F2ECE6] rounded-md transition-colors"
                          title="Editar producto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete({ id: p.id, name: p.name })}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-xs overflow-hidden">
          <div className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#EDE5DF] overflow-hidden flex flex-col h-[94dvh] max-h-[94dvh]">
            <div className="p-4 sm:p-5 border-b border-[#EBE2DB] bg-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-[#8D5844] uppercase font-bold tracking-wider">
                  Administrador de Inventario
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2E2421]">
                  {editingProduct ? `Editar: ${editingProduct.name}` : 'Crear Nuevo Producto'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#7A6B63] hover:text-[#2E2421] hover:bg-[#F2ECE6] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 overflow-hidden text-xs">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

              {/* 4 IMAGES UPLOAD SECTION */}
              <div className="p-4 bg-white rounded-xl border border-[#EDE5DF] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-medium text-[#2E2421]">
                      Fotografías del Producto (Hasta 4 imágenes)
                    </h4>
                    <p className="text-[11px] text-[#7A6B63] font-light">
                      La <strong>Foto 1</strong> es la principal. Puedes seleccionar imágenes desde tus archivos, fotos del celular o pegar una URL.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {imageSlots.map((slot) => {
                    const isUploading = uploadingSlot === slot.position;
                    return (
                      <div
                        key={slot.position}
                        className="border border-[#D5C2B8] rounded-xl p-2.5 bg-[#FAF8F5] flex flex-col items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="w-full flex items-center justify-between text-[11px] text-[#6B5A52] font-semibold">
                          <span className="flex items-center gap-1">
                            {slot.position === 1 ? (
                              <>
                                <Star className="w-3 h-3 text-[#C19B65] fill-[#C19B65]" />
                                <span>Foto 1 (Principal)</span>
                              </>
                            ) : (
                              <span>Foto {slot.position}</span>
                            )}
                          </span>
                          {slot.url && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImageSlot(slot.position)}
                              className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
                              title="Quitar foto"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Image preview box */}
                        <div className="w-full aspect-square rounded-lg bg-[#EFE8E2] overflow-hidden flex items-center justify-center relative border border-[#E3D7CE]">
                          {isUploading ? (
                            <div className="text-center p-2 flex flex-col items-center justify-center gap-1">
                              <Loader2 className="w-6 h-6 animate-spin text-[#763D8B]" />
                              <span className="text-[10px] text-stone-600 font-medium">Procesando...</span>
                            </div>
                          ) : slot.url ? (
                            <img
                              src={slot.url}
                              alt={`Preview ${slot.position}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center text-[#A68F83] p-2">
                              <Upload className="w-6 h-6 mx-auto mb-1 opacity-60" />
                              <span className="text-[10px] block font-light">Sin foto</span>
                            </div>
                          )}
                        </div>

                        {/* File upload input button */}
                        <label className="w-full py-2 px-2 bg-white hover:bg-[#F2ECE6] border border-[#D5C2B8] rounded-md text-center text-[10px] font-semibold text-[#382B26] cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
                          <FolderOpen className="w-3.5 h-3.5 text-[#763D8B]" />
                          <span>{slot.url ? 'Cambiar foto' : 'Subir desde archivo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploading}
                            onClick={(e) => {
                              (e.target as HTMLInputElement).value = '';
                            }}
                            onChange={(e) =>
                              handleImageFileChange(slot.position, e.target.files?.[0] || null)
                            }
                            className="hidden"
                          />
                        </label>

                        {/* Optional manual URL input */}
                        <input
                          type="text"
                          placeholder="o pegar URL de imagen..."
                          value={slot.url.startsWith('data:') ? '' : slot.url}
                          onChange={(e) => {
                            const newUrl = e.target.value;
                            setImageSlots((prev) =>
                              prev.map((s) => (s.position === slot.position ? { ...s, url: newUrl } : s))
                            );
                          }}
                          className="w-full text-[9px] px-1.5 py-1 bg-white border border-[#E3D7CE] rounded focus:border-[#763D8B] text-stone-600 truncate"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Sombrerera Velvet Rosada"
                    className="w-full p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Código SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Categoría *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Modalidad del Producto / Regalo *
                  </label>
                  <select
                    value={giftType}
                    onChange={(e) => setGiftType(e.target.value as GiftType)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421] font-medium"
                  >
                    <option value="fixed">🎁 Regalo Fijo (No cambia, se vende tal cual con su foto y precio)</option>
                    <option value="variable">✨ Regalo Variable (Interactivo: cliente elige globo, frase, colores, lazo, peluche)</option>
                    <option value="none">Floristería / Producto estándar</option>
                  </select>
                  {giftType === 'variable' && (
                    <p className="text-[11px] text-[#763D8B] bg-[#763D8B]/10 p-2 rounded mt-1.5 font-normal">
                      ✨ <strong>Modo Interactivo Activado:</strong> Cuando el cliente abra este producto, se le desplegará el configurador interactivo con selección de tipo de globo, mensaje en vinilo, colores, lazo, peluche y extras.
                    </p>
                  )}
                  {giftType === 'fixed' && (
                    <p className="text-[11px] text-stone-600 bg-stone-100 p-2 rounded mt-1.5 font-light">
                      📦 <strong>Regalo Fijo:</strong> Se vende exactamente como viene en tu foto y descripción, sin pedirle al cliente que arme el globo o peluche.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Precio ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Precio Anterior ($ USD tachado opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={previousPrice}
                    onChange={(e) =>
                      setPreviousPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Dejar vacío si no hay oferta"
                    className="w-full p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#423530] block mb-1">
                    Stock Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    required
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#423530] block mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalla los materiales, cantidad de rosas, dimensiones y presentación..."
                  className="w-full p-2.5 rounded-lg bg-white border border-[#D5C2B8] text-[#2E2421]"
                />
              </div>

              {/* Rental Checkbox and Fields */}
              <div className="p-4 bg-white rounded-xl border border-[#EDE5DF] space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableForRental}
                    onChange={(e) => setAvailableForRental(e.target.checked)}
                    className="rounded text-[#8D5844] focus:ring-[#8D5844] w-4 h-4"
                  />
                  <span className="font-semibold text-[#2E2421]">
                    Este artículo está disponible para Alquiler de Mobiliario / Eventos
                  </span>
                </label>

                {availableForRental && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F2ECE6]">
                    <div>
                      <label className="text-xs font-medium text-[#423530] block mb-1">
                        Precio de Alquiler x Día ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={rentalPrice}
                        onChange={(e) =>
                          setRentalPrice(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Ej. 45.00"
                        className="w-full p-2.5 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#423530] block mb-1">
                        Depósito en Garantía ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={rentalDeposit}
                        onChange={(e) =>
                          setRentalDeposit(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Ej. 30.00"
                        className="w-full p-2.5 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-[#423530] block mb-1">
                        Condiciones de Alquiler
                      </label>
                      <input
                        type="text"
                        value={rentalConditions}
                        onChange={(e) => setRentalConditions(e.target.value)}
                        placeholder="Ej. Requiere firma de pagaré y devolución en 24h limpias"
                        className="w-full p-2.5 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-[#8D5844] w-4 h-4"
                  />
                  <span>Producto Activo en Tienda</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-[#8D5844] w-4 h-4"
                  />
                  <span>Marcar como Destacado</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="rounded text-[#8D5844] w-4 h-4"
                  />
                  <span>Marcar como Nuevo</span>
                </label>
              </div>
            </div>

            {/* Sticky Submit Buttons Footer */}
            <div className="p-4 border-t border-[#EBE2DB] bg-white flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg border border-[#D5C2B8] bg-white text-[#423530] hover:bg-[#F2ECE6] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg bg-[#8D5844] hover:bg-[#744533] disabled:bg-[#D5C2B8] text-white font-medium shadow-sm transition-colors cursor-pointer"
              >
                {isSaving ? 'Guardando en Supabase...' : 'Guardar Producto'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-rose-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#2E2421]">
                ¿Eliminar producto?
              </h3>
              <p className="text-xs text-[#7A6B63] mt-1">
                ¿Estás seguro de que deseas eliminar permanentemente <strong>"{productToDelete.name}"</strong>?
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
                onClick={() => setProductToDelete(null)}
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
