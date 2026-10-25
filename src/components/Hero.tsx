import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, SlidersHorizontal, ShieldCheck, Clock, Heart } from 'lucide-react';
import { StoreSettings } from '../types/database';

interface HeroProps {
  settings: StoreSettings;
  onExplore: (category?: string) => void;
  onOpenCustomizer?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExplore, onOpenCustomizer }) => {
  const [scrollY, setScrollY] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const showcaseRef = useRef<HTMLDivElement>(null);

  // Smooth scroll parallax tracking
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3D tactile perspective tilt on desktop fine pointer
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showcaseRef.current) return;
    const rect = showcaseRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 8, y: -y * 8 });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  // Parallax offsets
  const imageOffset = scrollY * 0.06;
  const floatOffset = -scrollY * 0.04;

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] pt-6 pb-14 sm:pb-20 border-b border-[#EAE3DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Top Origin Insignia */}
        <div className="text-center pb-6 sm:pb-10">
          <div className="inline-flex items-center gap-3 text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] uppercase text-[#7D5B28]">
            <span>BALLONSDEI</span>
            <span className="text-[#C5A059]">✦</span>
            <span>CIUDAD DE COLÓN</span>
            <span className="text-[#C5A059]">✦</span>
            <span>EST. 2024</span>
          </div>
        </div>

        {/* Asymmetrical Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Monumental Editorial Typography */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="space-y-3">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C5A059] block">
                Obsequios Personalizados & Arreglos Florales Originales
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.85rem] text-[#241A23] leading-[1.08] font-light tracking-tight">
                {settings.hero_title || (
                  <>
                    La Poética de las Flores, el <span className="italic font-normal text-[#763D8B]">Arte</span> de los Globos.
                  </>
                )}
              </h1>
            </div>

            <p className="text-base sm:text-lg text-[#6E5A69] font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              {settings.hero_subtitle ||
                'Obsequios personalizados y arreglos florales originales concebidos para celebrar instantes inolvidables. Rosas de corte fresco, globos con rotulación en vinilo de precisión y entregas en toda la provincia de Colón.'}
            </p>

            {/* CTAs with Emil Kowalski Mechanical Physics */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onExplore('flores')}
                className="btn-cta-emil w-full sm:w-auto px-8 py-4 bg-[#763D8B] hover:bg-[#602F72] text-white text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase rounded-full shadow-lg shadow-[#763D8B]/20 flex items-center justify-center gap-2.5 cursor-pointer group active:scale-[0.97]"
              >
                <span>Explorar Colección</span>
                <ArrowRight className="w-4 h-4 text-[#F3E2C4] transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </button>

              {onOpenCustomizer ? (
                <button
                  type="button"
                  onClick={onOpenCustomizer}
                  className="btn-tactile w-full sm:w-auto px-7 py-4 bg-white hover:bg-[#FAF4F7] text-[#241A23] border border-[#D9C8D4] hover:border-[#763D8B]/60 text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase rounded-full flex items-center justify-center gap-2.5 cursor-pointer transition-[border-color,background-color] duration-150 active:scale-[0.97]"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#763D8B]" />
                  <span>Diseñar en Lienzo 2D</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onExplore('regalos-fijos')}
                  className="btn-tactile w-full sm:w-auto px-7 py-4 bg-white hover:bg-[#FAF4F7] text-[#241A23] border border-[#D9C8D4] text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase rounded-full flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
                >
                  <span>Descubrir Regalos</span>
                </button>
              )}
            </div>

            {/* Verified Atelier Quality Foundations */}
            <div className="grid grid-cols-3 gap-6 pt-6 sm:pt-8 border-t border-[#EAE3DC] text-center lg:text-left">
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#241A23] block font-light">
                  100%
                </span>
                <span className="text-[11px] text-[#8A7383] font-medium tracking-wider uppercase block mt-0.5">
                  Flores Frescas
                </span>
              </div>
              <div className="border-x border-[#EAE3DC] px-4">
                <span className="font-serif text-2xl sm:text-3xl text-[#763D8B] block font-light">
                  Estudio 2D
                </span>
                <span className="text-[11px] text-[#8A7383] font-medium tracking-wider uppercase block mt-0.5">
                  Visualización Real
                </span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#C5A059] block font-light">
                  Yappy
                </span>
                <span className="text-[11px] text-[#8A7383] font-medium tracking-wider uppercase block mt-0.5">
                  Banco General PTY
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Photography-First Editorial Showcase */}
          <div className="lg:col-span-6 relative">
            <div
              ref={showcaseRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={handleMouseLeave}
              className="relative mx-auto max-w-lg lg:max-w-none transition-transform duration-200 ease-out"
              style={{
                transform: isHovering
                  ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(1.01, 1.01, 1.01)`
                  : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
              }}
            >
              {/* Refined Luxury Matting Frame */}
              <div className="relative aspect-4/5 sm:aspect-5/6 rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-[#EFE8E2]">
                <img
                  src={
                    settings.hero_image ||
                    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1800&q=80'
                  }
                  alt={`Composiciones florales y globos en ${settings.store_name || 'Ballonsdei Boutique'}`}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out will-change-transform"
                  style={{
                    transform: `translate3d(0, ${imageOffset}px, 0) scale(1.04)`,
                  }}
                  loading="eager"
                />

                {/* Subtle Luxury Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F1023]/60 via-transparent to-black/10 pointer-events-none" />

                {/* Top Corner Seal */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-sm border border-[#EAE3DC] shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#763D8B]" />
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#7D5B28]">
                    BALLONSDEI · DE AUTOR
                  </span>
                </div>

                {/* Desktop/Tablet Workshop Commitment Badge */}
                <div
                  className="hidden sm:flex absolute bottom-5 left-5 right-5 p-4 sm:p-5 bg-white/95 backdrop-blur-md rounded-xl border border-[#EAE3DC] shadow-xl items-center justify-between gap-4 transition-transform duration-300 ease-out"
                  style={{
                    transform: `translate3d(0, ${floatOffset}px, 0)`,
                  }}
                >
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#763D8B] font-semibold tracking-[0.18em] uppercase block">
                      Garantía del Atelier
                    </span>
                    <span className="font-serif text-base sm:text-lg font-normal text-[#241A23] truncate block">
                      {settings.hero_badge_title || 'Bouquet Imperial & Globos con Dedicatoria'}
                    </span>
                    <span className="text-[11px] text-[#7A6B76] font-light block">
                      Enviamos fotografía de confirmación antes de la entrega
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onExplore('flores')}
                    className="btn-icon-tactile p-3 bg-[#763D8B] hover:bg-[#602F72] text-white rounded-full shadow-md cursor-pointer shrink-0 active:scale-[0.97]"
                    aria-label="Ver creación destacada"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile-Only Workshop Commitment Card (Positioned neatly below the photo so the entire arrangement photo is 100% visible) */}
              <div className="sm:hidden mt-3 p-3.5 bg-white/95 backdrop-blur-md rounded-xl border border-[#EAE3DC] shadow-sm flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[9px] text-[#763D8B] font-bold tracking-[0.2em] uppercase block">
                    BALLONSDEI · GARANTÍA ATELIER
                  </span>
                  <span className="font-serif text-sm font-medium text-[#241A23] truncate block">
                    {settings.hero_badge_title || 'Bouquet Imperial & Globos con Dedicatoria'}
                  </span>
                  <span className="text-[10px] text-[#7A6B76] font-light block">
                    Enviamos foto de confirmación antes del despacho
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onExplore('flores')}
                  className="p-2.5 bg-[#763D8B] text-white rounded-full shadow-xs cursor-pointer shrink-0 active:scale-95"
                  aria-label="Ver creación destacada"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Refined Editorial Delivery Ribbon */}
      <div className="mt-12 sm:mt-16 border-t border-[#EAE3DC] bg-[#FAF6F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <Clock className="w-4 h-4 text-[#763D8B] shrink-0" />
              <div>
                <span className="text-xs font-semibold text-[#241A23] tracking-wide uppercase block">
                  Entregas Programadas Puntuales
                </span>
                <span className="text-[11px] text-[#7A6B76] font-light">
                  Despachos coordinados en toda la Provincia de Colón
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3.5 border-y sm:border-y-0 sm:border-x border-[#EAE3DC] py-3 sm:py-0 sm:px-6">
              <Heart className="w-4 h-4 text-[#C5A059] shrink-0" />
              <div>
                <span className="text-xs font-semibold text-[#241A23] tracking-wide uppercase block">
                  Caligrafía en Vinilo de Precisión
                </span>
                <span className="text-[11px] text-[#7A6B76] font-light">
                  Nombres, frases y mensajes personalizados
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3.5">
              <ShieldCheck className="w-4 h-4 text-[#763D8B] shrink-0" />
              <div>
                <span className="text-xs font-semibold text-[#241A23] tracking-wide uppercase block">
                  Garantía de Frescura Botánica
                </span>
                <span className="text-[11px] text-[#7A6B76] font-light">
                  Rosas y follajes seleccionados cada mañana
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
