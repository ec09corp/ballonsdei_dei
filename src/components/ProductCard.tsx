import React from 'react';
import { Eye, ShoppingCart, Calendar, Sparkles } from 'lucide-react';
import { Product } from '../types/database';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onCustomizeProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onViewProduct,
  onCustomizeProduct 
}) => {
  const { addItem } = useCart();

  const mainImage =
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80';

  const isOutOfStock = product.stock <= 0 && !product.available_for_rental;
  const isRental = product.available_for_rental;
  const isVariableGift = product.gift_type === 'variable';
  const isFixedGift = product.gift_type === 'fixed';
  const displayPrice = isRental && product.rental_price ? product.rental_price : product.price;

  // Zero-Pill Discipline: Editorial status text instead of colored pill capsules
  const getEditionLabel = () => {
    if (isOutOfStock) return 'Pieza Agotada';
    if (product.is_new) return 'Nueva Creación';
    if (isRental) return 'Mobiliario VIP';
    if (isVariableGift) return 'Personalizable a tu Gusto';
    if (isFixedGift) return 'Diseño de Colección (Fijo)';
    return null;
  };

  const editionLabel = getEditionLabel();

  return (
    <article 
      onClick={() => onViewProduct(product)}
      className="group flex flex-col bg-white border border-[#EAE3DC] rounded-2xl overflow-hidden cursor-pointer transition-[transform,box-shadow,border-color] duration-240 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#C5A059]/60 hover:shadow-xl hover:shadow-[#241A23]/8 active:scale-[0.99] active:duration-75"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-4/5 overflow-hidden bg-[#FAF6F2]">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transform transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035] will-change-transform"
          loading="lazy"
        />

        {/* Zero-Pill Editorial Status Tag: Clean unboxed typography with WCAG AA contrast */}
        {editionLabel && (
          <div className="absolute top-3.5 left-3.5 pointer-events-none">
            <span className={`text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-sm backdrop-blur-md transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOutOfStock 
                ? 'bg-stone-900/85 text-stone-200' 
                : isVariableGift
                ? 'bg-[#763D8B]/95 text-white shadow-xs'
                : 'bg-white/95 text-[#7D5B28] border border-[#C5A059]/40'
            }`}>
              {editionLabel}
            </span>
          </div>
        )}

        {/* Ballonsdei Atelier Signature Corner Seal */}
        <div className="absolute top-2.5 right-2.5 pointer-events-none z-10">
          <span className="text-[7.5px] sm:text-[8px] font-bold tracking-[0.2em] text-[#F0DCB0] bg-[#1F0E23]/80 backdrop-blur-xs px-1.5 py-0.5 rounded-xs uppercase shadow-2xs border border-[#C5A059]/30">
            BALLONSDEI
          </span>
        </div>

        {/* Desktop Quick Look affordance (accessible and gated to hover with spring slide-up) */}
        <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-[opacity,transform] duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none">
          <span className="text-[10px] font-semibold tracking-wider uppercase bg-white/95 text-[#241A23] px-2.5 py-1.5 rounded-full shadow-sm border border-[#EAE3DC] flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-[#763D8B]" />
            <span>Ver detalle</span>
          </span>
        </div>
      </div>

      {/* Info Content: Pure Editorial Typography */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata clean text with bullet separators (Zero-Pill Rule + WCAG AA contrast #6E5A69) */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-[#6E5A69] uppercase tracking-[0.16em] mb-1 font-medium truncate">
            <span>
              {isRental 
                ? 'Alquiler Eventos' 
                : isVariableGift
                ? 'Personalizable'
                : isFixedGift
                ? 'Colección'
                : 'Floristería'}
            </span>
            {product.size && (
              <>
                <span className="text-[#7D5B28]" aria-hidden="true">·</span>
                <span>{product.size}</span>
              </>
            )}
          </div>

          <h3 className="font-serif text-sm sm:text-lg text-[#241A23] font-normal leading-snug line-clamp-2 group-hover:text-[#763D8B] transition-colors duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]">
            {product.name}
          </h3>
        </div>

        {/* Price & Action Strip */}
        <div className="mt-2.5 sm:mt-3.5 pt-2.5 sm:pt-3 border-t border-[#F2ECE6] flex items-center justify-between gap-1.5">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="font-serif text-lg sm:text-2xl font-light text-[#241A23] truncate">
              ${displayPrice.toFixed(2)}
            </span>
            {isRental && (
              <span className="text-[9px] sm:text-[10px] text-[#6E5A69] font-light uppercase tracking-wider shrink-0">/ día</span>
            )}
            {product.previous_price && (
              <span className="text-[10px] sm:text-xs text-[#8A796F] line-through font-light ml-0.5 shrink-0">
                ${product.previous_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {isRental ? (
              <button
                type="button"
                onClick={() => onViewProduct(product)}
                aria-label={`Reservar ${product.name}`}
                className="btn-spring-action text-[11px] sm:text-xs font-semibold text-[#374D40] hover:text-[#1F2C24] bg-[#435C4E]/10 hover:bg-[#435C4E]/20 px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reservar</span>
              </button>
            ) : isOutOfStock ? (
              <span className="text-[10px] sm:text-xs text-[#8C3A3A] font-medium tracking-wide shrink-0">Agotado</span>
            ) : (
              <button
                type="button"
                onClick={() => addItem(product, 1)}
                aria-label={`Añadir ${product.name} al carrito`}
                className="btn-spring-action text-[11px] sm:text-xs font-semibold text-white bg-[#763D8B] hover:bg-[#602F72] shadow-xs hover:shadow-md hover:shadow-[#763D8B]/20 p-2 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 cursor-pointer shrink-0"
                title="Añadir producto al carrito"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Añadir</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
