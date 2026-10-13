import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  X, 
  Phone, 
  MapPin, 
  ChevronRight,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Category, StoreSettings } from '../types/database';

interface HeaderProps {
  settings: StoreSettings;
  categories?: Category[];
  activeNav: string;
  onNavigate: (sectionId: string, categorySlug?: string) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onOpenCustomizer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories = [],
  activeNav,
  onNavigate,
  onOpenSearch,
  onOpenAdmin,
  onOpenCustomizer,
}) => {
  const { itemCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoTapTrackerRef = useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });
  const logoNavTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [tapCounter, setTapCounter] = useState<number>(0);
  const resetTapFeedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    // Allow up to 1100ms between consecutive taps for mobile screens
    if (now - logoTapTrackerRef.current.lastTime < 1100) {
      logoTapTrackerRef.current.count += 1;
    } else {
      logoTapTrackerRef.current.count = 1;
    }
    logoTapTrackerRef.current.lastTime = now;

    const currentTaps = logoTapTrackerRef.current.count;
    setTapCounter(currentTaps);

    if (resetTapFeedbackTimerRef.current) {
      clearTimeout(resetTapFeedbackTimerRef.current);
    }
    resetTapFeedbackTimerRef.current = setTimeout(() => {
      setTapCounter(0);
    }, 1500);

    // Haptic feedback on tap
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (currentTaps >= 5) {
          navigator.vibrate([80, 50, 100]);
        } else if (currentTaps >= 2) {
          navigator.vibrate([35]);
        }
      } catch {}
    }

    // Trigger Admin Mode on 5 consecutive taps
    if (currentTaps >= 5) {
      e.preventDefault();
      e.stopPropagation();
      if (logoNavTimerRef.current) {
        clearTimeout(logoNavTimerRef.current);
        logoNavTimerRef.current = null;
      }
      logoTapTrackerRef.current.count = 0;
      setTapCounter(0);
      setMobileMenuOpen(false);

      window.location.hash = '#admin';
      onOpenAdmin();
      return;
    }

    // Debounce regular navigation so quick consecutive taps don't trigger page re-scroll
    if (logoNavTimerRef.current) {
      clearTimeout(logoNavTimerRef.current);
    }
    logoNavTimerRef.current = setTimeout(() => {
      if (logoTapTrackerRef.current.count > 0 && logoTapTrackerRef.current.count < 5) {
        handleNavClick('catalogo', 'all');
      }
      logoTapTrackerRef.current.count = 0;
      setTapCounter(0);
    }, 600);
  };

  const cleanPhone = (settings.whatsapp_number || '+50764324750').replace(/[^0-9]/g, '');

  const dynamicCategories = categories.filter((c) => c.active);

  const navItems = [
    { label: 'Productos', id: 'catalogo', category: 'all' },
    ...dynamicCategories.map((c) => ({
      label: c.name,
      id: 'catalogo',
      category: c.slug,
    })),
    { label: 'Visítanos', id: 'visitanos' },
    { label: 'Contacto', id: 'contacto' },
  ];

  const handleNavClick = (id: string, category?: string) => {
    onNavigate(id, category);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-40 transition-[background-color,border-color,box-shadow] duration-200 ease-out ${
      isScrolled 
        ? 'bg-white/92 backdrop-blur-xl shadow-lg border-b border-[#D4AF37]/35' 
        : 'bg-white/98 backdrop-blur-md border-b border-stone-200 shadow-2xs'
    }`}>
      {/* Top Announcement Bar */}
      <div className="bg-[#1F0E23] text-[#F3EBF0] text-xs py-1.5 sm:py-2 px-3 sm:px-4 border-b border-[#C5A059]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-[10px] sm:text-xs font-light text-stone-300 mx-auto sm:mx-0 flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="text-[#C5A059]">✦</span>
            <span className="font-bold text-white tracking-wider">BALLONSDEI</span>
            <span className="text-[#C5A059]">·</span>
            <span className="hidden sm:inline">Obsequios Personalizados & Arreglos Florales · Colón · </span>
            <span className="sm:hidden">Colón · </span>
            <span>VIP WhatsApp: </span>
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E5CA92] hover:text-white font-semibold transition-colors"
            >
              {settings.whatsapp_number || '+507 6432-4750'}
            </a>
          </div>
          <div className="hidden md:flex items-center gap-5 text-xs font-light text-stone-300">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-[#C5A059]" />
              {settings.phone || '+507 6432-4750'}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#C5A059]" />
              Ciudad de Colón
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 transition-colors focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left relative">
            <div className="inline-block relative">
              <button
                type="button"
                onClick={handleLogoTap}
                style={{ touchAction: 'manipulation' }}
                className="inline-flex items-center gap-2.5 group focus:outline-none text-left cursor-pointer select-none active:scale-[0.98] transition-transform"
                aria-label="Ir al catálogo de la tienda"
              >
                {settings.logo_url ? (
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <img
                      src={settings.logo_url}
                      alt={settings.store_name || 'Ballonsdei'}
                      className="h-9 sm:h-12 w-auto max-w-[120px] sm:max-w-[150px] object-contain rounded-md pointer-events-none"
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-serif text-base sm:text-2xl tracking-[0.14em] font-medium text-stone-900 group-hover:text-[#763D8B] transition-colors uppercase leading-tight">
                        {settings.store_name || 'Ballonsdei'}
                      </span>
                      <span className="text-[8px] sm:text-[9px] tracking-[0.22em] text-[#763D8B] font-semibold uppercase">
                        Boutique de Autor
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col text-left">
                    <span className="font-serif text-xl sm:text-3xl tracking-[0.18em] font-medium text-stone-900 group-hover:text-[#763D8B] transition-colors uppercase">
                      {settings.store_name || 'Ballonsdei'}
                    </span>
                    <span className="text-[9px] tracking-[0.3em] text-[#763D8B] uppercase font-semibold -mt-0.5">
                      Boutique de Autor
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isSelected = activeNav === (item.category || item.id);
              return (
                <button
                  key={`${item.id}-${item.category || ''}-${item.label}`}
                  onClick={() => handleNavClick(item.id, item.category)}
                  className={`text-xs font-semibold tracking-wider uppercase transition-colors relative py-1 cursor-pointer ${
                    isSelected
                      ? 'text-[#763D8B] border-b-2 border-[#763D8B]'
                      : 'text-stone-700 hover:text-[#763D8B]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Customizer Direct Studio Button */}
            {onOpenCustomizer && (
              <button
                type="button"
                onClick={onOpenCustomizer}
                className="btn-cta-emil inline-flex items-center justify-center px-3.5 py-1.5 bg-[#763D8B]/10 hover:bg-[#763D8B] text-[#763D8B] hover:text-white border border-[#763D8B]/25 text-xs font-bold rounded-full cursor-pointer shadow-2xs"
                title="Personalizar un arreglo en el lienzo interactivo"
              >
                <span className="hidden sm:inline">Personalizar Arreglo</span>
                <span className="sm:hidden">Personalizar</span>
              </button>
            )}

            {/* WhatsApp direct button like balloonspty */}
            <a
              href={`https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(settings.store_name || 'Ballonsdei')},%20deseo%20hacer%20un%20pedido.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-full cursor-pointer"
              title="Pedir por WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="btn-icon-tactile p-2 text-stone-700 hover:text-[#763D8B] hover:bg-stone-100 rounded-full cursor-pointer"
              title="Buscar productos"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart Button with boutique ShoppingCart icon */}
            <button
              onClick={openCart}
              className="btn-icon-tactile relative p-2 text-stone-700 hover:text-[#763D8B] hover:bg-stone-100 rounded-full cursor-pointer"
              title="Ver carrito de compras"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#763D8B] text-white text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-scale">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col p-5 sm:p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-5 border-b border-stone-200">
              <div
                onClick={handleLogoTap}
                className="select-none cursor-pointer active:opacity-75 transition-opacity"
              >
                <span className="font-serif text-xl tracking-[0.15em] font-medium text-stone-900 block uppercase">
                  {settings.store_name || 'Ballonsdei'}
                </span>
                <span className="text-[9px] tracking-[0.25em] text-[#763D8B] font-semibold uppercase">
                  Boutique Ballonsdei · Colón
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-stone-600 hover:bg-stone-100 rounded-full cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-4 space-y-1">
              {onOpenCustomizer && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCustomizer();
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-bold tracking-wider uppercase text-[#763D8B] bg-[#763D8B]/10 hover:bg-[#763D8B]/15 rounded-xl transition-colors cursor-pointer mb-2"
                >
                  <span>Personalizar mi Arreglo</span>
                  <ChevronRight className="w-4 h-4 text-[#763D8B]" />
                </button>
              )}

              {navItems.map((item) => (
                <button
                  key={`${item.id}-${item.category || ''}-${item.label}`}
                  onClick={() => handleNavClick(item.id, item.category)}
                  className="w-full flex items-center justify-between px-3 py-3 text-left text-sm tracking-wider uppercase text-stone-700 hover:bg-stone-50 rounded-md transition-colors cursor-pointer"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              ))}

              <a
                href={`https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(settings.store_name || 'Ballonsdei')},%20deseo%20hacer%20un%20pedido.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3 py-3 text-left text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors mt-2"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Pedir por WhatsApp</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-500" />
              </a>

              {/* Mobile Direct Access to Admin Panel */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.hash = '#admin';
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors mt-3 cursor-pointer border border-stone-200"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8D5844]" />
                  <span>Panel Administrador (Admin)</span>
                </div>
                <span className="text-[10px] bg-[#8D5844] text-white px-2 py-0.5 rounded-full font-semibold">
                  Acceder
                </span>
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-stone-200 space-y-3 text-xs text-stone-500">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#763D8B]" />
                {settings.phone || '+507 6432-4750'}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#763D8B]" />
                {settings.address}
              </p>
            </div>
          </div>
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </header>
  );
};
