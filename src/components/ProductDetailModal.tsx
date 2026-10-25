import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Gift, 
  Calendar, 
  ShieldCheck, 
  Check, 
  Share2, 
  Truck,
  Heart,
  ZoomIn,
  Sparkles,
  SlidersHorizontal,
  Zap,
  Clock,
  CalendarDays
} from 'lucide-react';
import { 
  Product, 
  ProductVariant,
  getProductVariants,
  isProductReadyNow, 
  isProductReservation, 
  getProductMinDeliveryDays 
} from '../types/database';
import { useCart } from '../context/CartContext';
import { InteractiveGiftCustomizer, CustomizerState } from './InteractiveGiftCustomizer';
import { LiveGiftPreviewStage } from './LiveGiftPreviewStage';

interface ProductDetailModalProps {
  product: Product | null;
  relatedProducts: Product[];
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  onOpenCustomizerStudio?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  relatedProducts,
  onClose,
  onSelectProduct,
  onOpenCustomizerStudio,
}) => {
  if (!product) return null;

  const { addItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>(product.size || 'Estándar');
  const [dedicationMessage, setDedicationMessage] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Presentation & Size Variants with specific prices
  const productVariants = getProductVariants(product);
  const [selectedOption, setSelectedOption] = useState<ProductVariant | null>(() => {
    if (productVariants.length > 0) {
      return productVariants.find((v) => v.is_default) || productVariants[0];
    }
    return null;
  });

  // Interactive Customizer State for Variable / Customizable Gifts
  const [customGiftState, setCustomGiftState] = useState<CustomizerState>({
    balloonType: 'Burbuja con Confeti',
    balloonText: '',
    vinylColor: 'Dorado Metálico',
    colorPalette: 'Rosa Pastel & Blanco Perla',
    ribbonType: 'Satén Sedoso',
    plushToy: 'Sin peluche',
    plushPrice: 0,
    extras: [],
  });

  // Rental specific states
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [rentalRequested, setRentalRequested] = useState(false);

  const isReady = isProductReadyNow(product);
  const isRes = isProductReservation(product);
  const isRental = product.available_for_rental;

  // Reservation items allow customization; Ready-Now items are strictly sold as pictured (tal cual en la foto)
  const [isCustomizing, setIsCustomizing] = useState<boolean>(!isReady && isRes);

  const currentBasePrice = selectedOption
    ? Number(selectedOption.price)
    : isRental && product.rental_price
    ? product.rental_price
    : product.price;

  const customTotal =
    currentBasePrice + (customGiftState.plushPrice || 0) + customGiftState.extras.reduce((s, e) => s + e.price, 0);

  const unitPrice = isCustomizing 
    ? customTotal 
    : currentBasePrice;

  // Prepare images array (up to 4)
  const images = (product.images && product.images.length > 0)
    ? product.images.slice(0, 4)
    : [
        {
          id: 'placeholder',
          product_id: product.id,
          image_url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80',
          position: 1 as const,
        },
      ];

  const currentImageUrl = images[selectedImageIndex]?.image_url || images[0]?.image_url;

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    const finalVariantName = selectedOption ? selectedOption.name : selectedVariant;
    addItem(product, quantity, {
      isRental: product.available_for_rental,
      rentalStartDate,
      rentalEndDate,
      variant: finalVariantName,
      dedication: dedicationMessage,
      customization: isCustomizing ? customGiftState : undefined,
      customPrice: unitPrice,
    });
    onClose();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isOutOfStock = product.stock <= 0 && !isRental;
  const isLowStock = product.stock > 0 && product.stock <= product.minimum_stock;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden animate-fade-in">
      <div 
        className="relative w-full max-w-5xl bg-[#FAF8F5] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden my-0 sm:my-auto border-t sm:border border-[#E8DED7] flex flex-col h-[94dvh] max-h-[94dvh] animate-bottom-sheet sm:animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Top Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 bg-white flex justify-center">
          <span className="w-12 h-1.5 bg-stone-300 rounded-full" />
        </div>

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#EBE2DB] bg-white">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#8A796F] font-light">
            <span className="uppercase tracking-widest text-[#763D8B] font-bold text-[11px]">BALLONSDEI</span>
            <span>/</span>
            <span className="hidden sm:inline">{isRental ? 'Alquiler para Eventos' : isCustomizing ? 'Personalizable' : 'Colección'}</span>
            <span className="hidden sm:inline">/</span>
            <span className="truncate max-w-[130px] sm:max-w-[200px] text-[#423530] font-medium">{product.name}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-[#7A6B63] hover:text-[#763D8B] hover:bg-[#F2ECE6] rounded-full transition-colors cursor-pointer"
              title="Copiar enlace"
              aria-label="Compartir enlace de producto"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#7A6B63] hover:text-[#2E2421] hover:bg-[#F2ECE6] rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar ventana de detalles"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher: Diseño Original vs Modificar a mi Gusto */}
        {!isRental && (
          <div className="px-3 sm:px-8 pt-2.5 pb-2 bg-white border-b border-[#F0E8E2]">
            <div className="bg-[#FAF4F7] p-1 rounded-xl border border-[#E8DED7] flex items-center gap-1 max-w-md mx-auto shadow-2xs">
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold chip-spring cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                  !isCustomizing
                    ? 'bg-white text-[#241A23] shadow-xs border border-[#EAE3DC]'
                    : 'text-[#6E5A69] hover:text-[#241A23]'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-[#763D8B] shrink-0" />
                <span className="truncate">Diseño de Colección</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCustomizing(true)}
                className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold chip-spring cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                  isCustomizing
                    ? 'bg-[#763D8B] text-white shadow-xs'
                    : 'text-[#6E5A69] hover:text-[#763D8B]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#F3E2C4] shrink-0" />
                <span className="truncate">Modificar a mi Gusto</span>
              </button>
            </div>
            
            <p className="text-[10px] sm:text-[11px] text-[#6E5A69] text-center mt-1 font-light truncate sm:whitespace-normal">
              {!isCustomizing 
                ? '🌸 Arreglo de autor listo para enviar tal como se ve en la foto.'
                : '🎨 Modifica globos, vinilo, cintas y peluches a tu gusto en tiempo real.'}
            </p>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 lg:p-8">
          {isCustomizing ? (
            /* ========================================================================= */
            /* CUSTOMIZABLE GIFT WORKSHOP LAYOUT: TOP SIMULATOR + BOTTOM ASSEMBLY STUDIO */
            /* ========================================================================= */
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
              {/* 1. SECCIÓN ARRIBA: ESCENARIO EN VIVO SOBRE LA FOTO DE REFERENCIA */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8DED7] shadow-sm space-y-4">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0E8E2]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 bg-[#763D8B]/15 text-[#763D8B] text-[11px] font-bold tracking-wider uppercase rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#C19B65]" />
                        <span>Estudio de Armado en Vivo</span>
                      </span>
                      <span className="text-xs text-stone-500">· SKU: {product.sku || 'BD-GEN'}</span>
                    </div>
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#2B211D] font-normal tracking-tight">
                      {product.name}
                    </h1>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[11px] text-stone-500 block">Total con tu personalización:</span>
                    <span className="text-2xl sm:text-3xl font-bold text-[#763D8B]">
                      ${customTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Instructions Pill */}
                <div className="bg-[#FAF7F4] border border-[#EBE1D8] p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#6B5A52]">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span><strong>Foto de Referencia Activa:</strong> Modifica el diseño como quieras y crea una idea de cómo quieres que quede tu arreglo.</span>
                  </span>
                  {onOpenCustomizerStudio && !isRental && (
                    <button
                      type="button"
                      onClick={() => onOpenCustomizerStudio(product)}
                      className="px-3.5 py-1.5 bg-[#763D8B] hover:bg-[#602F72] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
                    >
                      <span>Abrir Lienzo de Composición 2D</span>
                    </button>
                  )}
                </div>

                {/* Main Visual Stage (Top Reference Image with Interactive Live Elements) */}
                <div className="relative max-w-2xl mx-auto">
                  <LiveGiftPreviewStage
                    referenceImageUrl={currentImageUrl}
                    productName={product.name}
                    customization={customGiftState}
                    isCustomizable={true}
                    isZoomed={isZoomed}
                    onToggleZoom={() => setIsZoomed(!isZoomed)}
                    referenceImages={images}
                    activeImageIndex={selectedImageIndex}
                    onSelectImageIndex={(idx) => {
                      setSelectedImageIndex(idx);
                      setIsZoomed(false);
                    }}
                  />

                  {/* Arrow Controls across reference images */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevImage();
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#2B211D] flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#2B211D] flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
                        aria-label="Siguiente imagen"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Reference Photo Thumbnails Row */}
                <div className="pt-2 border-t border-[#F0E8E2]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#54433C]">
                      Fotografías del Arreglo (Haz clic para ver el diseño en diferentes ángulos):
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Foto {selectedImageIndex + 1} de {images.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                    {images.map((img, index) => {
                      const isActive = selectedImageIndex === index;
                      return (
                        <button
                          key={img.id || index}
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setIsZoomed(false);
                          }}
                          className={`chip-spring relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer bg-[#EAE2DC] ${
                            isActive
                              ? 'border-[#763D8B] ring-2 ring-[#763D8B]/30 scale-102 shadow-xs'
                              : 'border-transparent opacity-75 hover:opacity-100 hover:border-[#D5C2B8]'
                          }`}
                        >
                          <img
                            src={img.image_url}
                            alt={`Ángulo de foto ${index + 1}`}
                            className="w-full h-full object-cover object-center"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded-xs">
                            #{img.position || index + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time Assembly Summary Chips */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE5DF] flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-stone-700 text-[11px]">Resumen de tu diseño:</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px] font-medium shadow-2xs">
                    🎈 {customGiftState.balloonType}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px] font-medium shadow-2xs">
                    ✍️ {customGiftState.balloonText ? `"${customGiftState.balloonText}"` : 'Sin dedicatoria'} ({customGiftState.vinylColor})
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 text-[11px] font-medium shadow-2xs">
                    🎀 {customGiftState.ribbonType}
                  </span>
                  {customGiftState.plushToy && customGiftState.plushToy !== 'Sin peluche' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-medium shadow-2xs">
                      🧸 {customGiftState.plushToy} (+${customGiftState.plushPrice.toFixed(2)})
                    </span>
                  )}
                  {customGiftState.extras.map((extra) => (
                    <span key={extra.name} className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[#763D8B] text-[11px] font-medium shadow-2xs">
                      ✨ {extra.name} (+${extra.price.toFixed(2)})
                    </span>
                  ))}
                </div>
              </div>

              {/* 2. SECCIÓN ABAJO: TALLER DE ARMADO INTERACTIVO PASO A PASO */}
              <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E8DED7] shadow-sm space-y-6">
                <div className="border-b border-[#EBE2DB] pb-3">
                  <span className="text-[11px] text-[#763D8B] uppercase font-bold tracking-wider block">
                    Paso a Paso
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#2B211D] font-medium">
                    Taller de Armado: Personaliza Cada Detalle
                  </h2>
                  <p className="text-xs text-[#7A6B63] mt-0.5 font-light">
                    Selecciona cada elemento a continuación. La imagen de arriba se actualizará instantáneamente para mostrarte cómo luce tu regalo.
                  </p>
                </div>

                {/* Presentation / Size Options in Customizer View */}
                {productVariants.length > 0 && (
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DED7] shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2B211D] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#763D8B]" />
                        <span>Presentación o Tamaño del Arreglo:</span>
                      </span>
                      {selectedOption && (
                        <span className="text-[11px] text-[#763D8B] font-semibold bg-white px-2 py-0.5 rounded-full border border-[#763D8B]/20">
                          Base: ${Number(selectedOption.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {productVariants.map((v) => {
                        const isSelected = selectedOption?.id === v.id || selectedOption?.name === v.name;
                        return (
                          <button
                            key={v.id || v.name}
                            type="button"
                            onClick={() => setSelectedOption(v)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'border-[#763D8B] bg-white ring-2 ring-[#763D8B]/25 shadow-xs'
                                : 'border-[#EDE5DF] bg-white/70 hover:bg-white hover:border-[#D5C2B8]'
                            }`}
                          >
                            <span className={`text-xs font-medium truncate ${isSelected ? 'text-[#763D8B]' : 'text-[#382B26]'}`}>
                              {v.name}
                            </span>
                            <span className={`text-xs font-bold shrink-0 ${isSelected ? 'text-[#763D8B]' : 'text-[#2B211D]'}`}>
                              ${Number(v.price).toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step-by-Step Customizer */}
                <InteractiveGiftCustomizer
                  basePrice={currentBasePrice}
                  customization={customGiftState}
                  onChange={setCustomGiftState}
                />

                {/* Optional Dedication Card Message */}
                <div className="pt-4 border-t border-[#EFE8E2] space-y-2">
                  <label className="text-xs font-semibold text-[#423530] block">
                    Mensaje para la Tarjeta de Dedicatoria Impresa (Opcional):
                  </label>
                  <textarea
                    rows={2}
                    value={dedicationMessage}
                    onChange={(e) => setDedicationMessage(e.target.value)}
                    placeholder="Ejemplo: '¡Feliz Cumpleaños Mamá! Te amamos con todo el corazón.'"
                    className="w-full text-xs p-3 rounded-xl bg-white border border-[#D8CBC2] focus:border-[#763D8B] focus:outline-none text-[#2B211D]"
                  />
                  <p className="text-[10px] text-stone-500 font-light">
                    Esta tarjeta va elegantemente impresa e insertada en el arreglo floral.
                  </p>
                </div>

                {/* Sticky Action Footer */}
                <div className="pt-6 border-t border-[#EFE8E2] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAF8F5] -mx-5 -mb-5 sm:-mx-7 sm:-mb-7 p-5 sm:p-6 rounded-b-2xl">
                  <div>
                    <span className="text-xs text-stone-500 block">Total con tu personalización:</span>
                    <span className="text-2xl sm:text-3xl font-bold text-[#2E2421]">
                      ${(customTotal * quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Quantity Picker */}
                    <div className="flex items-center border border-[#D5C2B8] rounded-xl bg-white shadow-2xs">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={isOutOfStock}
                        className="btn-spring-action px-3 py-2.5 text-[#423530] hover:bg-[#F2ECE6] disabled:opacity-40 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-2.5 text-sm font-semibold text-[#2E2421] min-w-[2.5rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                        disabled={isOutOfStock || quantity >= product.stock}
                        className="btn-spring-action px-3 py-2.5 text-[#423530] hover:bg-[#F2ECE6] disabled:opacity-40 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart with custom design */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className="btn-cta-emil flex-1 sm:flex-initial py-3.5 px-8 bg-[#763D8B] hover:bg-[#602F72] disabled:bg-[#D5C2B8] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#F6E3BA]" />
                      <span>Agregar con mi Personalización</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* STANDARD 2-COLUMN VIEW FOR BOUQUETS, FIXED ARRANGEMENTS & RENTALS         */
            /* ========================================================================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column: 4-Images Professional Gallery */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="relative aspect-4/3 sm:aspect-square w-full rounded-xl overflow-hidden bg-[#F2EDE8] border border-[#E8DED7] group shadow-inner">
                  <img
                    src={currentImageUrl}
                    alt={product.name}
                    className={`w-full h-full object-cover object-center transition-all duration-300 ${
                      isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-103 cursor-zoom-in'
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevImage();
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#2B211D] flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#2B211D] flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
                        aria-label="Siguiente imagen"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 text-[#382B26] text-xs font-medium rounded-full shadow-xs">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Thumbnails Row */}
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, index) => {
                    const isActive = selectedImageIndex === index;
                    return (
                      <button
                        key={img.id || index}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setIsZoomed(false);
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-[#EAE2DC] ${
                          isActive
                            ? 'border-[#763D8B] ring-2 ring-[#763D8B]/30 scale-102'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#D5C2B8]'
                        }`}
                        aria-label={`Ver foto ${index + 1}`}
                      >
                        <img
                          src={img.image_url}
                          alt={`Vista miniatura ${index + 1}`}
                          className="w-full h-full object-cover object-center"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded-xs">
                          #{img.position || index + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Product Details & Standard Controls */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {isReady ? (
                      <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[11px] font-semibold tracking-wider uppercase rounded-xs flex items-center gap-1 shadow-2xs">
                        <Zap className="w-3 h-3 text-white fill-white" />
                        <span>⚡ Para Ya (Tal cual en foto)</span>
                      </span>
                    ) : isRes ? (
                      <span className="px-2.5 py-0.5 bg-[#763D8B] text-white text-[11px] font-semibold tracking-wider uppercase rounded-xs flex items-center gap-1 shadow-2xs">
                        <CalendarDays className="w-3 h-3" />
                        <span>📅 Por Reserva (Personalizable)</span>
                      </span>
                    ) : null}

                    {isRental && (
                      <span className="px-2.5 py-0.5 bg-[#556B5C]/15 text-[#556B5C] text-[11px] font-medium tracking-wider uppercase rounded-xs">
                        Alquiler de Mobiliario
                      </span>
                    )}

                    {isOutOfStock ? (
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-medium rounded-xs">
                        Agotado
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-medium rounded-xs">
                        ¡Últimas {product.stock} unidades!
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-medium rounded-xs">
                        Disponible
                      </span>
                    )}
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl text-[#2B211D] font-normal tracking-tight">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-3 text-xs text-[#8C7A70] mt-1 font-light">
                    <span>SKU: {product.sku || 'BD-GEN'}</span>
                    <span>·</span>
                    <span>Stock: {product.stock} unidades</span>
                  </div>

                  {/* Policy and Timing Alert Banner */}
                  {isReady ? (
                    <div className="mt-3 p-3 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600 shrink-0" />
                        <span>Regalo Hecho Ya · Entrega Inmediata</span>
                      </div>
                      <p className="text-[11px] text-[#423530] font-light leading-relaxed">
                        Este arreglo se encuentra terminado en boutique y se entrega <strong>tal cual como está en la foto</strong> (sin modificaciones).
                        ¡Disponible para entrega hoy mismo en Colón o retiro en tienda!
                      </p>
                    </div>
                  ) : isRes ? (
                    <div className="mt-3 p-3 bg-purple-50/90 border border-purple-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#763D8B]">
                        <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                        <span>Regalo Por Reserva · Personalizable</span>
                      </div>
                      <p className="text-[11px] text-[#423530] font-light leading-relaxed">
                        Esta creación se confecciona artesanalmente a pedido y <strong>sí se puede modificar y personalizar</strong> (colores, dedicatoria, frase en globo).
                        Requiere reserva con <strong>mínimo {product.preparation_days || 3} días de anticipación</strong>.
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-semibold text-[#2B211D]">
                        ${unitPrice.toFixed(2)}
                      </span>
                      {isRental && (
                        <span className="text-xs text-[#7A6B63] font-light">/ día de alquiler</span>
                      )}
                      {product.previous_price && (
                        <span className="text-base text-[#A89890] line-through font-light">
                          ${product.previous_price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isRental && isRes && (
                        <button
                          type="button"
                          onClick={() => setIsCustomizing(true)}
                          className="px-4 py-2 bg-[#763D8B] hover:bg-[#602F72] text-white rounded-xl text-xs font-semibold transition-[background-color,transform] duration-150 cursor-pointer shadow-xs active:scale-[0.97] flex items-center gap-1.5"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Modificar a mi Gusto</span>
                        </button>
                      )}

                      {onOpenCustomizerStudio && !isRental && isRes && (
                        <button
                          type="button"
                          onClick={() => onOpenCustomizerStudio(product)}
                          className="px-3.5 py-2 bg-[#FAF4F7] hover:bg-[#F2E5EF] text-[#763D8B] rounded-xl text-xs font-semibold transition-[background-color,border-color,transform] duration-150 cursor-pointer border border-[#763D8B]/25 shadow-2xs active:scale-[0.97]"
                        >
                          <span>Lienzo 2D</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EFE8E2]">
                    <p className="text-xs sm:text-sm text-[#5C4D46] font-light leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {isRental && (
                    <div className="mt-5 p-4 bg-[#F2ECE6] rounded-xl border border-[#E3D7CE] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#64473C] font-medium">Depósito en Garantía Reembolsable:</span>
                        <span className="font-semibold text-[#2E2421]">
                          ${(product.rental_deposit || 25).toFixed(2)}
                        </span>
                      </div>

                      {product.rental_conditions && (
                        <div className="text-[11px] text-[#7A6B63] border-t border-[#DFD1C6] pt-2">
                          <span className="font-medium text-[#423530] block">Condiciones de Alquiler:</span>
                          {product.rental_conditions}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="text-[10px] text-[#6B5A52] uppercase tracking-wider block mb-1">
                            Fecha Inicio Evento
                          </label>
                          <input
                            type="date"
                            value={rentalStartDate}
                            onChange={(e) => setRentalStartDate(e.target.value)}
                            className="w-full text-xs p-2 rounded-md bg-white border border-[#D5C2B8] text-[#2E2421]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#6B5A52] uppercase tracking-wider block mb-1">
                            Fecha Fin / Devolución
                          </label>
                          <input
                            type="date"
                            value={rentalEndDate}
                            onChange={(e) => setRentalEndDate(e.target.value)}
                            className="w-full text-xs p-2 rounded-md bg-white border border-[#D5C2B8] text-[#2E2421]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Presentation & Size Options with Prices */}
                  {productVariants.length > 0 && !isRental && (
                    <div className="mt-5 p-4 bg-white rounded-xl border border-[#E8DED7] shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2B211D] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#763D8B]" />
                          <span>Selecciona la Opción o Tamaño:</span>
                        </span>
                        {selectedOption && (
                          <span className="text-[11px] text-[#763D8B] font-semibold bg-[#FAF4F7] px-2.5 py-0.5 rounded-full border border-[#763D8B]/20">
                            {selectedOption.name} · ${Number(selectedOption.price).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {productVariants.map((v) => {
                          const isSelected = selectedOption?.id === v.id || selectedOption?.name === v.name;
                          return (
                            <button
                              key={v.id || v.name}
                              type="button"
                              onClick={() => setSelectedOption(v)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'border-[#763D8B] bg-[#FAF4F7] ring-2 ring-[#763D8B]/20 shadow-xs'
                                  : 'border-[#EDE5DF] bg-[#FAF8F5] hover:border-[#D5C2B8] hover:bg-white'
                              }`}
                            >
                              <div className="min-w-0">
                                <span className={`text-xs block font-semibold truncate ${isSelected ? 'text-[#763D8B]' : 'text-[#382B26]'}`}>
                                  {v.name}
                                </span>
                                {v.sku && (
                                  <span className="text-[10px] text-stone-500 block">
                                    Ref: {v.sku}
                                  </span>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`text-sm font-bold ${isSelected ? 'text-[#763D8B]' : 'text-[#2B211D]'}`}>
                                  ${Number(v.price).toFixed(2)}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!isRental && (
                    <div className="mt-5 space-y-2 pt-4 border-t border-[#EFE8E2]">
                      <label className="text-xs font-medium text-[#423530] block">
                        Mensaje para la Tarjeta de Dedicatoria (Opcional):
                      </label>
                      <textarea
                        rows={2}
                        value={dedicationMessage}
                        onChange={(e) => setDedicationMessage(e.target.value)}
                        placeholder="Ejemplo: '¡Feliz Cumpleaños Mamá! Te amamos con todo el corazón.'"
                        className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#D8CBC2] focus:border-[#763D8B] focus:outline-none text-[#2B211D]"
                      />
                    </div>
                  )}

                  <div className="mt-6 pt-5 border-t border-[#EFE8E2] flex items-center gap-4">
                    <div className="flex items-center border border-[#D5C2B8] rounded-lg bg-white">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={isOutOfStock}
                        className="px-3 py-2 text-[#423530] hover:bg-[#F2ECE6] disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-2 text-sm font-semibold text-[#2E2421] min-w-[2.5rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                        disabled={isOutOfStock || quantity >= product.stock}
                        className="px-3 py-2 text-[#423530] hover:bg-[#F2ECE6] disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className="btn-cta-emil flex-1 py-3.5 px-6 bg-[#763D8B] hover:bg-[#602F72] disabled:bg-[#D5C2B8] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isRental ? (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span>Reservar Mobiliario</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" />
                          <span>Agregar al Carrito</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EFE8E2] flex items-center justify-between text-[11px] text-[#7A6B63] font-light">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#763D8B]" />
                    Despacho en toda la Provincia de Colón
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#763D8B]" />
                    Flores frescas garantizadas
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Related Products Recommendation Carousel/Grid */}
          {relatedProducts.length > 0 && (
            <div className="mt-14 pt-8 border-t border-[#EBE2DB]">
              <h3 className="font-serif text-xl sm:text-2xl text-[#2B211D] font-normal mb-6">
                Te Podría Encantar
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.slice(0, 4).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectProduct(rel);
                      setSelectedImageIndex(0);
                      setIsZoomed(false);
                    }}
                    className="group cursor-pointer bg-white rounded-lg p-2.5 border border-[#EDE5DF] hover:shadow-md hover:border-[#763D8B]/30 transition-[box-shadow,border-color,transform] duration-150 active:scale-[0.98]"
                  >
                    <div className="aspect-square rounded-md overflow-hidden bg-[#F5EFEB] mb-2">
                      <img
                        src={rel.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80'}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 ease-out"
                      />
                    </div>
                    <h5 className="font-serif text-xs font-medium text-[#2E2421] line-clamp-1 group-hover:text-[#763D8B] transition-colors duration-150">
                      {rel.name}
                    </h5>
                    <span className="text-xs font-semibold text-[#763D8B] mt-1 block">
                      ${rel.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Mobile Bottom Spacer to prevent sticky bar overlap */}
          <div className="h-16 sm:hidden" />
        </div>

        {/* Mobile Sticky Thumb-Zone Action Bar (iOS & Android Ergonomics) */}
        <div 
          className="sm:hidden bg-white/95 backdrop-blur-md border-t border-[#EAE3DC] p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] shrink-0 z-10"
          style={{ paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom, 8px))' }}
        >
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center border border-[#D5C2B8] rounded-xl bg-white overflow-hidden shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isOutOfStock}
                className="w-9 h-11 flex items-center justify-center text-stone-700 active:bg-stone-100 disabled:opacity-40 text-base font-bold cursor-pointer"
                aria-label="Disminuir cantidad"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-bold text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                disabled={isOutOfStock || quantity >= product.stock}
                className="w-9 h-11 flex items-center justify-center text-stone-700 active:bg-stone-100 disabled:opacity-40 text-base font-bold cursor-pointer"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn-cta-emil flex-1 h-11 px-4 bg-[#763D8B] hover:bg-[#602F72] disabled:bg-[#D5C2B8] text-white text-xs font-bold tracking-wider uppercase rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isRental ? (
                <>
                  <Calendar className="w-4 h-4 text-[#F3E2C4]" />
                  <span className="truncate">Reservar · ${(unitPrice * quantity).toFixed(2)}</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 text-[#F3E2C4]" />
                  <span className="truncate">Agregar · ${(unitPrice * quantity).toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
