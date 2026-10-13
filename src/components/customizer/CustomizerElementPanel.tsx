import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Type, 
  Palette, 
  Plus, 
  Check, 
  Trash2,
  Flower2,
  CircleDot,
  Candy,
  HeartHandshake,
  Ribbon,
  Box,
  Crown
} from 'lucide-react';
import { 
  CustomizerCategory, 
  CustomizerElementItem, 
  CanvasPlacedElement, 
  CanvasTextElement,
  CustomizerColor 
} from '../../types/customizer';
import { STANDARD_COLORS, CATEGORY_LABELS } from '../../data/defaultCustomizerElements';
import { soundEffects } from '../../lib/soundEffects';
import { CartoonIllustration } from './CartoonIllustrations';

interface CustomizerElementPanelProps {
  elementsList: CustomizerElementItem[];
  selectedId: string | null;
  placedElements: CanvasPlacedElement[];
  placedTexts: CanvasTextElement[];
  onAddElement: (elem: CustomizerElementItem) => void;
  onAddText: (text: string, color: string, fontFamily: string, fontSize: number) => void;
  onUpdateSelectedColor: (colorHex: string) => void;
  onUpdateSelectedText: (text: string, color: string, fontFamily: string, fontSize: number) => void;
  onDeleteSelected: () => void;
}

const CATEGORY_TABS: { id: CustomizerCategory | 'textos'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'flores', label: 'Flores', icon: Flower2 },
  { id: 'globos', label: 'Globos', icon: CircleDot },
  { id: 'chocolates', label: 'Chocolates', icon: Candy },
  { id: 'peluches', label: 'Peluches', icon: HeartHandshake },
  { id: 'decoracion', label: 'Decoración', icon: Sparkles },
  { id: 'cintas', label: 'Cintas', icon: Ribbon },
  { id: 'cajas', label: 'Cajas', icon: Box },
  { id: 'accesorios', label: 'Accesorios', icon: Crown },
  { id: 'textos', label: 'Textos', icon: Type },
];

const ELEGANT_FONTS = [
  { name: 'Playfair Display (Elegante)', value: 'Playfair Display, serif' },
  { name: 'Great Vibes (Caligrafía)', value: 'Great Vibes, cursive' },
  { name: 'Dancing Script (Romance)', value: 'Dancing Script, cursive' },
  { name: 'Cormorant Garamond (Clásico)', value: 'Cormorant Garamond, serif' },
  { name: 'Plus Jakarta Sans (Moderno)', value: 'Plus Jakarta Sans, sans-serif' },
];

const QUICK_TEXT_PRESETS = [
  '¡Feliz Cumpleaños!',
  'Te Amo Mucho',
  'Feliz Aniversario',
  'Eres Mi Persona Favorita',
  'Bienvenido Bebé',
  '¡Muchas Felicidades!',
];

export const CustomizerElementPanel: React.FC<CustomizerElementPanelProps> = ({
  elementsList,
  selectedId,
  placedElements,
  placedTexts,
  onAddElement,
  onAddText,
  onUpdateSelectedColor,
  onUpdateSelectedText,
  onDeleteSelected,
}) => {
  const [activeCategory, setActiveCategory] = useState<CustomizerCategory | 'textos'>('flores');
  const [searchQuery, setSearchQuery] = useState('');

  // Text builder state
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#D4AF37'); // Default gold
  const [fontFamily, setFontFamily] = useState(ELEGANT_FONTS[0].value);
  const [fontSize, setFontSize] = useState(24);

  // Check if an element or text is currently selected on canvas
  const selectedElement = placedElements.find((e) => e.id === selectedId);
  const selectedText = placedTexts.find((t) => t.id === selectedId);

  // Available colors for the currently selected element
  const currentCatalogItem = selectedElement 
    ? elementsList.find((e) => e.id === selectedElement.elementId || e.name === selectedElement.name)
    : null;

  const availableColorsForSelected = currentCatalogItem?.available_colors && currentCatalogItem.available_colors.length > 0
    ? currentCatalogItem.available_colors
    : STANDARD_COLORS;

  // Filter catalog elements
  const filteredCatalog = elementsList.filter((elem) => {
    if (activeCategory === 'textos') return false;
    if (elem.category !== activeCategory) return false;
    if (searchQuery.trim() && !elem.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCreateText = () => {
    if (!textInput.trim()) return;
    soundEffects.playPop();
    onAddText(textInput.trim(), textColor, fontFamily, fontSize);
    setTextInput('');
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[#E4D8CE] shadow-sm overflow-hidden h-full">
      {/* 1. Category Tabs Horizontal Scroller */}
      <div className="bg-[#FAF7F4] border-b border-[#EBE2DB] p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => {
                soundEffects.playClick();
                setActiveCategory(tab.id);
              }}
              className={`chip-spring px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-[#763D8B] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-[#F2ECE6] border border-[#E3D7CE]'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. SUB-SECTION: SELECTED ELEMENT COLOR & PROPERTY CONTROLS (If user selected something on canvas) */}
      {(selectedElement || selectedText) && (
        <div className="p-3 bg-[#FAF5F0] border-b border-[#E8DED6] space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3B2D26] flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-[#763D8B]" />
              <span>Personalizar: {selectedElement ? selectedElement.name : 'Texto'}</span>
            </span>
            <button
              type="button"
              onClick={onDeleteSelected}
              className="btn-spring-action text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Quitar</span>
            </button>
          </div>

          {/* Color Swatches for Selected Object */}
          <div>
            <span className="text-[10px] text-stone-500 block mb-1">
              {selectedElement ? 'Cambiar color del elemento:' : 'Cambiar color del texto:'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {availableColorsForSelected.map((col) => {
                const isCurrentColor = selectedElement 
                  ? selectedElement.color === col.hex 
                  : selectedText?.color === col.hex;

                return (
                  <button
                    type="button"
                    key={col.hex}
                    onClick={() => {
                      soundEffects.playClick();
                      if (selectedElement) {
                        onUpdateSelectedColor(col.hex);
                      } else if (selectedText) {
                        onUpdateSelectedText(selectedText.text, col.hex, selectedText.fontFamily, selectedText.fontSize);
                      }
                    }}
                    className={`chip-spring w-6 h-6 rounded-full border-2 cursor-pointer relative shadow-2xs ${
                      isCurrentColor 
                        ? 'border-[#763D8B] scale-115 ring-2 ring-[#763D8B]/30' 
                        : 'border-white hover:scale-110'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {isCurrentColor && (
                      <Check className={`w-3 h-3 absolute inset-0 m-auto ${col.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN PANEL BODY: TEXT BUILDER OR CATALOG OF ELEMENTS */}
      <div className="p-3 sm:p-4 flex-1 overflow-y-auto min-h-[260px] max-h-[540px]">
        {activeCategory === 'textos' ? (
          /* ======================================= */
          /* TEXT PERSONALIZATION BUILDER            */
          /* ======================================= */
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1.5">
                Escribe tu Dedicatoria o Mensaje:
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={40}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ej. ¡Feliz Cumpleaños Mi Amor! ❤️"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:border-[#763D8B] focus:ring-1 focus:ring-[#763D8B] text-stone-800 font-medium"
                />
                <span className="text-[10px] text-stone-400 block text-right">
                  {textInput.length}/40 carácteres
                </span>
              </div>
            </div>

            {/* Quick Text Suggestions */}
            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-1.5">
                Frases Sugeridas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TEXT_PRESETS.map((pst) => (
                  <button
                    type="button"
                    key={pst}
                    onClick={() => {
                      soundEffects.playClick();
                      setTextInput(pst);
                    }}
                    className="text-[10px] px-2 py-1 bg-stone-100 hover:bg-[#763D8B]/10 hover:text-[#763D8B] text-stone-700 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                  >
                    {pst}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family Selector */}
            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-1">
                Tipografía Elegante:
              </span>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white text-stone-800"
              >
                {ELEGANT_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Color Swatches */}
            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-1.5">
                Color de las Letras:
              </span>
              <div className="flex flex-wrap gap-2">
                {STANDARD_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.hex}
                    onClick={() => {
                      soundEffects.playClick();
                      setTextColor(c.hex);
                    }}
                    className={`chip-spring w-7 h-7 rounded-full border-2 cursor-pointer relative shadow-2xs ${
                      textColor === c.hex 
                        ? 'border-[#763D8B] scale-110 ring-2 ring-[#763D8B]/30' 
                        : 'border-white hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {textColor === c.hex && (
                      <Check className={`w-3.5 h-3.5 absolute inset-0 m-auto ${c.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 mb-1">
                <span>Tamaño inicial de letra:</span>
                <span>{fontSize}px</span>
              </div>
              <input
                type="range"
                min={16}
                max={44}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[#763D8B] cursor-pointer"
              />
            </div>

            {/* Add Text to Canvas Button */}
            <button
              type="button"
              onClick={handleCreateText}
              disabled={!textInput.trim()}
              className="btn-cta-emil w-full py-2.5 px-4 bg-[#763D8B] hover:bg-[#602F72] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Colocar Texto en el Lienzo</span>
            </button>
          </div>
        ) : (
          /* ======================================= */
          /* CATALOG OF ELEMENTS (GRID DE MINIATURAS) */
          /* ======================================= */
          <div className="space-y-3">
            {/* Search Filter input */}
            <div className="relative">
              <input
                type="text"
                placeholder={`Buscar en ${CATEGORY_LABELS[activeCategory]?.label || 'elementos'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs p-2 pl-7.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-stone-800 focus:border-[#763D8B] focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Elements Grid */}
            {filteredCatalog.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                No se encontraron elementos en esta categoría.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                {filteredCatalog.map((elem) => (
                  <button
                    type="button"
                    key={elem.id}
                    onClick={() => {
                      soundEffects.playPop();
                      onAddElement(elem);
                    }}
                    className="group p-2.5 rounded-xl border border-stone-200 hover:border-[#763D8B] bg-white hover:bg-[#FAF6F0] customizer-spring-tile cursor-pointer flex flex-col items-center text-center shadow-2xs hover:shadow-xs relative"
                  >
                    {/* Cartoon Illustration Thumbnail with transparent background effect */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#EADBCE] flex items-center justify-center p-1.5 mb-1.5 group-hover:scale-110 transition-transform duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xs">
                      {elem.image_url.startsWith('data:image/svg+xml') || !elem.image_url.startsWith('http') ? (
                        <CartoonIllustration
                          type={elem.name}
                          color={elem.default_color || '#DC2626'}
                          className="w-full h-full pointer-events-none"
                        />
                      ) : (
                        <img
                          src={elem.image_url}
                          alt={elem.name}
                          className="w-full h-full object-contain filter drop-shadow-sm"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Name */}
                    <span className="text-[11px] font-semibold text-stone-800 line-clamp-1 group-hover:text-[#763D8B] transition-colors duration-150">
                      {elem.name}
                    </span>

                    {/* Price Tag */}
                    <span className="text-[10px] font-bold text-[#C19B65] mt-0.5">
                      +${elem.price.toFixed(2)}
                    </span>

                    {/* Quick Add Pill */}
                    <span className="mt-1 text-[9px] px-2 py-0.5 rounded-full bg-[#763D8B]/10 text-[#763D8B] font-bold group-hover:bg-[#763D8B] group-hover:text-white transition-colors duration-150 flex items-center gap-0.5">
                      <Plus className="w-2.5 h-2.5" />
                      <span>Agregar</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Panel Footer: Quick Instruction Helper */}
      <div className="p-2.5 bg-[#FAF7F4] border-t border-[#EBE2DB] text-[10px] text-stone-500 text-center font-light">
        💡 <em>Haz clic en cualquier elemento para agregarlo al lienzo. Puedes arrastrarlo libremente y cambiar su tamaño o color.</em>
      </div>
    </div>
  );
};
