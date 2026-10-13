import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  RotateCw, 
  Trash2, 
  Copy, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Move,
  Maximize2,
  Sparkles,
  Layers,
  Palette,
  Check
} from 'lucide-react';
import { CanvasPlacedElement, CanvasTextElement } from '../../types/customizer';
import { soundEffects } from '../../lib/soundEffects';
import { CartoonIllustration } from './CartoonIllustrations';

interface InteractiveArrangementCanvasProps {
  elements: CanvasPlacedElement[];
  texts: CanvasTextElement[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onUpdateElements: (elements: CanvasPlacedElement[], recordHistory?: boolean) => void;
  onUpdateTexts: (texts: CanvasTextElement[], recordHistory?: boolean) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  referenceImageUrl?: string;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

export const InteractiveArrangementCanvas: React.FC<InteractiveArrangementCanvasProps> = ({
  elements,
  texts,
  selectedId,
  onSelectId,
  onUpdateElements,
  onUpdateTexts,
  onDeleteSelected,
  onDuplicateSelected,
  onBringToFront,
  onSendToBack,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  referenceImageUrl,
  canvasRef,
}) => {
  const localContainerRef = useRef<HTMLDivElement | null>(null);
  const activeContainer = canvasRef || localContainerRef;

  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<'move' | 'resize' | 'rotate' | null>(null);

  // Drag tracking state
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    elemX: number;
    elemY: number;
    initialWidth: number;
    initialHeight: number;
    initialRotation: number;
    centerX: number;
    centerY: number;
  }>({
    startX: 0,
    startY: 0,
    elemX: 0,
    elemY: 0,
    initialWidth: 80,
    initialHeight: 80,
    initialRotation: 0,
    centerX: 0,
    centerY: 0,
  });

  const selectedElement = elements.find((e) => e.id === selectedId);
  const selectedText = texts.find((t) => t.id === selectedId);

  // Click outside to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'main-canvas-surface') {
      onSelectId(null);
    }
  };

  // Start Move
  const handlePointerDownMove = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    onSelectId(id);
    setActiveAction('move');
    setIsDragging(true);

    const isElem = elements.some((el) => el.id === id);
    if (isElem) {
      const el = elements.find((x) => x.id === id)!;
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        elemX: el.x,
        elemY: el.y,
        initialWidth: el.width,
        initialHeight: el.height,
        initialRotation: el.rotation,
        centerX: 0,
        centerY: 0,
      };
    } else {
      const tx = texts.find((x) => x.id === id)!;
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        elemX: tx.x,
        elemY: tx.y,
        initialWidth: 0,
        initialHeight: 0,
        initialRotation: tx.rotation,
        centerX: 0,
        centerY: 0,
      };
    }

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  // Start Resize
  const handlePointerDownResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveAction('resize');
    setIsDragging(true);

    if (selectedElement) {
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        elemX: selectedElement.x,
        elemY: selectedElement.y,
        initialWidth: selectedElement.width,
        initialHeight: selectedElement.height,
        initialRotation: selectedElement.rotation,
        centerX: 0,
        centerY: 0,
      };
    } else if (selectedText) {
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        elemX: selectedText.x,
        elemY: selectedText.y,
        initialWidth: selectedText.fontSize,
        initialHeight: 0,
        initialRotation: selectedText.rotation,
        centerX: 0,
        centerY: 0,
      };
    }

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  // Start Rotate
  const handlePointerDownRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveAction('rotate');
    setIsDragging(true);

    const box = (activeContainer.current as HTMLElement)?.getBoundingClientRect();
    if (!box) return;

    let targetX = 0;
    let targetY = 0;
    let currRot = 0;

    if (selectedElement) {
      targetX = box.left + (selectedElement.x / 100) * box.width;
      targetY = box.top + (selectedElement.y / 100) * box.height;
      currRot = selectedElement.rotation;
    } else if (selectedText) {
      targetX = box.left + (selectedText.x / 100) * box.width;
      targetY = box.top + (selectedText.y / 100) * box.height;
      currRot = selectedText.rotation;
    }

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elemX: 0,
      elemY: 0,
      initialWidth: 0,
      initialHeight: 0,
      initialRotation: currRot,
      centerX: targetX,
      centerY: targetY,
    };

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  // Global Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !activeAction || !selectedId) return;

    const box = (activeContainer.current as HTMLElement)?.getBoundingClientRect();
    if (!box) return;

    const deltaX = (e.clientX - dragStartRef.current.startX) / zoom;
    const deltaY = (e.clientY - dragStartRef.current.startY) / zoom;

    if (activeAction === 'move') {
      const deltaXPercent = (deltaX / box.width) * 100;
      const deltaYPercent = (deltaY / box.height) * 100;

      const newX = Math.max(5, Math.min(95, dragStartRef.current.elemX + deltaXPercent));
      const newY = Math.max(5, Math.min(95, dragStartRef.current.elemY + deltaYPercent));

      if (selectedElement) {
        onUpdateElements(
          elements.map((el) => (el.id === selectedId ? { ...el, x: newX, y: newY } : el)),
          false
        );
      } else if (selectedText) {
        onUpdateTexts(
          texts.map((tx) => (tx.id === selectedId ? { ...tx, x: newX, y: newY } : tx)),
          false
        );
      }
    } else if (activeAction === 'resize') {
      if (selectedElement) {
        const factor = 1 + (deltaX + deltaY) / 140;
        const newW = Math.max(35, Math.min(300, Math.round(dragStartRef.current.initialWidth * factor)));
        const newH = Math.max(35, Math.min(300, Math.round(dragStartRef.current.initialHeight * factor)));

        onUpdateElements(
          elements.map((el) => (el.id === selectedId ? { ...el, width: newW, height: newH } : el)),
          false
        );
      } else if (selectedText) {
        const newSize = Math.max(12, Math.min(54, Math.round(dragStartRef.current.initialWidth + deltaX * 0.4)));
        onUpdateTexts(
          texts.map((tx) => (tx.id === selectedId ? { ...tx, fontSize: newSize } : tx)),
          false
        );
      }
    } else if (activeAction === 'rotate') {
      const { centerX, centerY } = dragStartRef.current;
      const angleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let angleDeg = Math.round((angleRad * 180) / Math.PI);
      if (angleDeg < 0) angleDeg += 360;

      if (selectedElement) {
        onUpdateElements(
          elements.map((el) => (el.id === selectedId ? { ...el, rotation: angleDeg } : el)),
          false
        );
      } else if (selectedText) {
        onUpdateTexts(
          texts.map((tx) => (tx.id === selectedId ? { ...tx, rotation: angleDeg } : tx)),
          false
        );
      }
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setActiveAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 w-full select-none">
      {/* Canvas Top Quick Tools Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#EFE8E1] border border-[#DDD0C3] p-2 sm:p-2.5 rounded-2xl shadow-2xs">
        {/* Undo / Redo & Zoom */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-[#D5C2B4] text-[#42332A] disabled:opacity-40 hover:bg-[#FAF6F0] transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer shadow-2xs"
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deshacer</span>
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-[#D5C2B4] text-[#42332A] disabled:opacity-40 hover:bg-[#FAF6F0] transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer shadow-2xs"
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rehacer</span>
          </button>

          <span className="w-px h-5 bg-[#C9B8AA] mx-0.5" />

          {/* Zoom controls */}
          <div className="flex items-center bg-white border border-[#D5C2B4] rounded-xl overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(1))))}
              className="p-1.5 text-stone-600 hover:bg-[#FAF6F0] cursor-pointer"
              title="Alejar zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-semibold text-stone-700 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
              className="p-1.5 text-stone-600 hover:bg-[#FAF6F0] cursor-pointer"
              title="Acercar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          {zoom !== 1 && (
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="text-[10px] text-[#763D8B] font-bold hover:underline cursor-pointer"
            >
              100%
            </button>
          )}
        </div>

        {/* Selected Item Controls (Z-Order, Duplicate, Delete) */}
        {selectedId ? (
          <div className="flex items-center gap-1 bg-[#FAF6F0] px-2 py-1 rounded-xl border border-[#D5C2B4] animate-fade-in shadow-2xs">
            <span className="text-[11px] font-bold text-[#763D8B] mr-1 hidden md:inline">
              Objeto Seleccionado:
            </span>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                onBringToFront();
              }}
              className="p-1.5 hover:bg-white text-stone-700 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              title="Traer al frente"
            >
              <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-medium hidden sm:inline">Adelante</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                onSendToBack();
              }}
              className="p-1.5 hover:bg-white text-stone-700 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              title="Enviar al fondo"
            >
              <ArrowDownCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] font-medium hidden sm:inline">Atrás</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                onDuplicateSelected();
              }}
              className="p-1.5 hover:bg-white text-stone-700 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              title="Duplicar elemento"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-medium hidden sm:inline">Duplicar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                onDeleteSelected();
              }}
              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              title="Eliminar elemento"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium hidden sm:inline">Eliminar</span>
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-[#7A6B63] italic">
            Toca un elemento en el lienzo para moverlo o rotarlo
          </span>
        )}
      </div>

      {/* Main Visual Canvas Frame (Warm Stone Atelier Canvas Texture - Not black, not white) */}
      <div 
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#D7C7B9] bg-gradient-to-b from-[#EFE6DD] via-[#E4D7CC] to-[#D5C2B3] shadow-inner flex items-center justify-center p-2 sm:p-3 aspect-square max-h-[360px] sm:max-h-[440px]"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Pedestal Surface Shadow Effect */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-12 sm:h-16 rounded-[50%] bg-gradient-to-b from-[#CDBEB0] to-[#B3A192] shadow-[0_12px_30px_rgba(40,25,20,0.3)] pointer-events-none opacity-80" />

        {/* Scalable Canvas Container */}
        <div
          id="main-canvas-surface"
          ref={activeContainer as React.RefObject<HTMLDivElement>}
          onClick={handleCanvasClick}
          className="relative w-full h-full max-w-[340px] sm:max-w-[400px] aspect-square rounded-2xl overflow-hidden bg-white/40 backdrop-blur-[1px] border border-white/60 shadow-xl transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Subtle Canvas Grid Guides (Very soft) */}
          <div className="absolute inset-0 bg-[radial-gradient(#CBB9AA_1px,transparent_1px)] [background-size:24px_24px] opacity-35 pointer-events-none" />

          {/* Reference Background Watermark (Soft ghost silhouette if provided) */}
          {referenceImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center p-6 opacity-20 pointer-events-none select-none">
              <img
                src={referenceImageUrl}
                alt="Silueta guía"
                className="w-full h-full object-contain filter grayscale"
              />
            </div>
          )}

          {/* Empty State Banner if canvas is empty */}
          {elements.length === 0 && texts.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
              <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-md border border-[#D5C2B4] flex items-center justify-center text-[#763D8B] mb-3">
                <Sparkles className="w-7 h-7 text-[#C19B65] animate-pulse" />
              </div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-[#3B2D26]">
                Tu Lienzo de Diseño está Listo
              </h4>
              <p className="text-xs text-[#7A6B63] max-w-xs mt-1 leading-relaxed">
                Toca cualquier elemento del panel (flores, globos, peluches o textos) para agregarlo y armar tu arreglo a tu gusto.
              </p>
            </div>
          )}

          {/* RENDER ELEMENTS */}
          {elements.map((el) => {
            const isSelected = el.id === selectedId;

            // Generate CSS tint filter if custom color is selected
            let colorFilterStyle: React.CSSProperties = {};
            if (el.color && el.color !== '#FFFFFF') {
              // Apply drop-shadow with the color or soft tint
              colorFilterStyle = {
                filter: `drop-shadow(0 4px 10px rgba(0,0,0,0.35)) drop-shadow(0 0 6px ${el.color}66)`,
              };
            } else {
              colorFilterStyle = {
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
              };
            }

            return (
              <div
                key={el.id}
                onPointerDown={(e) => handlePointerDownMove(e, el.id)}
                className={`absolute cursor-grab active:cursor-grabbing transition-shadow ${
                  isSelected ? 'z-40' : ''
                }`}
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
                  zIndex: isSelected ? 999 : el.zIndex,
                }}
              >
                {/* Cartoon Illustration or Custom Image with Transparent Background */}
                <div 
                  className="w-full h-full relative group flex items-center justify-center"
                  style={colorFilterStyle}
                >
                  {el.image.startsWith('data:image/svg+xml') || !el.image.startsWith('http') ? (
                    <CartoonIllustration
                      type={el.name}
                      color={el.color || '#DC2626'}
                      className="w-full h-full pointer-events-none select-none"
                    />
                  ) : (
                    <img
                      src={el.image}
                      alt={el.name}
                      className="w-full h-full object-contain pointer-events-none select-none transition-transform"
                      draggable={false}
                    />
                  )}

                  {/* Color Glow Dot if tinted */}
                  {el.color && (
                    <span 
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs pointer-events-none"
                      style={{ backgroundColor: el.color }}
                    />
                  )}
                </div>

                {/* ACTIVE SELECTION BOUNDARY & CONTROLS */}
                {isSelected && (
                  <div className="absolute -inset-2 border-2 border-dashed border-[#763D8B] rounded-xl pointer-events-none shadow-[0_0_12px_rgba(118,61,139,0.35)]">
                    {/* Top Rotate Handle */}
                    <div
                      onPointerDown={handlePointerDownRotate}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#763D8B] text-white flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing pointer-events-auto hover:scale-110 transition-transform"
                      title="Girar elemento"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </div>

                    {/* Bottom-Right Resize Handle */}
                    <div
                      onPointerDown={handlePointerDownResize}
                      className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#763D8B] text-white flex items-center justify-center shadow-md cursor-nwse-resize pointer-events-auto hover:scale-110 transition-transform"
                      title="Cambiar tamaño"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>

                    {/* Top-Right Quick Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEffects.playClick();
                        onDeleteSelected();
                      }}
                      className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md cursor-pointer pointer-events-auto hover:scale-110 transition-transform"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* RENDER TEXTS */}
          {texts.map((tx) => {
            const isSelected = tx.id === selectedId;

            return (
              <div
                key={tx.id}
                onPointerDown={(e) => handlePointerDownMove(e, tx.id)}
                className={`absolute cursor-grab active:cursor-grabbing whitespace-nowrap ${
                  isSelected ? 'z-40' : ''
                }`}
                style={{
                  left: `${tx.x}%`,
                  top: `${tx.y}%`,
                  transform: `translate(-50%, -50%) rotate(${tx.rotation}deg)`,
                  zIndex: isSelected ? 999 : tx.zIndex,
                }}
              >
                <p
                  className="font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] px-2 py-0.5 leading-tight select-none"
                  style={{
                    fontSize: `${tx.fontSize}px`,
                    color: tx.color,
                    fontFamily: tx.fontFamily || 'Playfair Display, serif',
                    textShadow: tx.color === '#FFFFFF' 
                      ? '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)' 
                      : '0 2px 4px rgba(0,0,0,0.7)',
                  }}
                >
                  {tx.text}
                </p>

                {/* ACTIVE SELECTION BOUNDARY FOR TEXT */}
                {isSelected && (
                  <div className="absolute -inset-2 border-2 border-dashed border-[#763D8B] rounded-xl pointer-events-none shadow-[0_0_12px_rgba(118,61,139,0.35)]">
                    {/* Top Rotate Handle */}
                    <div
                      onPointerDown={handlePointerDownRotate}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#763D8B] text-white flex items-center justify-center shadow-md cursor-grab pointer-events-auto hover:scale-110 transition-transform"
                      title="Girar texto"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </div>

                    {/* Bottom-Right Resize Handle */}
                    <div
                      onPointerDown={handlePointerDownResize}
                      className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#763D8B] text-white flex items-center justify-center shadow-md cursor-nwse-resize pointer-events-auto hover:scale-110 transition-transform"
                      title="Cambiar tamaño de fuente"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>

                    {/* Top-Right Quick Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEffects.playClick();
                        onDeleteSelected();
                      }}
                      className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md cursor-pointer pointer-events-auto hover:scale-110 transition-transform"
                      title="Eliminar texto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
