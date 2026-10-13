import React from 'react';
import { 
  Sparkles, 
  Heart, 
  Star, 
  Hash, 
  Layers, 
  Circle, 
  Check, 
  Gift, 
  Smile, 
  Type
} from 'lucide-react';
import { GiftCustomization } from '../types/database';
import { soundEffects } from '../lib/soundEffects';

export interface CustomizerState {
  balloonType: string;
  balloonText: string;
  vinylColor: string;
  colorPalette: string;
  ribbonType: string;
  plushToy: string;
  plushPrice: number;
  extras: { name: string; price: number }[];
}

interface InteractiveGiftCustomizerProps {
  basePrice: number;
  customization: CustomizerState;
  onChange: (updated: CustomizerState) => void;
}

export const BALLOON_TYPES = [
  { id: 'burbuja', label: 'Burbuja con Confeti', desc: 'Globo transparente cristal con confeti brillante', icon: Circle },
  { id: 'corazon', label: 'Foil Metálico Corazón', desc: 'Silueta de corazón metalizado de 18"', icon: Heart },
  { id: 'estrella', label: 'Foil Metálico Estrella', desc: 'Estrella brillante con destellos de 18"', icon: Star },
  { id: 'numero', label: 'Número Gigante Foil (34")', desc: 'Número metalizado para aniversarios o cumpleaños', icon: Hash },
  { id: 'bouquet', label: 'Bouquet Trío Cromado', desc: 'Conjunto de 3 globos látex cromados de lujo', icon: Layers },
  { id: 'orbz', label: 'Esfera Orbz Espejo', desc: 'Globo 3D esférico reflectivo de alta duración', icon: Sparkles },
];

export const VINYL_COLORS = [
  { name: 'Dorado Metálico', colorHex: '#D4AF37', border: false },
  { name: 'Blanco Nieve', colorHex: '#FFFFFF', border: true },
  { name: 'Negro Elegante', colorHex: '#18181B', border: false },
  { name: 'Oro Rosa (Rose Gold)', colorHex: '#B76E79', border: false },
  { name: 'Plata Espejo', colorHex: '#94A3B8', border: false },
];

export const COLOR_PALETTES = [
  { name: 'Rosa Pastel & Blanco Perla', colors: ['#F4C2D7', '#FFFFFF'] },
  { name: 'Oro Imperial & Negro', colors: ['#D4AF37', '#18181B'] },
  { name: 'Oro Rosa & Blanco', colors: ['#B76E79', '#FFFFFF'] },
  { name: 'Azul Rey & Plata', colors: ['#1D4ED8', '#CBD5E1'] },
  { name: 'Lavanda & Lila Romance', colors: ['#C4B5FD', '#F5F3FF'] },
  { name: 'Rojo Pasión & Dorado', colors: ['#DC2626', '#D4AF37'] },
  { name: 'Champagne & Crema', colors: ['#F5E6D3', '#FEF3C7'] },
  { name: 'Multicolor Festivo', colors: ['#EC4899', '#3B82F6', '#EAB308'] },
];

export const RIBBON_TYPES = [
  { id: 'saten', label: 'Satén Sedoso', desc: 'Cinta de raso suave de alta caída' },
  { id: 'organza', label: 'Organza con Destellos', desc: 'Cinta translúcida con bordes satinados' },
  { id: 'cascada', label: 'Lazo Cascada de Lujo', desc: 'Lazo múltiple con caídas largas elegantes' },
  { id: 'raffia', label: 'Raffia Rústica Natural', desc: 'Toque orgánico bohemio' },
];

export const PLUSH_OPTIONS = [
  { name: 'Sin peluche', price: 0, desc: 'Solo arreglo floral y globos' },
  { name: '🧸 Osito Clásico Afelpado', price: 8.00, desc: 'Tierno osito de felpa suave marrón' },
  { name: '💖 Osito con Corazón «Love»', price: 10.00, desc: 'Sosteniendo un corazón bordado' },
  { name: '🐰 Conejito Blanco Ultra Suave', price: 9.00, desc: 'Conejito blanco de orejas largas' },
  { name: '🐼 Osito Panda Tierno', price: 11.00, desc: 'Peluche bicolor de colección' },
  { name: '👑 Peluche Mediano Premium', price: 14.00, desc: 'Peluche de tamaño superior con lazo' },
];

export const EXTRA_OPTIONS = [
  { id: 'led', name: 'Luces LED Hada Cálidas en el globo', price: 4.00, desc: 'Ilumina el globo creando un efecto mágico' },
  { id: 'chocolates', name: 'Caja de Chocolates Ferrero Rocher (x8)', price: 7.50, desc: 'Deliciosos bombones finos italianos' },
  { id: 'corona', name: 'Corona Decorativa Dorada en el globo', price: 3.50, desc: 'Tiara mini dorada para reyes y reinas' },
  { id: 'tarjeta', name: 'Tarjeta Escrita a Mano con Caligrafía', price: 0.00, desc: 'Dedicatoria especial sin costo adicional' },
];

export const QUICK_MESSAGES = [
  '¡Feliz Cumpleaños!',
  'Te Amo Mucho ❤️',
  '¡Muchas Felicidades!',
  'Bienvenido Bebé 🍼',
  'Feliz Aniversario ✨',
  'Eres Mi Persona Favorita',
];

export const InteractiveGiftCustomizer: React.FC<InteractiveGiftCustomizerProps> = ({
  basePrice,
  customization,
  onChange,
}) => {
  const toggleExtra = (extra: { name: string; price: number }) => {
    soundEffects.playSparkle();
    const exists = customization.extras.some((e) => e.name === extra.name);
    let updatedExtras: { name: string; price: number }[];
    if (exists) {
      updatedExtras = customization.extras.filter((e) => e.name !== extra.name);
    } else {
      updatedExtras = [...customization.extras, extra];
    }
    onChange({
      ...customization,
      extras: updatedExtras,
    });
  };

  const calculateCustomTotal = () => {
    const plush = customization.plushPrice || 0;
    const extrasTotal = customization.extras.reduce((sum, e) => sum + e.price, 0);
    return basePrice + plush + extrasTotal;
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Interactive Title Banner */}
      <div className="bg-gradient-to-r from-[#763D8B]/10 via-[#F6E3BA]/30 to-[#763D8B]/10 border border-[#763D8B]/20 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-[#763D8B] font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-[#C19B65]" />
          <span>Configurador Interactivo del Regalo</span>
        </div>
        <p className="text-xs text-stone-600 font-light leading-relaxed">
          Personaliza cada elemento de tu arreglo: elige el tipo de globo, la frase personalizada, colores, lazo y peluche.
        </p>
      </div>

      {/* STEP 1: Balloon Type */}
      <div className="space-y-2.5">
        <label className="flex items-center justify-between text-xs font-semibold text-stone-800">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#763D8B] text-white text-[10px] font-bold flex items-center justify-center">1</span>
            <span>Tipo de Globo Principal:</span>
          </span>
          <span className="text-[11px] font-normal text-[#763D8B]">
            {customization.balloonType}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BALLOON_TYPES.map((balloon) => {
            const isSelected = customization.balloonType === balloon.label;
            const IconComponent = balloon.icon;
            return (
              <button
                type="button"
                key={balloon.id}
                onClick={() => {
                  soundEffects.playPop();
                  onChange({ ...customization, balloonType: balloon.label });
                }}
                className={`p-2.5 rounded-xl border text-left customizer-spring-tile cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#763D8B] bg-[#763D8B]/8 ring-2 ring-[#763D8B]/25 shadow-sm scale-[1.015]'
                    : 'border-stone-200 bg-white hover:border-[#763D8B]/40 hover:bg-[#FAF4F7]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg transition-colors duration-150 ${isSelected ? 'bg-[#763D8B] text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#763D8B]" />}
                </div>
                <div>
                  <span className="text-xs font-medium text-stone-800 block line-clamp-1">
                    {balloon.label}
                  </span>
                  <span className="text-[10px] text-stone-500 font-light block line-clamp-2 mt-0.5">
                    {balloon.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Custom Text on Balloon */}
      <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
        <label className="flex items-center justify-between text-xs font-semibold text-stone-800">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#763D8B] text-white text-[10px] font-bold flex items-center justify-center">2</span>
            <span>Mensaje en el Globo (Vinilo adhesivo):</span>
          </span>
          <span className="text-[10px] font-normal text-stone-500">
            {customization.balloonText ? `${customization.balloonText.length}/35 carácteres` : 'Opcional'}
          </span>
        </label>

        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              maxLength={35}
              value={customization.balloonText}
              onChange={(e) => onChange({ ...customization, balloonText: e.target.value })}
              placeholder="Ej. ¡Feliz Cumpleaños Princesa!"
              className="w-full text-xs p-2.5 pr-8 rounded-lg bg-white border border-stone-300 focus:border-[#763D8B] focus:ring-1 focus:ring-[#763D8B] text-stone-800 font-medium"
            />
            <Type className="w-4 h-4 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] text-stone-500 self-center mr-1">Sugerencias:</span>
            {QUICK_MESSAGES.map((msg) => (
              <button
                type="button"
                key={msg}
                onClick={() => {
                  soundEffects.playClick();
                  onChange({ ...customization, balloonText: msg });
                }}
                className="chip-spring text-[10px] px-2.5 py-1 rounded-full bg-white hover:bg-[#FAF4F7] text-stone-700 hover:text-[#763D8B] border border-stone-200 hover:border-[#763D8B]/30 cursor-pointer shadow-2xs"
              >
                {msg}
              </button>
            ))}
          </div>

          {/* Vinyl Color Selector */}
          <div className="pt-2 border-t border-stone-200">
            <span className="text-[11px] font-medium text-stone-700 block mb-1.5">
              Color de las letras de vinilo: <strong className="text-stone-900">{customization.vinylColor}</strong>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {VINYL_COLORS.map((vc) => {
                const isSelected = customization.vinylColor === vc.name;
                return (
                  <button
                    type="button"
                    key={vc.name}
                    onClick={() => {
                      soundEffects.playClick();
                      onChange({ ...customization, vinylColor: vc.name });
                    }}
                    className={`chip-spring inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] cursor-pointer border ${
                      isSelected
                        ? 'border-[#763D8B] bg-white ring-2 ring-[#763D8B]/30 font-semibold text-stone-900 shadow-sm scale-105'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600 font-normal hover:border-stone-300'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full shrink-0 ${vc.border ? 'border border-stone-300' : ''}`}
                      style={{ backgroundColor: vc.colorHex }}
                    />
                    <span>{vc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3: Color Palette */}
      <div className="space-y-2.5">
        <label className="flex items-center justify-between text-xs font-semibold text-stone-800">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#763D8B] text-white text-[10px] font-bold flex items-center justify-center">3</span>
            <span>Paleta de Colores de los Globos:</span>
          </span>
          <span className="text-[11px] font-normal text-[#763D8B]">
            {customization.colorPalette}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COLOR_PALETTES.map((pal) => {
            const isSelected = customization.colorPalette === pal.name;
            return (
              <button
                type="button"
                key={pal.name}
                onClick={() => {
                  soundEffects.playClick();
                  onChange({ ...customization, colorPalette: pal.name });
                }}
                className={`p-2 rounded-xl border text-left customizer-spring-tile cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#763D8B] bg-[#763D8B]/8 ring-2 ring-[#763D8B]/25 shadow-sm scale-[1.015]'
                    : 'border-stone-200 bg-white hover:border-[#763D8B]/40 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-1 mb-2">
                  {pal.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-stone-800 leading-tight">
                  {pal.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 4: Ribbon / Bow Type */}
      <div className="space-y-2.5">
        <label className="flex items-center justify-between text-xs font-semibold text-stone-800">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#763D8B] text-white text-[10px] font-bold flex items-center justify-center">4</span>
            <span>Tipo de Lazo / Cinta de Lujo:</span>
          </span>
          <span className="text-[11px] font-normal text-[#763D8B]">
            {customization.ribbonType}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RIBBON_TYPES.map((rib) => {
            const isSelected = customization.ribbonType === rib.label;
            return (
              <button
                type="button"
                key={rib.id}
                onClick={() => {
                  soundEffects.playClick();
                  onChange({ ...customization, ribbonType: rib.label });
                }}
                className={`p-2.5 rounded-xl border text-left customizer-spring-tile cursor-pointer ${
                  isSelected
                    ? 'border-[#763D8B] bg-[#763D8B]/8 ring-2 ring-[#763D8B]/25 shadow-sm scale-[1.015]'
                    : 'border-stone-200 bg-white hover:border-[#763D8B]/40 hover:bg-stone-50'
                }`}
              >
                <span className="text-xs font-medium text-stone-800 block">
                  {rib.label}
                </span>
                <span className="text-[10px] text-stone-500 font-light block mt-0.5">
                  {rib.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 5: Plush Toy (Peluche) */}
      <div className="space-y-2.5">
        <label className="flex items-center justify-between text-xs font-semibold text-stone-800">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#763D8B] text-white text-[10px] font-bold flex items-center justify-center">5</span>
            <span>Peluche o Acompañamiento:</span>
          </span>
          <span className="text-[11px] font-semibold text-emerald-700">
            {customization.plushPrice > 0 ? `+$${customization.plushPrice.toFixed(2)}` : 'Incluido'}
          </span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PLUSH_OPTIONS.map((opt) => {
            const isSelected = customization.plushToy === opt.name;
            return (
              <button
                type="button"
                key={opt.name}
                onClick={() => {
                  soundEffects.playSparkle();
                  onChange({
                    ...customization,
                    plushToy: opt.name,
                    plushPrice: opt.price,
                  });
                }}
                className={`p-2.5 rounded-xl border text-left customizer-spring-tile cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#763D8B] bg-[#763D8B]/8 ring-2 ring-[#763D8B]/25 shadow-sm scale-[1.015]'
                    : 'border-stone-200 bg-white hover:border-[#763D8B]/40 hover:bg-stone-50'
                }`}
              >
                <div>
                  <span className="text-xs font-medium text-stone-800 block">
                    {opt.name}
                  </span>
                  <span className="text-[10px] text-stone-500 font-light block">
                    {opt.desc}
                  </span>
                </div>
                <span className={`text-xs font-semibold shrink-0 ml-2 ${isSelected ? 'text-[#763D8B]' : 'text-stone-700'}`}>
                  {opt.price === 0 ? '$0.00' : `+$${opt.price.toFixed(2)}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 6: Optional Extras */}
      <div className="space-y-2.5">
        <label className="flex items-center justify-between text-xs font-semibold text-stone-800">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#763D8B] text-white text-[10px] font-bold flex items-center justify-center">6</span>
            <span>Extras Especiales Opcionales:</span>
          </span>
          <span className="text-[10px] text-stone-500 font-normal">
            Puedes seleccionar varios
          </span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXTRA_OPTIONS.map((ext) => {
            const isChecked = customization.extras.some((e) => e.name === ext.name);
            return (
              <button
                type="button"
                key={ext.id}
                onClick={() => toggleExtra({ name: ext.name, price: ext.price })}
                className={`p-2.5 rounded-xl border text-left customizer-spring-tile cursor-pointer flex items-center justify-between ${
                  isChecked
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/25 shadow-sm scale-[1.015]'
                    : 'border-stone-200 bg-white hover:border-emerald-400/40 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors duration-150 ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-stone-800 block">
                      {ext.name}
                    </span>
                    <span className="text-[10px] text-stone-500 font-light block">
                      {ext.desc}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-stone-700 shrink-0 ml-2">
                  {ext.price === 0 ? 'Gratis' : `+$${ext.price.toFixed(2)}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LIVE SUMMARY CARD */}
      <div className="bg-gradient-to-br from-stone-900 to-[#2A1828] text-white p-4 rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F6E3BA]">
            <Gift className="w-4 h-4 text-[#F6E3BA]" />
            <span>Resumen de tu Personalización:</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded text-stone-200">
            En vivo
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-300 font-light">
          <div>
            <span className="text-stone-400 block text-[10px]">Globo:</span>
            <span className="font-medium text-white">{customization.balloonType}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">Lazo:</span>
            <span className="font-medium text-white">{customization.ribbonType}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">Colores:</span>
            <span className="font-medium text-white">{customization.colorPalette}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">Peluche:</span>
            <span className="font-medium text-white">
              {customization.plushToy} {customization.plushPrice > 0 ? `(+$${customization.plushPrice.toFixed(2)})` : ''}
            </span>
          </div>
        </div>

        {customization.balloonText && (
          <div className="bg-white/10 p-2.5 rounded-lg border border-white/10 text-xs">
            <span className="text-[10px] text-[#F6E3BA] block font-medium">
              Texto en vinilo ({customization.vinylColor}):
            </span>
            <span className="font-serif italic text-white text-sm">
              "{customization.balloonText}"
            </span>
          </div>
        )}

        {customization.extras.length > 0 && (
          <div className="text-[11px] text-stone-300">
            <span className="text-stone-400 block text-[10px]">Extras añadidos:</span>
            <span>{customization.extras.map((e) => e.name).join(' · ')}</span>
          </div>
        )}

        {/* Total Price breakdown */}
        <div className="pt-2 border-t border-white/15 flex items-baseline justify-between">
          <div className="text-xs text-stone-300">
            <span>Precio Base: ${basePrice.toFixed(2)}</span>
            {(customization.plushPrice > 0 || customization.extras.length > 0) && (
              <span className="text-emerald-400 ml-1">
                + ${(customization.plushPrice + customization.extras.reduce((s, e) => s + e.price, 0)).toFixed(2)} extras
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs text-[#F6E3BA] block">Precio Total:</span>
            <span className="text-2xl font-bold text-white tracking-tight">
              ${calculateCustomTotal().toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
