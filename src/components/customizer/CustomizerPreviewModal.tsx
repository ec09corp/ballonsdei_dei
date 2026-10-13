import React from 'react';
import { 
  X, 
  Sparkles, 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  Heart, 
  Gift, 
  Truck,
  ShieldCheck
} from 'lucide-react';
import { ArrangementDesignData } from '../../types/customizer';
import { soundEffects } from '../../lib/soundEffects';
import { CartoonIllustration } from './CartoonIllustrations';

interface CustomizerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  designData: ArrangementDesignData | null;
  onConfirmAddToCart: () => void;
}

export const CustomizerPreviewModal: React.FC<CustomizerPreviewModalProps> = ({
  isOpen,
  onClose,
  designData,
  onConfirmAddToCart,
}) => {
  if (!isOpen || !designData) return null;

  // Group elements count
  const elementCounts = designData.elements.reduce((acc, el) => {
    acc[el.name] = (acc[el.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl shadow-2xl overflow-hidden my-auto border border-[#E8DED7] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE2DB] bg-white">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#763D8B]/10 text-[#763D8B] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C19B65]" />
            </span>
            <span className="font-serif text-lg font-bold text-[#2E2421]">
              Así quedaría tu arreglo
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Cerrar vista previa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* 1. Big Visual Preview Snapshot Canvas */}
          <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-[#D7C7B9] bg-gradient-to-b from-[#EFE6DD] via-[#E4D7CC] to-[#D5C2B3] shadow-lg flex items-center justify-center p-4">
            {/* Pedestal Surface Shadow */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-14 rounded-[50%] bg-gradient-to-b from-[#CDBEB0] to-[#B3A192] shadow-[0_12px_30px_rgba(40,25,20,0.3)] pointer-events-none opacity-80" />

            {/* Reference Image base */}
            {designData.referenceImage && (
              <div className="absolute inset-0 flex items-center justify-center p-6 opacity-30 pointer-events-none">
                <img
                  src={designData.referenceImage}
                  alt="Referencia"
                  className="w-full h-full object-contain filter grayscale"
                />
              </div>
            )}

            {/* Placed Elements Rendered */}
            <div className="relative w-full h-full">
              {designData.elements.map((el) => (
                <div
                  key={el.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
                    zIndex: el.zIndex,
                    filter: el.color && el.color !== '#FFFFFF' 
                      ? `drop-shadow(0 4px 10px rgba(0,0,0,0.35)) drop-shadow(0 0 6px ${el.color}66)`
                      : 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
                  }}
                >
                  {el.image.startsWith('data:image/svg+xml') || !el.image.startsWith('http') ? (
                    <CartoonIllustration
                      type={el.name}
                      color={el.color || '#DC2626'}
                      className="w-full h-full"
                    />
                  ) : (
                    <img
                      src={el.image}
                      alt={el.name}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ))}

              {/* Placed Texts Rendered */}
              {designData.texts.map((tx) => (
                <div
                  key={tx.id}
                  className="absolute pointer-events-none whitespace-nowrap"
                  style={{
                    left: `${tx.x}%`,
                    top: `${tx.y}%`,
                    transform: `translate(-50%, -50%) rotate(${tx.rotation}deg)`,
                    zIndex: tx.zIndex,
                  }}
                >
                  <p
                    className="font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] px-2 py-0.5 leading-tight"
                    style={{
                      fontSize: `${tx.fontSize}px`,
                      color: tx.color,
                      fontFamily: tx.fontFamily,
                      textShadow: tx.color === '#FFFFFF' 
                        ? '0 2px 4px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.6)' 
                        : '0 2px 4px rgba(0,0,0,0.8)',
                    }}
                  >
                    {tx.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Verified Badge */}
            <div className="absolute top-3 left-3 bg-[#763D8B] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Diseño Final Validado</span>
            </div>
          </div>

          {/* 2. Order Breakdown Summary */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DED6] space-y-3">
            <h4 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
              Resumen de Personalización
            </h4>

            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-600 font-medium">Producto base:</span>
              <span className="font-semibold text-stone-900">{designData.productName || 'Arreglo de Autor'}</span>
            </div>

            {/* Elements breakdown */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-700 block mb-1.5">
                Elementos añadidos en tu diseño ({designData.elements.length}):
              </span>
              {Object.keys(elementCounts).length === 0 ? (
                <span className="text-xs text-stone-400 italic">Sin elementos adicionales</span>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {Object.entries(elementCounts).map(([name, qty]) => (
                    <div key={name} className="flex items-center gap-2 text-stone-700 bg-[#FAF7F4] p-1.5 rounded-lg border border-stone-100">
                      <span className="w-2 h-2 rounded-full bg-[#763D8B]" />
                      <span className="font-medium truncate">{name}</span>
                      <span className="ml-auto font-bold text-[#763D8B]">x{qty}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Texts list */}
            {designData.texts.length > 0 && (
              <div className="pt-2 border-t border-stone-100 text-xs">
                <span className="text-[11px] font-bold text-stone-700 block mb-1">
                  Mensaje personalizado:
                </span>
                {designData.texts.map((t, idx) => (
                  <p key={idx} className="italic text-[#763D8B] font-medium pl-2 border-l-2 border-[#763D8B]">
                    «{t.text}»
                  </p>
                ))}
              </div>
            )}

            {/* Price lines */}
            <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Precio base del producto:</span>
                <span>${designData.basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Personalización (elementos y accesorios):</span>
                <span>+${designData.customizationPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#2E2421] pt-1.5 border-t border-stone-200">
                <span>Total a pagar:</span>
                <span className="text-[#763D8B]">${designData.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-white border-t border-[#EBE2DB] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver y Modificar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playSuccess();
              onConfirmAddToCart();
            }}
            className="btn-cta-emil w-full sm:w-auto flex-1 px-8 py-3.5 bg-[#763D8B] hover:bg-[#602F72] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-[#F6E3BA]" />
            <span>Confirmar y Agregar al Carrito (${designData.totalPrice.toFixed(2)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
