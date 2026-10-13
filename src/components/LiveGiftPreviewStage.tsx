import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Crown, 
  Heart, 
  Star, 
  Circle, 
  Hash, 
  Layers, 
  Eye, 
  Camera, 
  ZoomIn, 
  Volume2, 
  VolumeX,
  CheckCircle2,
  Gift,
  Lightbulb,
  Palette,
  RotateCcw,
  Sliders,
  Award
} from 'lucide-react';
import { CustomizerState, VINYL_COLORS, COLOR_PALETTES } from './InteractiveGiftCustomizer';
import { soundEffects } from '../lib/soundEffects';

interface LiveGiftPreviewStageProps {
  referenceImageUrl: string;
  productName: string;
  customization: CustomizerState;
  isCustomizable: boolean;
  isZoomed: boolean;
  onToggleZoom: () => void;
  referenceImages?: { id?: string; image_url: string; position: number }[];
  activeImageIndex?: number;
  onSelectImageIndex?: (idx: number) => void;
}

export const LiveGiftPreviewStage: React.FC<LiveGiftPreviewStageProps> = ({
  referenceImageUrl,
  productName,
  customization,
  isCustomizable,
  isZoomed,
  onToggleZoom,
  referenceImages = [],
  activeImageIndex = 0,
  onSelectImageIndex,
}) => {
  const [viewMode, setViewMode] = useState<'simulation' | 'photo'>('simulation');
  const [soundOn, setSoundOn] = useState(soundEffects.isEnabled());
  const [nightMode, setNightMode] = useState(false);
  const [burstParticle, setBurstParticle] = useState(0);

  // Trigger playful sparkle on customization change
  useEffect(() => {
    setBurstParticle((prev) => prev + 1);
  }, [
    customization.balloonType,
    customization.balloonText,
    customization.vinylColor,
    customization.plushToy,
    customization.extras.length,
  ]);

  const handleToggleSound = () => {
    const next = soundEffects.toggleSound();
    setSoundOn(next);
    if (next) soundEffects.playSparkle();
  };

  // Find vinyl hex color
  const vinylObj = VINYL_COLORS.find((v) => v.name === customization.vinylColor) || VINYL_COLORS[0];
  const vinylColorHex = vinylObj.colorHex;

  // Find palette colors
  const paletteObj = COLOR_PALETTES.find((p) => p.name === customization.colorPalette) || COLOR_PALETTES[0];

  // Extras checks
  const hasLed = customization.extras.some((e) => e.name.toLowerCase().includes('led'));
  const hasChocolates = customization.extras.some((e) => e.name.toLowerCase().includes('chocolate'));
  const hasCrown = customization.extras.some((e) => e.name.toLowerCase().includes('corona'));
  const hasPlush = customization.plushToy && customization.plushToy !== 'Sin peluche';

  // Gamification: Calculate "Customization Mastery Score" (0% - 100%)
  const stepsCompleted = [
    Boolean(customization.balloonType),
    Boolean(customization.balloonText.trim()),
    Boolean(customization.colorPalette),
    Boolean(customization.ribbonType),
    hasPlush,
    customization.extras.length > 0,
  ].filter(Boolean).length;
  const progressPercent = Math.min(100, Math.round((stepsCompleted / 6) * 100));

  // Determine balloon skin styling
  const isHeart = customization.balloonType.toLowerCase().includes('corazón');
  const isStar = customization.balloonType.toLowerCase().includes('estrella');
  const isOrbz = customization.balloonType.toLowerCase().includes('orbz');
  const isBubble = customization.balloonType.toLowerCase().includes('burbuja') || customization.balloonType.toLowerCase().includes('confeti');

  return (
    <div className="flex flex-col gap-3">
      {/* 1. TOP GAME HUD (Control Bar): Status, Sound, Lighting, View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#EFE6DD] border border-[#DFCFC1] p-2.5 rounded-2xl shadow-2xs">
        {/* Left: Gamified Level / Completion Status */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#763D8B] text-white flex items-center justify-center shadow-xs">
            <Award className="w-4 h-4 text-[#F6E3BA]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#3B2D26]">
                Taller Interactivo
              </span>
              <span className="text-[10px] px-2 py-0.2 bg-[#763D8B]/15 text-[#763D8B] font-bold rounded-full">
                {progressPercent}% Armado
              </span>
            </div>
            {/* Gamified mini progress meter */}
            <div className="w-28 sm:w-36 h-1.5 bg-[#DDCFC3] rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-[#C19B65] to-[#763D8B] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(15, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Gamified Controls (Sound, Lighting Atmosphere, View Mode) */}
        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
              soundOn 
                ? 'bg-white border-[#D5C2B4] text-[#763D8B]' 
                : 'bg-stone-200 border-stone-300 text-stone-400'
            }`}
            title={soundOn ? 'Sonidos del juego activos' : 'Sonidos desactivados'}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Romantic / Ambient Night Lighting Toggle */}
          <button
            type="button"
            onClick={() => {
              setNightMode(!nightMode);
              soundEffects.playClick();
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              nightMode
                ? 'bg-[#31252C] border-[#553E4D] text-[#FDE047]'
                : 'bg-white border-[#D5C2B4] text-[#5C4D44]'
            }`}
            title="Cambiar iluminación del estudio"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${nightMode ? 'text-yellow-300 fill-yellow-300 animate-pulse' : 'text-stone-500'}`} />
            <span className="hidden sm:inline">{nightMode ? 'Luces Noche' : 'Luz Taller'}</span>
          </button>

          {/* Toggle between 3D Simulation & Original Raw Photo */}
          <button
            type="button"
            onClick={() => {
              const next = viewMode === 'simulation' ? 'photo' : 'simulation';
              setViewMode(next);
              soundEffects.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              viewMode === 'simulation'
                ? 'bg-[#763D8B] text-white'
                : 'bg-white text-[#3B2D26] border border-[#D5C2B4]'
            }`}
          >
            {viewMode === 'simulation' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#F6E3BA] animate-spin" />
                <span>Simulador 3D</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5 text-stone-600" />
                <span>Foto Limpia</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. EL LIENZO PRINCIPAL (Ni blanco ni negro: Textura de Taller de Lujo, Piedra Cálida, Madera & Mármol) */}
      <div 
        className={`relative w-full rounded-3xl overflow-hidden transition-all duration-700 select-none shadow-2xl border ${
          nightMode 
            ? 'border-[#543949] bg-gradient-to-b from-[#2E212A] via-[#241A21] to-[#171015]' 
            : 'border-[#DFCFC1] bg-gradient-to-b from-[#EFE6DD] via-[#E4D7CC] to-[#D5C2B3]'
        }`}
        style={{
          minHeight: '440px',
        }}
      >
        {/* Subtle Luxury Vignette & Atelier Glow */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            nightMode 
              ? 'bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.18)_0%,rgba(0,0,0,0.6)_85%)]' 
              : 'bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.7)_0%,rgba(202,183,168,0.45)_75%)]'
          }`} 
        />

        {/* 3D Round Pedestal Podium at the base of the gift */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-[75%] sm:w-[65%] h-14 sm:h-18 rounded-[50%] bg-gradient-to-b from-[#CDBEB0] to-[#B3A192] shadow-[0_12px_30px_rgba(40,25,20,0.35),inset_0_2px_4px_rgba(255,255,255,0.7)] border-t border-white/60 pointer-events-none opacity-80" />

        {/* The Base Product Reference Photo */}
        <div className="relative z-10 w-full flex items-center justify-center p-4 sm:p-6 pb-12 sm:pb-14">
          <div className="relative max-w-[340px] sm:max-w-[420px] w-full aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/40">
            <img
              src={referenceImageUrl}
              alt={productName}
              className={`w-full h-full object-cover object-center transition-all duration-500 ${
                viewMode === 'simulation' 
                  ? nightMode ? 'filter brightness-90 contrast-110 saturate-105' : 'filter brightness-98 contrast-102'
                  : ''
              } ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
              onClick={onToggleZoom}
            />

            {/* In-photo contact shadow for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 pointer-events-none" />
          </div>
        </div>

        {/* 3. SIMULACIÓN DE JUEGO (Overlays en Vivo sobre la foto de referencia) */}
        {isCustomizable && viewMode === 'simulation' && (
          <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
            
            {/* --- SECCIÓN SUPERIOR DEL LIENZO: GLOBO 3D FLOTANTE CON VINILO REAL --- */}
            <div className="relative w-full flex flex-col items-center pt-2 sm:pt-4">
              
              {/* Crown Accessory if equipped */}
              {hasCrown && (
                <div className="mb-[-14px] z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:scale-105">
                  <div className="bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 text-amber-950 px-3 py-1 rounded-full shadow-lg border-2 border-amber-200 flex items-center gap-1.5 text-[11px] font-extrabold tracking-wide">
                    <Crown className="w-4 h-4 fill-amber-500 text-amber-900" />
                    <span>Corona Imperial</span>
                  </div>
                </div>
              )}

              {/* Balloon Floating Envelope with keyframe physics */}
              <div 
                className="relative flex flex-col items-center justify-center transition-[transform,filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  animation: 'floatGameBalloon 3.6s ease-in-out infinite',
                }}
              >
                {/* Magical LED Lights Fairy Ring */}
                {(hasLed || nightMode) && (
                  <div className="absolute -inset-4 sm:-inset-6 rounded-full pointer-events-none z-10">
                    <div className="absolute top-1 left-4 w-2.5 h-2.5 rounded-full bg-amber-200 animate-ping shadow-[0_0_16px_#FDE047]" />
                    <div className="absolute top-8 right-2 w-3 h-3 rounded-full bg-yellow-300 animate-pulse shadow-[0_0_18px_#FACC15]" />
                    <div className="absolute bottom-6 left-2 w-2.5 h-2.5 rounded-full bg-amber-100 animate-ping shadow-[0_0_14px_#FEF08A]" />
                    <div className="absolute -bottom-1 right-6 w-3 h-3 rounded-full bg-yellow-200 animate-pulse shadow-[0_0_16px_#FDE047]" />
                    <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_12px_#FFF]" />
                    <div className="absolute top-1/3 right-0 w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping shadow-[0_0_14px_#F59E0B]" />
                  </div>
                )}

                {/* 3D Balloon Body: Ultra-Realistic Gradients & Glass Specular Highlights */}
                <div 
                  className={`relative w-48 sm:w-60 h-40 sm:h-48 flex flex-col items-center justify-center p-4 text-center transition-[border-color,background-color,box-shadow,transform,border-radius] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl backdrop-blur-[2px] border ${
                    isHeart
                      ? 'rounded-[42%_42%_50%_50%] border-rose-200/90 bg-gradient-to-tr from-rose-600/70 via-rose-400/50 to-pink-300/60 shadow-[inset_0_0_25px_rgba(255,255,255,0.7),0_15px_35px_rgba(225,29,72,0.4)]'
                      : isStar
                      ? 'rounded-[32%] border-amber-200/90 bg-gradient-to-tr from-amber-600/65 via-yellow-400/50 to-amber-200/70 shadow-[inset_0_0_25px_rgba(255,255,255,0.8),0_15px_35px_rgba(217,119,6,0.4)]'
                      : isOrbz
                      ? 'rounded-full border-[#C4A7CB]/80 bg-gradient-to-tr from-[#52255E]/80 via-[#763D8B]/50 to-[#EAD8EB]/60 shadow-[inset_0_0_30px_rgba(255,255,255,0.8),0_18px_40px_rgba(118,61,139,0.35)]'
                      : 'rounded-full border-white/85 bg-gradient-to-b from-white/60 via-white/25 to-white/45 shadow-[inset_0_0_30px_rgba(255,255,255,0.85),0_18px_40px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  {/* Gloss Specular Light Reflection (curved sheen) */}
                  <div className="absolute top-2 left-4 w-14 sm:w-16 h-7 sm:h-8 rounded-[50%] bg-gradient-to-b from-white/90 via-white/50 to-transparent rotate-[-28deg] pointer-events-none filter blur-[0.4px]" />
                  <div className="absolute bottom-3 right-5 w-8 h-4 rounded-full bg-white/40 rotate-[15deg] pointer-events-none" />

                  {/* Confetti specs for Bubble Balloon */}
                  {isBubble && (
                    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                      <span className="absolute top-4 right-8 w-2.5 h-2.5 rounded-full bg-rose-400/90 rotate-12 shadow-2xs" />
                      <span className="absolute top-10 left-8 w-3 h-2 rounded-xs bg-amber-400/90 rotate-45 shadow-2xs" />
                      <span className="absolute bottom-8 right-10 w-2.5 h-2.5 rounded-full bg-purple-400/90 shadow-2xs" />
                      <span className="absolute bottom-5 left-12 w-3 h-3 rounded-full bg-pink-400/90 rotate-12 shadow-2xs" />
                      <span className="absolute top-14 right-14 w-2 h-3 rounded-xs bg-yellow-300/95 rotate-90 shadow-2xs" />
                      <span className="absolute top-6 left-14 w-2 h-2 rounded-full bg-cyan-300/90" />
                    </div>
                  )}

                  {/* Balloon Model Badge */}
                  <div className="mb-1 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black/55 text-white backdrop-blur-md flex items-center gap-1 shadow-sm border border-white/20">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-spin" />
                    <span className="truncate max-w-[130px]">{customization.balloonType}</span>
                  </div>

                  {/* --- TEXTO DE VINILO PERSONALIZADO EN TIEMPO REAL --- */}
                  <div className="w-full px-3 flex items-center justify-center min-h-[46px]">
                    {customization.balloonText ? (
                      <p 
                        key={burstParticle}
                        className="font-serif text-sm sm:text-lg font-extrabold leading-tight text-center break-words max-w-[190px] sm:max-w-[210px] tracking-wide animate-fade-in"
                        style={{
                          color: vinylColorHex,
                          textShadow: vinylColorHex === '#FFFFFF' 
                            ? '0 2px 4px rgba(0,0,0,0.85), 0 0 14px rgba(0,0,0,0.6)' 
                            : '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.4)',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                        }}
                      >
                        «{customization.balloonText}»
                      </p>
                    ) : (
                      <span className="text-[11px] font-serif italic text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] border border-dashed border-white/60 px-3 py-1 rounded-lg bg-black/30 backdrop-blur-xs">
                        Tu mensaje aparecerá aquí en vinilo...
                      </span>
                    )}
                  </div>

                  {/* Vinyl Color Chip Indicator */}
                  <div className="mt-1 flex items-center gap-1.5 text-[9px] font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] bg-black/45 px-2.5 py-0.5 rounded-full border border-white/15">
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-white/80 shadow-xs" 
                      style={{ backgroundColor: vinylColorHex }} 
                    />
                    <span>Vinilo: {customization.vinylColor}</span>
                  </div>
                </div>

                {/* Silk Hanging String line connecting balloon to arrangement */}
                <div 
                  className="w-0.5 h-10 sm:h-14 bg-gradient-to-b from-stone-300 via-amber-200 to-transparent mx-auto mt-[-1px] opacity-90 shadow-sm"
                />
              </div>
            </div>

            {/* --- SECCIÓN INFERIOR DEL LIENZO: ELEMENTOS Y ACCESORIOS MONTADOS --- */}
            <div className="w-full flex items-end justify-between gap-2 pt-2">
              {/* Left Side: Palette & Ribbon Tag */}
              <div className="flex flex-col gap-1.5 max-w-[55%]">
                <div className="bg-[#FAF6F0]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D5C2B4] shadow-md flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {paletteObj.colors.map((c, i) => (
                      <span 
                        key={i} 
                        className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs" 
                        style={{ backgroundColor: c }} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[#382B26] truncate">
                    {paletteObj.name}
                  </span>
                </div>

                <div className="bg-[#FAF6F0]/95 backdrop-blur-md px-3 py-1 rounded-xl border border-[#D5C2B4] shadow-md flex items-center gap-1.5 text-[10px] text-[#4A3B34]">
                  <span className="text-[#763D8B] font-bold">🎀 Lazo:</span>
                  <span className="font-semibold truncate">{customization.ribbonType}</span>
                </div>
              </div>

              {/* Right Side: Plushie Badge, Chocolates, and LED Status */}
              <div className="flex flex-col items-end gap-1.5">
                {hasPlush && (
                  <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-pink-100 border-2 border-amber-300 text-amber-950 px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-2 transition-transform duration-300 hover:scale-102">
                    <Heart className="w-4 h-4 text-amber-700 fill-amber-300" />
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold block leading-tight truncate max-w-[130px]">
                        {customization.plushToy}
                      </span>
                      <span className="text-[9px] text-amber-800 font-bold">
                        +${customization.plushPrice?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {hasChocolates && (
                  <div className="bg-[#452718] text-[#FDE68A] border border-[#B45309] px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 text-[10px] font-bold backdrop-blur-xs">
                    <span>🍫</span>
                    <span>Ferrero Rocher (x8)</span>
                  </div>
                )}

                {hasLed && (
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 border border-yellow-200 px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 text-[9px] font-extrabold animate-pulse">
                    <Sparkles className="w-3 h-3 text-amber-900 fill-amber-900" />
                    <span>Luces LED Encendidas</span>
                  </div>
                )}
              </div>
            </div>

            {/* Top Studio Watermark Badge */}
            <div className="absolute top-4 left-4 bg-[#763D8B]/90 text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-md border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Lienzo 3D en Vivo</span>
            </div>
          </div>
        )}

        {/* Floating Zoom Hint */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 text-white text-[10px] rounded-lg backdrop-blur-xs flex items-center gap-1 pointer-events-none z-30">
          <ZoomIn className="w-3 h-3" />
          <span>{isZoomed ? 'Click para alejar' : 'Click para zoom'}</span>
        </div>
      </div>

      {/* 4. CAMERAS / ANGLE SELECTOR (Cámaras del juego para ver las 4 fotos de referencia) */}
      {referenceImages.length > 0 && onSelectImageIndex && (
        <div className="bg-[#F5EFEB] border border-[#E3D7CE] p-2.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <span className="text-xs font-bold text-[#4A3B34] flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#763D8B]" />
            <span>Cámaras de Estudio (Cambia el ángulo de la foto de referencia):</span>
          </span>

          <div className="flex items-center gap-2">
            {referenceImages.map((img, idx) => {
              const isActive = activeImageIndex === idx;
              return (
                <button
                  type="button"
                  key={img.id || idx}
                  onClick={() => {
                    onSelectImageIndex(idx);
                    soundEffects.playClick();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    isActive 
                      ? 'bg-[#763D8B] text-white shadow-xs' 
                      : 'bg-white text-[#54433C] hover:bg-[#EBE2DA] border border-[#D5C2B4]'
                  }`}
                >
                  <span>Ángulo {idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Balloon CSS Animation */}
      <style>{`
        @keyframes floatGameBalloon {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-9px) rotate(1.2deg);
          }
        }
      `}</style>
    </div>
  );
};
