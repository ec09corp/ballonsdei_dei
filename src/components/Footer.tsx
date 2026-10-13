import React, { useRef } from 'react';
import { Instagram, MessageCircle, Phone, MapPin, Clock, Lock, Sparkles, Heart } from 'lucide-react';
import { StoreSettings } from '../types/database';

interface FooterProps {
  settings: StoreSettings;
  onNavigate: (sectionId: string, categorySlug?: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigate,
  onOpenAdmin,
}) => {
  const tapTrackerRef = useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    const now = Date.now();
    if (now - tapTrackerRef.current.lastTime < 750) {
      tapTrackerRef.current.count += 1;
    } else {
      tapTrackerRef.current.count = 1;
    }
    tapTrackerRef.current.lastTime = now;

    if (tapTrackerRef.current.count >= 5) {
      tapTrackerRef.current.count = 0;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([60, 50, 60]); } catch {}
      }
      onOpenAdmin();
    }
  };

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      onOpenAdmin();
    }, 2000);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };
  const cleanPhone = (settings.whatsapp_number || '+50760000000').replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#1D131C] text-[#D8CAD5] pt-16 pb-12 border-t border-[#30212E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#30212E]">
          {/* Brand info */}
          <div className="lg:col-span-4 space-y-4">
            <div 
              onClick={handleTap}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className="flex items-center gap-3 cursor-pointer select-none"
              title="Ballonsdei"
            >
              {settings.logo_url && (
                <img
                  src={settings.logo_url}
                  alt={settings.store_name || 'Ballonsdei'}
                  className="h-10 sm:h-12 w-auto max-w-[140px] object-contain rounded-md pointer-events-none"
                />
              )}
              <div>
                <span className="font-serif text-2xl tracking-[0.2em] text-[#F5EEF3] font-medium block uppercase">
                  {settings.store_name || 'Ballonsdei'}
                </span>
                <span className="text-[10px] tracking-[0.35em] text-[#B89DB1] uppercase block mt-0.5">
                  Arreglos Florales & Eventos
                </span>
              </div>
            </div>

            <p className="text-xs text-[#B5A1AF] font-light leading-relaxed max-w-sm">
              Creamos momentos inolvidables a través de arte floral de autor, globos de lujo, sombrereras exclusivas, regalos personalizados y alquiler de mobiliario para quinceaños y celebraciones premium.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.instagram_url || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#2E1E2B] hover:bg-[#763D8B] text-[#F5EEF3] flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#2E1E2B] hover:bg-[#25D366] text-[#F5EEF3] flex items-center justify-center transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#F2E8F0]">
              Colecciones
            </h4>
            <ul className="space-y-2 text-xs font-light text-[#B5A1AF]">
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'flores')}
                  className="hover:text-[#F5EEF3] transition-colors"
                >
                  Arreglos Florales
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'regalos-fijos')}
                  className="hover:text-[#F5EEF3] transition-colors"
                >
                  Regalos Fijos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'regalos-variables')}
                  className="hover:text-[#F5EEF3] transition-colors"
                >
                  Regalos Variables
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'peluches')}
                  className="hover:text-[#F5EEF3] transition-colors"
                >
                  Peluches
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'mobiliario')}
                  className="hover:text-[#F5EEF3] transition-colors"
                >
                  Alquiler de Mobiliario
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo', 'quinceanos')}
                  className="hover:text-[#F5EEF3] transition-colors"
                >
                  Quinceaños & Bodas
                </button>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#F2E8F0]">
              Boutique & Horario
            </h4>
            <div className="space-y-2 text-xs font-light text-[#B5A1AF]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C19B65] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#C19B65] shrink-0 mt-0.5" />
                <span>{settings.schedule_hours}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C19B65] shrink-0" />
                <span>{settings.phone}</span>
              </p>
            </div>
          </div>

          {/* Customer Service & Policies */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#F2E8F0]">
              Servicio al Cliente
            </h4>
            <ul className="space-y-2 text-xs font-light text-[#B5A1AF]">
              <li>
                <button
                  onClick={() => onNavigate('visitanos')}
                  className="hover:text-[#F5EEF3] transition-colors"
                >
                  Ubicación & Boutique
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contacto')}
                  className="hover:text-[#F5EEF3] transition-colors"
                >
                  Atención por WhatsApp
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#F5EEF3] transition-colors flex items-center gap-1.5 text-[#C19B65] font-medium cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Panel Administrador</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#836D7D] font-light">
          <p
            onClick={handleTap}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className="cursor-default select-none transition-opacity active:opacity-75"
            title="Ballonsdei"
          >
            © {new Date().getFullYear()} {settings.store_name || 'Ballonsdei'}. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1 select-none">
            <span>Hecho con elegancia y pasión para momentos inolvidables</span>
            <span
              onClick={handleTap}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className="cursor-default transition-transform active:scale-125 inline-block p-1"
              title="Ballonsdei"
            >
              <Heart className="w-3 h-3 text-[#C19B65]" />
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
