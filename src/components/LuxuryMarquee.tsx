import React from 'react';

export const LuxuryMarquee: React.FC = () => {
  const items = [
    'BALLONSDEI BOUTIQUE',
    'HAUTE FLORISTERIE',
    'BALLONSDEI · GLOBOS DE AUTOR',
    'ENTREGA VIP EN COLÓN',
    'BALLONSDEI · OBSEQUIOS PERSONALIZADOS',
    'ALQUILER DE MOBILIARIO EXCLUSIVO',
    'PAGOS SEGUROS CON YAPPY & ACH',
    'DISEÑOS ÚNICOS PARA CELEBRAR',
    'GARANTÍA FOTOGRÁFICA PREVIA BALLONSDEI',
  ];

  return (
    <div className="relative overflow-hidden bg-[#241228] text-[#F3E2C4] py-3.5 border-y border-[#C5A059]/30 select-none">
      {/* Subtle edge vignette shadows */}
      <div className="absolute left-0 inset-y-0 w-16 bg-gradient-to-r from-[#241228] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-16 bg-gradient-to-l from-[#241228] to-transparent z-10 pointer-events-none" />

      <div className="animate-luxury-marquee flex items-center whitespace-nowrap text-[11px] sm:text-xs font-medium tracking-[0.25em] uppercase">
        {/* Sequence 1 */}
        {items.map((item, idx) => (
          <div key={`m1-${idx}`} className="flex items-center gap-6 px-6">
            <span className="text-[#C5A059]">✦</span>
            <span className="hover:text-white transition-colors">{item}</span>
          </div>
        ))}
        {/* Sequence 2 for continuous loop */}
        {items.map((item, idx) => (
          <div key={`m2-${idx}`} className="flex items-center gap-6 px-6">
            <span className="text-[#C5A059]">✦</span>
            <span className="hover:text-white transition-colors">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
