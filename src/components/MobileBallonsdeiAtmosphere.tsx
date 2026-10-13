import React from 'react';
import { ShoppingCart, SlidersHorizontal, Sparkles, MessageCircle, Search, Gift, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { StoreSettings } from '../types/database';

interface MobileBallonsdeiAtmosphereProps {
  settings: StoreSettings;
  onOpenCustomizer?: () => void;
  onOpenSearch: () => void;
  onNavigateToCatalog: () => void;
}

export const MobileBallonsdeiAtmosphere: React.FC<MobileBallonsdeiAtmosphereProps> = ({
  settings,
  onOpenCustomizer,
  onOpenSearch,
  onNavigateToCatalog,
}) => {
  const { itemCount, openCart } = useCart();
  const cleanPhone = (settings.whatsapp_number || '+50764324750').replace(/[^0-9]/g, '');

  return (
    <>
      {/* 1. FLOATING AMBIENT BALLOONS & WATERMARKS (Visible only on mobile/tablet) */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden sm:hidden select-none"
      >
        {/* Floating Balloon 1: Soft Lavender Pastel with Ballonsdei Ribbon (Top Right) */}
        <div 
          className="absolute -top-6 -right-6 w-32 h-40 opacity-30 animate-pulse"
          style={{ animationDuration: '6s' }}
        >
          <div className="w-28 h-36 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] bg-gradient-to-br from-[#EAD9F2] via-[#C99AD6] to-[#8A489F] shadow-lg relative transform rotate-12">
            {/* Balloon Gloss Highlight */}
            <div className="absolute top-4 left-4 w-6 h-10 rounded-full bg-white/40 transform -rotate-25 blur-[1px]" />
            {/* Balloon Tie & Ribbon */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-2 bg-[#763D8B] rounded-sm" />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-widest text-[#763D8B] uppercase whitespace-nowrap rotate-90 opacity-60">
              BALLONSDEI
            </div>
          </div>
        </div>

        {/* Floating Balloon 2: Champagne Gold Translucent (Mid Left) */}
        <div 
          className="absolute top-1/3 -left-10 w-28 h-36 opacity-25"
          style={{ animation: 'bounce 7s ease-in-out infinite' }}
        >
          <div className="w-24 h-32 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] bg-gradient-to-tr from-[#E6CF9D] via-[#F4E6C8] to-[#DFC383] shadow-md relative transform -rotate-12">
            <div className="absolute top-3 right-3 w-5 h-8 rounded-full bg-white/50 blur-[1px]" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2.5 h-2 bg-[#C5A059] rounded-sm" />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[7px] font-semibold tracking-widest text-[#7D5B28] uppercase rotate-90">
              BOUTIQUE
            </div>
          </div>
        </div>

        {/* Floating Balloon 3: Blush Pink Crystal (Lower Right) */}
        <div 
          className="absolute top-2/3 -right-8 w-24 h-32 opacity-20"
          style={{ animation: 'pulse 8s ease-in-out infinite' }}
        >
          <div className="w-22 h-28 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] bg-gradient-to-br from-[#FCE4EC] via-[#F8BBD0] to-[#E91E63]/40 shadow-sm relative transform rotate-6">
            <div className="absolute top-3 left-3 w-4 h-7 rounded-full bg-white/60 blur-[1px]" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-1.5 bg-[#D81B60] rounded-sm" />
          </div>
        </div>

        {/* Subtle repeating luxury background pattern with Ballonsdei seals */}
        <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#763D8B_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
      </div>

      {/* 2. MOBILE FLOATING ACTION BAR (Fixed Bottom Navigation Bar for Smart Devices) */}
      <nav 
        aria-label="Navegación Móvil Rápida"
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-xl border-t border-[#EAE3DC] shadow-[0_-8px_25px_rgba(0,0,0,0.08)] px-2 py-1.5"
        style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center gap-1 text-center">
          
          {/* 1. Catálogo / Inicio */}
          <button
            type="button"
            onClick={onNavigateToCatalog}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-stone-600 hover:text-[#763D8B] active:scale-95 transition-all cursor-pointer"
          >
            <span className="relative flex items-center justify-center w-7 h-7">
              <Gift className="w-5 h-5 text-[#763D8B]" />
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-stone-700 leading-tight mt-0.5">
              Catálogo
            </span>
          </button>

          {/* 2. Buscar */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-stone-600 hover:text-[#763D8B] active:scale-95 transition-all cursor-pointer"
          >
            <span className="relative flex items-center justify-center w-7 h-7">
              <Search className="w-5 h-5 text-stone-600" />
            </span>
            <span className="text-[10px] font-medium tracking-wider text-stone-600 leading-tight mt-0.5">
              Buscar
            </span>
          </button>

          {/* 3. Center Highlight: Personalizar Arreglo / Estudio 2D */}
          {onOpenCustomizer ? (
            <button
              type="button"
              onClick={onOpenCustomizer}
              className="relative -top-2 flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#763D8B] via-[#9146AC] to-[#C5A059] text-white flex items-center justify-center shadow-lg shadow-[#763D8B]/35 border-2 border-white ring-2 ring-[#763D8B]/20">
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-bold tracking-tight text-[#763D8B] uppercase leading-none mt-1">
                Diseñar
              </span>
            </button>
          ) : (
            <div />
          )}

          {/* 4. Carrito con Contador Reactivo */}
          <button
            type="button"
            onClick={openCart}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-stone-600 hover:text-[#763D8B] active:scale-95 transition-all cursor-pointer"
          >
            <span className="relative flex items-center justify-center w-7 h-7">
              <ShoppingCart className="w-5 h-5 text-[#763D8B]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#763D8B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-scale">
                  {itemCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-stone-700 leading-tight mt-0.5">
              Carrito
            </span>
          </button>

          {/* 5. WhatsApp Directo */}
          <a
            href={`https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(settings.store_name || 'Ballonsdei')},%20deseo%20hacer%20un%20pedido.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-emerald-700 active:scale-95 transition-all cursor-pointer"
          >
            <span className="relative flex items-center justify-center w-7 h-7">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-emerald-700 leading-tight mt-0.5">
              WhatsApp
            </span>
          </a>

        </div>
      </nav>
    </>
  );
};
