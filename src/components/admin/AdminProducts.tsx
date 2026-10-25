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
  RefreshCw,
  Zap,
  CalendarDays,
  Clock,
  Database,
  Code2
} from 'lucide-react';
import { 
  Product, 
  Category, 
  GiftType, 
  ProductType, 
  AvailabilityType, 
  ProductVariant,
  getProductVariants,
  getProductPriceRange,
  isProductReadyNow, 
  isProductReservation, 
  getProductMinDeliveryDays 
} from '../../types/database';
import { productService } from '../../services/productService';
import { processImageFile } from '../../lib/imageUtils';
import { isSupabaseConfigured, getSupabasePermissionFixScript } from '../../lib/supabase';
import { SUPABASE_VARIANTS_SQL } from '../../data/variantsSqlScript';

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
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'ready_now' | 'reservation'>('all');
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
  const [availabilityType, setAvailabilityType] = useState<AvailabilityType>('ready_now');
  const [preparationDays, setPreparationDays] = useState<number>(3);
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

  // Options & Variants with different prices and names
  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedSqlModal, setCopiedSqlModal] = useState<boolean>(false);

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
    if (selectedAvailability === 'ready_now' && !isProductReadyNow(p)) return false;
    if (selectedAvailability === 'reservation' && !isProductReservation(p)) return false;
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
    setAvailabilityType('ready_now');
    setPreparationDays(3);
    setGiftType('fixed');
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
    setHasVariants(false);
    setVariants([]);
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
    const isRes = isProductReservation(p);
    setAvailabilityType(p.availability_type || (isRes ? 'reservation' : 'ready_now'));
    setPreparationDays(p.preparation_days !== undefined ? p.preparation_days : (isRes ? 3 : 0));
    setGiftType(p.gift_type || (isRes ? 'variable' : 'fixed'));
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

    const pVariants = getProductVariants(p);
    if (pVariants.length > 0) {
      setHasVariants(true);
      setVariants(pVariants);
    } else {
      setHasVariants(false);
      setVariants([]);
    }

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

    const isRes = availabilityType === 'reservation';
    const computedGiftType: GiftType = isRes ? (giftType === 'none' ? 'variable' : giftType) : 'fixed';

    const effectiveVariants = hasVariants ? variants.filter((v) => v.name.trim() && Number(v.price) > 0) : [];
    let effectivePrice = Number(price) || 0;
    if (effectiveVariants.length > 0) {
      const defaultV = effectiveVariants.find((v) => v.is_default) || effectiveVariants[0];
      if (defaultV) {
        effectivePrice = Number(defaultV.price);
      }
    }

    const productPayload: Partial<Product> = {
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      price: effectivePrice,
      previous_price: previousPrice !== '' ? Number(previousPrice) : null,
      sku: sku.trim() || `BD-${Date.now().toString().slice(-4)}`,
      category_id: categoryId,
      product_type: availableForRental ? 'rental' : 'product',
      gift_type: computedGiftType,
      availability_type: availabilityType,
      preparation_days: isRes ? (Number(preparationDays) || 3) : 0,
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
      variants: effectiveVariants,
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
            onClick={() => setShowSqlModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF4F7] hover:bg-[#F2E5EF] border border-[#763D8B]/30 text-[#763D8B] rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Ver y copiar el script SQL de opciones y variantes para Supabase"
          >
            <Database className="w-3.5 h-3.5 text-[#763D8B]" />
            <span>Script SQL Variantes</span>
          </button>

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
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EDE5DF] shadow-2xs">
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#8A796F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, SKU o tags..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8] text-[#2E2421] focus:outline-none focus:border-[#8D5844]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-[#7A6B63] whitespace-nowrap">Disponibilidad:</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value as any)}
              className="text-xs p-2 rounded-lg border border-[#D5C2B8] bg-white text-[#2E2421] focus:outline-none font-medium"
            >
              <option value="all">Todos los regalos</option>
              <option value="ready_now">⚡ Para Ya (Inmediatos)</option>
              <option value="reservation">📅 Por Reserva (Con tiempo)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs text-[#7A6B63] whitespace-nowrap">Categoría:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs p-2 rounded-lg border border-[#D5C2B8] bg-white text-[#2E2421] focus:outline-none"
            >
              <option value="all">Todas ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Display: Responsive Cards on Mobile + Table on Desktop */}
      <div className="bg-white rounded-2xl border border-[#EDE5DF] shadow-2xs overflow-hidden">
        {/* Mobile View: Touch-friendly cards */}
        <div className="block md:hidden divide-y divide-[#F2ECE6]">
          {filteredProducts.map((p) => {
            const mainImg = p.images?.[0]?.image_url || '';
            const isReady = isProductReadyNow(p);
            const isRes = isProductReservation(p);
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
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {isReady ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/70 text-[9px] font-semibold flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />
                          <span>Para Ya (Tal cual foto)</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-[#763D8B] border border-purple-200/70 text-[9px] font-semibold flex items-center gap-0.5">
                          <CalendarDays className="w-2.5 h-2.5" />
                          <span>Por Reserva (Mín. {p.preparation_days || 3}d)</span>
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
                <th className="py-3 px-4">Foto</th>
                <th className="py-3 px-4">Producto / SKU</th>
                <th className="py-3 px-4">Disponibilidad / Entrega</th>
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
                const isReady = isProductReadyNow(p);
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
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium">
                          Alquiler Eventos
                        </span>
                      ) : isReady ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold">
                            <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                            <span>⚡ Para Ya (Inmediato)</span>
                          </span>
                          <span className="block text-[9px] text-[#7A6B63]">Tal cual como en la foto</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-[#763D8B] border border-purple-200 text-[10px] font-semibold">
                            <CalendarDays className="w-3 h-3" />
                            <span>📅 Por Reserva (Mín. {p.preparation_days || 3} días)</span>
                          </span>
                          <span className="block text-[9px] text-purple-700">Modificable / Personalizable</span>
                        </div>
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

                {/* DISPONIBILIDAD Y TIPO DE ENTREGA */}
                <div className="sm:col-span-2 p-4 bg-[#FDFCFA] rounded-xl border border-[#D5C2B8] space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#2E2421] block">
                      Disponibilidad y Tipo de Entrega del Regalo *
                    </label>
                    <p className="text-[11px] text-[#7A6B63] font-light mt-0.5">
                      Tú decides si este regalo está hecho ya para entrega inmediata o si se confecciona bajo reserva con tiempo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* OPTION 1: PARA YA */}
                    <button
                      type="button"
                      onClick={() => {
                        setAvailabilityType('ready_now');
                        setGiftType('fixed');
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        availabilityType === 'ready_now'
                          ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/30'
                          : 'border-[#D5C2B8] bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
                            <span>⚡ PARA YA (Hecho ya)</span>
                          </span>
                          {availabilityType === 'ready_now' && (
                            <span className="text-[10px] bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#423530] font-medium leading-relaxed">
                          Tal cual como está en la foto (No se modifica).
                        </p>
                        <p className="text-[10px] text-stone-600 font-light mt-1">
                          • Ya elaborado en boutique.<br/>
                          • Disponible para entrega hoy mismo en Colón o retiro en tienda.<br/>
                          • No permite cambiar composición ni colores.
                        </p>
                      </div>
                    </button>

                    {/* OPTION 2: POR RESERVA */}
                    <button
                      type="button"
                      onClick={() => {
                        setAvailabilityType('reservation');
                        if (giftType === 'none' || giftType === 'fixed') {
                          setGiftType('variable');
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        availabilityType === 'reservation'
                          ? 'border-[#763D8B] bg-purple-50/70 ring-2 ring-[#763D8B]/30'
                          : 'border-[#D5C2B8] bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-[#763D8B] flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4" />
                            <span>📅 POR RESERVA (Con tiempo)</span>
                          </span>
                          {availabilityType === 'reservation' && (
                            <span className="text-[10px] bg-[#763D8B] text-white font-bold px-1.5 py-0.5 rounded">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#423530] font-medium leading-relaxed">
                          Sí se puede modificar y personalizar.
                        </p>
                        <p className="text-[10px] text-stone-600 font-light mt-1">
                          • Confeccionado a pedido artesanalmente.<br/>
                          • Requiere mínimo 3 días de anticipación para su entrega.<br/>
                          • El cliente puede elegir globo, paleta y dedicatoria.
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* EXTRA SETTINGS FOR RESERVATION */}
                  {availabilityType === 'reservation' && (
                    <div className="pt-2 border-t border-[#E8DED7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-[#2E2421] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#763D8B]" />
                          <span>Días mínimos de anticipación requeridos:</span>
                        </span>
                        <p className="text-[10px] text-stone-500 font-light">
                          En el carrito, la persona no podrá elegir una fecha menor a este plazo (ej. dentro de 3 días).
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={preparationDays}
                          onChange={(e) => setPreparationDays(Math.max(1, Number(e.target.value) || 1))}
                          className="w-20 p-2 text-center text-xs font-bold rounded-lg border border-[#D5C2B8] bg-[#FAF8F5] text-[#2E2421]"
                        />
                        <span className="text-xs text-stone-600 font-medium">días</span>
                      </div>
                    </div>
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

                {/* VARIANTS AND MULTIPLE OPTIONS / SIZES WITH DIFFERENT PRICES */}
                <div className="sm:col-span-2 p-4 bg-[#FDFCFA] rounded-xl border-2 border-[#763D8B]/35 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E8DED7] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#763D8B]" />
                        <h4 className="text-xs font-bold text-[#2E2421]">
                          ¿Tiene varias opciones, tamaños o presentaciones con distintos precios?
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#7A6B63] font-light mt-0.5">
                        Permite configurar presentaciones con su propio nombre y precio (ej. 12 Rosas $35, 24 Rosas $55, Sombrerera Grande $95).
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={hasVariants}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          setHasVariants(enabled);
                          if (enabled && variants.length === 0) {
                            setVariants([
                              { id: `var-${Date.now()}-1`, name: 'Pequeño (12 Rosas)', price: price || 35, is_default: true, stock: 10 },
                              { id: `var-${Date.now()}-2`, name: 'Mediano (24 Rosas)', price: (price ? price + 20 : 55), is_default: false, stock: 10 },
                              { id: `var-${Date.now()}-3`, name: 'Grande (50 Rosas)', price: (price ? price + 55 : 95), is_default: false, stock: 10 },
                            ]);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#763D8B]"></div>
                      <span className="ml-2 text-xs font-semibold text-[#2E2421]">
                        {hasVariants ? 'Activado' : 'Desactivado'}
                      </span>
                    </label>
                  </div>

                  {hasVariants && (
                    <div className="space-y-3 animate-fade-in">
                      {/* Presets and Helpers */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] bg-[#FAF4F7] p-2.5 rounded-lg border border-[#763D8B]/20">
                        <span className="text-[#763D8B] font-bold">Plantillas Rápidas:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setVariants([
                              { id: `var-${Date.now()}-1`, name: 'Chico (12 Rosas)', price: 35, is_default: true, stock: 10 },
                              { id: `var-${Date.now()}-2`, name: 'Mediano (24 Rosas)', price: 55, is_default: false, stock: 10 },
                              { id: `var-${Date.now()}-3`, name: 'Grande (50 Rosas)', price: 95, is_default: false, stock: 10 },
                              { id: `var-${Date.now()}-4`, name: 'Imperial VIP (100 Rosas)', price: 175, is_default: false, stock: 5 },
                            ]);
                            setPrice(35);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-[#D5C2B8] text-[#55434F] rounded-md font-medium shadow-2xs transition-colors cursor-pointer"
                        >
                          🌹 Cantidades de Rosas (12, 24, 50, 100)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVariants([
                              { id: `var-${Date.now()}-1`, name: 'Tamaño Pequeño (15cm)', price: 25, is_default: true, stock: 10 },
                              { id: `var-${Date.now()}-2`, name: 'Tamaño Mediano (25cm)', price: 45, is_default: false, stock: 10 },
                              { id: `var-${Date.now()}-3`, name: 'Tamaño Grande Deluxe (35cm)', price: 75, is_default: false, stock: 10 },
                            ]);
                            setPrice(25);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-[#D5C2B8] text-[#55434F] rounded-md font-medium shadow-2xs transition-colors cursor-pointer"
                        >
                          📦 Tamaños de Caja (Pequeño, Mediano, Grande)
                        </button>
                      </div>

                      {/* List of Variant Items */}
                      <div className="space-y-2">
                        {variants.map((v, idx) => (
                          <div
                            key={v.id || idx}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-white p-3 rounded-xl border border-[#EDE5DF] shadow-2xs"
                          >
                            <div className="flex-1">
                              <label className="text-[10px] text-[#7A6B63] uppercase font-bold block mb-0.5">
                                Nombre de la Opción / Tamaño #{idx + 1} *
                              </label>
                              <input
                                type="text"
                                required
                                value={v.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setVariants((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                                  );
                                }}
                                placeholder="Ej. Mediano (24 Rosas y Peluche)"
                                className="w-full text-xs p-2 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8] text-[#2E2421] font-medium"
                              />
                            </div>

                            <div className="w-full sm:w-28">
                              <label className="text-[10px] text-[#7A6B63] uppercase font-bold block mb-0.5">
                                Precio ($ USD) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={v.price}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  setVariants((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                                  );
                                  if (v.is_default || idx === 0) {
                                    setPrice(val);
                                  }
                                }}
                                className="w-full text-xs p-2 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8] text-[#2E2421] font-bold text-center"
                              />
                            </div>

                            <div className="w-full sm:w-24">
                              <label className="text-[10px] text-[#7A6B63] uppercase font-bold block mb-0.5">
                                SKU / Código
                              </label>
                              <input
                                type="text"
                                value={v.sku || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setVariants((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, sku: val } : item))
                                  );
                                }}
                                placeholder="BD-OP1"
                                className="w-full text-xs p-2 rounded-lg bg-[#FAF8F5] border border-[#D5C2B8] text-[#2E2421]"
                              />
                            </div>

                            <div className="flex items-center justify-between sm:justify-start gap-2 pt-1 sm:pt-4">
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700 font-medium">
                                <input
                                  type="radio"
                                  name="default_variant"
                                  checked={Boolean(v.is_default)}
                                  onChange={() => {
                                    setVariants((prev) =>
                                      prev.map((item, i) => ({
                                        ...item,
                                        is_default: i === idx,
                                      }))
                                    );
                                    setPrice(v.price);
                                  }}
                                  className="text-[#763D8B] focus:ring-[#763D8B]"
                                />
                                <span className="text-[11px] whitespace-nowrap">Predeterminada</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => {
                                  if (variants.length <= 1) {
                                    setHasVariants(false);
                                    setVariants([]);
                                  } else {
                                    setVariants((prev) => prev.filter((_, i) => i !== idx));
                                  }
                                }}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar esta opción"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const nextIdx = variants.length + 1;
                            setVariants((prev) => [
                              ...prev,
                              {
                                id: `var-${Date.now()}-${nextIdx}`,
                                name: `Opción ${nextIdx}`,
                                price: (variants[variants.length - 1]?.price || price || 35) + 15,
                                is_default: false,
                                stock: 10,
                              },
                            ]);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#763D8B] hover:text-[#582769] bg-white hover:bg-purple-50 border border-[#763D8B]/30 px-3 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Agregar otra opción / precio</span>
                        </button>

                        <span className="text-[11px] text-stone-500">
                          {variants.length} opción(es) configuradas
                        </span>
                      </div>
                    </div>
                  )}
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

      {/* Supabase Variants SQL Script Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#D5C2B8] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#EDE5DF] flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#763D8B]/10 text-[#763D8B] flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-medium text-[#2E2421]">
                    Script SQL para Opciones y Variantes (Supabase)
                  </h3>
                  <p className="text-[11px] text-[#7A6B63]">
                    Copia y ejecuta este script en el SQL Editor de tu proyecto Supabase.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 text-xs text-amber-950 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-950">
                  ¿Cómo instalarlo en tu base de datos?
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-amber-900 font-light">
                  <li>Haz clic en el botón <strong>"Copiar Script SQL"</strong> aquí abajo.</li>
                  <li>Abre tu panel de Supabase y ve a la sección <strong>SQL Editor</strong>.</li>
                  <li>Pega el código y haz clic en <strong>"Run"</strong>.</li>
                  <li>¡Listo! Tu base de datos admitirá variantes, opciones y diferentes precios sin errores de permisos.</li>
                </ol>
              </div>
            </div>

            {/* Code container */}
            <div className="p-4 overflow-y-auto flex-1 bg-[#1E1E1E] text-stone-200 font-mono text-xs select-all">
              <pre className="whitespace-pre-wrap leading-relaxed text-[11px]">
                {SUPABASE_VARIANTS_SQL}
              </pre>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#EDE5DF] bg-white flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(SUPABASE_VARIANTS_SQL);
                  setCopiedSqlModal(true);
                  setTimeout(() => setCopiedSqlModal(false), 3000);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#763D8B] hover:bg-[#602F72] text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
              >
                {copiedSqlModal ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSqlModal ? '¡Script Copiado al Portapapeles!' : 'Copiar Script SQL'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2.5 rounded-lg border border-[#D5C2B8] bg-white text-[#423530] hover:bg-[#F2ECE6] text-xs font-medium cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
