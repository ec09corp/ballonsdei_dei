import React from 'react';
import { Smartphone, Download, X, Share2, PlusSquare, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, showIOSModal, setShowIOSModal, install, dismiss } = usePWAInstall();

  if (isInstalled || !isInstallable) {
    if (!showIOSModal) return null;
  }

  return (
    <>
      {/* 1. DISCREET FLOATING INSTALL BAR FOR MOBILE */}
      {isInstallable && (
        <aside 
          aria-label="Instalar aplicación Ballonsdei"
          className="fixed bottom-[calc(4.4rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-40 sm:hidden animate-fade-in"
        >
          <div className="bg-[#241A23]/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 shrink-0 p-1 border border-white/20">
                <img
                  src="/logo/logo.png"
                  alt="Ballonsdei App"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-white">Instalar App Ballonsdei</p>
                <p className="text-[10px] text-white/70 truncate">
                  {isIOS ? 'Agrega a pantalla de inicio en iOS' : 'Acceso rápido y sin esperas'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={install}
                className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#B38D48] text-[#241A23] font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="p-1 text-white/50 hover:text-white rounded-lg active:scale-95 transition-transform cursor-pointer"
                aria-label="Cerrar sugerencia de instalación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. iOS SAFARI BOTTOM SHEET GUIDE */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 animate-fade-in sm:hidden"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className="w-full bg-white rounded-t-3xl p-6 shadow-2xl border-t border-[#EAE3DC] space-y-5 animate-bottom-sheet"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#FAF4F7] p-1.5 border border-[#763D8B]/20 shrink-0">
                  <img src="/logo/logo.png" alt="Logo Ballonsdei" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#241A23]">
                    Instalar Ballonsdei en iPhone
                  </h3>
                  <p className="text-xs text-stone-500">
                    Úsala como una App nativa a pantalla completa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full"
                aria-label="Cerrar guía"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE5DF]">
                <div className="w-8 h-8 rounded-lg bg-[#763D8B]/10 text-[#763D8B] flex items-center justify-center shrink-0 mt-0.5">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-[#241A23]">Paso 1: Toca el botón Compartir</p>
                  <p className="text-stone-500 mt-0.5">
                    En la barra inferior de Safari, pulsa el icono de compartir (<span className="font-bold">⎋</span>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE5DF]">
                <div className="w-8 h-8 rounded-lg bg-[#763D8B]/10 text-[#763D8B] flex items-center justify-center shrink-0 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-[#241A23]">Paso 2: "Agregar a Inicio"</p>
                  <p className="text-stone-500 mt-0.5">
                    Desplázate hacia abajo en el menú y selecciona <span className="font-bold text-[#763D8B]">Agregar a pantalla de inicio</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE5DF]">
                <div className="w-8 h-8 rounded-lg bg-[#763D8B]/10 text-[#763D8B] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-[#241A23]">Paso 3: Toca "Agregar"</p>
                  <p className="text-stone-500 mt-0.5">
                    Pulsa <span className="font-bold text-stone-800">Agregar</span> en la esquina superior derecha para finalizar.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 bg-[#763D8B] text-white font-semibold text-xs tracking-wider uppercase rounded-xl shadow-md active:scale-98 transition-transform cursor-pointer"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
