/**
 * Encodes cartoon SVG illustrations into clean Data URLs so that elements
 * have 100% transparent backgrounds, crisp cartoon lines, and no external photo dependencies.
 */

export function getCartoonSvgDataUrl(type: string, color = '#DC2626'): string {
  const key = type.toLowerCase();

  let svgContent = '';

  if (key.includes('rosa') || key.includes('flor-1') || key.includes('flor-2') || key.includes('flor-4')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 62 C15 48 26 38 40 46 C34 60 26 64 22 62 Z" fill="#48BB78" />
        <path d="M78 62 C85 48 74 38 60 46 C66 60 74 64 78 62 Z" fill="#48BB78" />
        <path d="M50 68 Q48 85 46 95" stroke="#2F855A" stroke-width="4" />
        <circle cx="50" cy="42" r="32" fill="${color}" />
        <path d="M26 36 C22 22 42 16 50 25 C58 16 78 22 74 36 C78 52 58 66 50 68 C42 66 22 52 26 36 Z" fill="${color}" />
        <path d="M32 32 C36 22 64 22 68 32 C72 44 62 56 50 60 C38 56 28 44 32 32 Z" fill="black" opacity="0.12" />
        <path d="M36 34 C40 25 60 25 64 34 C66 42 58 52 50 54 C42 52 34 42 36 34 Z" fill="${color}" />
        <path d="M44 34 C44 30 56 30 56 34 C56 40 46 42 46 46 C46 50 54 50 54 46" fill="none" stroke="#1F161A" stroke-width="2.5" />
        <path d="M34 26 C38 20 46 18 48 18" fill="none" stroke="white" stroke-width="2.5" opacity="0.85" />
        <circle cx="34" cy="38" r="2.5" fill="white" stroke="none" />
      </g>
    </svg>`;
  } else if (key.includes('girasol') || key.includes('flor-3')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#261A0C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 70 C14 58 26 50 38 56 C34 68 26 72 22 70 Z" fill="#48BB78" />
        <path d="M78 70 C86 58 74 50 62 56 C66 68 74 72 78 70 Z" fill="#48BB78" />
        <path d="M50 65 L50 94" stroke="#2F855A" stroke-width="4" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" transform="rotate(30 50 50)" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" transform="rotate(90 50 50)" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" transform="rotate(120 50 50)" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" transform="rotate(150 50 50)" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" transform="rotate(180 50 50)" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" transform="rotate(210 50 50)" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" transform="rotate(240 50 50)" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" transform="rotate(270 50 50)" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" transform="rotate(300 50 50)" />
        <ellipse cx="50" cy="22" rx="9" ry="18" fill="#FBBF24" transform="rotate(330 50 50)" />
        <circle cx="50" cy="50" r="19" fill="#78350F" />
        <circle cx="50" cy="50" r="14" fill="#92400E" />
        <circle cx="45" cy="46" r="2" fill="#FDE68A" stroke="none" />
        <circle cx="55" cy="46" r="2" fill="#FDE68A" stroke="none" />
        <path d="M46 54 Q50 58 54 54" fill="none" stroke="#FDE68A" stroke-width="1.5" />
      </g>
    </svg>`;
  } else if (key.includes('hortensia') || key.includes('flor-5')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1A202C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 72 L50 95" stroke="#2F855A" stroke-width="4" />
        <circle cx="50" cy="45" r="32" fill="${color}" opacity="0.9" />
        <circle cx="38" cy="32" r="9" fill="${color}" />
        <circle cx="62" cy="32" r="9" fill="${color}" />
        <circle cx="50" cy="26" r="9" fill="${color}" />
        <circle cx="32" cy="46" r="9" fill="${color}" />
        <circle cx="50" cy="44" r="9" fill="${color}" />
        <circle cx="68" cy="46" r="9" fill="${color}" />
        <circle cx="40" cy="58" r="9" fill="${color}" />
        <circle cx="60" cy="58" r="9" fill="${color}" />
        <circle cx="50" cy="44" r="2.5" fill="#FEF08A" stroke="#1A202C" stroke-width="1" />
        <circle cx="38" cy="32" r="2.5" fill="#FEF08A" stroke="#1A202C" stroke-width="1" />
        <circle cx="62" cy="32" r="2.5" fill="#FEF08A" stroke="#1A202C" stroke-width="1" />
      </g>
    </svg>`;
  } else if (key.includes('eucalipto') || key.includes('flor-6')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#133022" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 94 Q48 55 52 10" fill="none" stroke="#2F855A" stroke-width="3" />
        <ellipse cx="50" cy="22" rx="13" ry="10" fill="#34D399" transform="rotate(-30 50 22)" />
        <ellipse cx="50" cy="36" rx="15" ry="12" fill="#34D399" transform="rotate(25 50 36)" />
        <ellipse cx="50" cy="52" rx="17" ry="13" fill="#34D399" transform="rotate(-28 50 52)" />
        <ellipse cx="50" cy="68" rx="18" ry="14" fill="#34D399" transform="rotate(32 50 68)" />
      </g>
    </svg>`;
  } else if (key.includes('coraz') || key.includes('globo-1')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 78 Q46 88 52 96" fill="none" stroke="#64748B" stroke-width="2" />
        <polygon points="50,73 45,79 55,79" fill="${color}" />
        <path d="M50 75 C45 70 20 54 18 36 C16 18 35 15 50 30 C65 15 84 18 82 36 C80 54 55 70 50 75 Z" fill="${color}" />
        <path d="M26 28 C28 22 36 19 42 20" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="46" cy="24" r="2.5" fill="white" stroke="none" />
      </g>
    </svg>`;
  } else if (key.includes('estrella') || key.includes('globo-3')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 78 Q54 86 48 96" fill="none" stroke="#64748B" stroke-width="2" />
        <polygon points="50,74 45,80 55,80" fill="${color}" />
        <path d="M50 14 L60 36 L84 38 L66 54 L72 78 L50 64 L28 78 L34 54 L16 38 L40 36 Z" fill="${color}" />
        <path d="M50 14 L60 36 L50 64 L40 36 Z" fill="white" opacity="0.25" stroke="none" />
        <circle cx="36" cy="38" r="3" fill="white" stroke="none" />
      </g>
    </svg>`;
  } else if (key.includes('burbuja') || key.includes('confeti') || key.includes('globo-2')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 78 Q47 88 52 96" fill="none" stroke="#94A3B8" stroke-width="2" />
        <circle cx="50" cy="76" r="3.5" fill="${color}" />
        <circle cx="50" cy="45" r="31" fill="#E0F2FE" fill-opacity="0.45" />
        <circle cx="38" cy="38" r="3.5" fill="#EF4444" stroke="none" />
        <circle cx="62" cy="36" r="3" fill="#F59E0B" stroke="none" />
        <circle cx="48" cy="48" r="4" fill="#8B5CF6" stroke="none" />
        <circle cx="36" cy="52" r="3" fill="#10B981" stroke="none" />
        <circle cx="58" cy="54" r="3.5" fill="#EC4899" stroke="none" />
        <path d="M32 30 C36 22 46 18 54 18" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" />
      </g>
    </svg>`;
  } else if (key.includes('globo') || key.includes('bouq')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 76 Q46 86 52 96" fill="none" stroke="#64748B" stroke-width="2" />
        <polygon points="50,71 45,77 55,77" fill="${color}" />
        <ellipse cx="50" cy="42" rx="30" ry="34" fill="${color}" />
        <path d="M32 26 C36 20 44 16 52 16" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="58" cy="20" r="2.5" fill="white" stroke="none" />
      </g>
    </svg>`;
  } else if (key.includes('ferrero') || key.includes('choc-1')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#261A0C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M26 62 L32 85 L68 85 L74 62 Z" fill="#451A03" />
        <circle cx="50" cy="46" r="26" fill="#F59E0B" />
        <ellipse cx="50" cy="45" rx="14" ry="9" fill="#FEF3C7" />
        <text x="50" y="48" font-size="7" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#78350F" stroke="none">ROCHER</text>
        <circle cx="36" cy="34" r="3" fill="white" stroke="none" />
      </g>
    </svg>`;
  } else if (key.includes('lindt') || key.includes('bomb') || key.includes('choc-2')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="22,50 8,36 12,50 8,64" fill="#DC2626" />
        <polygon points="78,50 92,36 88,50 92,64" fill="#DC2626" />
        <circle cx="50" cy="50" r="26" fill="#DC2626" />
        <path d="M28 50 Q50 38 72 50 Q50 62 28 50 Z" fill="#FCD34D" />
        <path d="M38 34 Q46 28 54 30" fill="none" stroke="white" stroke-width="3" />
      </g>
    </svg>`;
  } else if (key.includes('chocolate') || key.includes('tabla') || key.includes('choc-3')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#261A0C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="22" y="18" width="56" height="68" rx="6" fill="#451A03" />
        <rect x="28" y="24" width="20" height="18" rx="2" fill="#78350F" />
        <rect x="52" y="24" width="20" height="18" rx="2" fill="#78350F" />
        <rect x="20" y="48" width="60" height="40" rx="4" fill="#DC2626" />
        <text x="50" y="74" font-size="8" font-weight="bold" text-anchor="middle" fill="white" stroke="none">CHOCO</text>
      </g>
    </svg>`;
  } else if (key.includes('peluche') || key.includes('osito') || key.includes('pel-1') || key.includes('pel-2')) {
    const isLove = key.includes('amor') || key.includes('pel-2') || key.includes('love');
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#2B1D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="28" cy="24" r="11" fill="#B45309" />
        <circle cx="28" cy="24" r="6" fill="#FDE68A" />
        <circle cx="72" cy="24" r="11" fill="#B45309" />
        <circle cx="72" cy="24" r="6" fill="#FDE68A" />
        <ellipse cx="50" cy="68" rx="26" ry="24" fill="#B45309" />
        <ellipse cx="26" cy="85" rx="10" ry="8" fill="#B45309" />
        <ellipse cx="74" cy="85" rx="10" ry="8" fill="#B45309" />
        ${isLove ? '<path d="M50 78 C44 72 26 56 28 46 C30 36 44 36 50 44 C56 36 70 36 72 46 C74 56 56 72 50 78 Z" fill="#EF4444" />' : ''}
        <circle cx="50" cy="40" r="24" fill="#B45309" />
        <ellipse cx="50" cy="46" rx="11" ry="8" fill="#FDE68A" />
        <polygon points="50,42 45,45 55,45" fill="#2B1D12" />
        <path d="M46 49 Q50 52 54 49" fill="none" />
        <circle cx="39" cy="36" r="3.5" fill="#1C1917" />
        <circle cx="38" cy="35" r="1.2" fill="white" stroke="none" />
        <circle cx="61" cy="36" r="3.5" fill="#1C1917" />
        <circle cx="60" cy="35" r="1.2" fill="white" stroke="none" />
        <ellipse cx="32" cy="44" rx="4" ry="2.5" fill="#F472B6" opacity="0.75" stroke="none" />
        <ellipse cx="68" cy="44" rx="4" ry="2.5" fill="#F472B6" opacity="0.75" stroke="none" />
      </g>
    </svg>`;
  } else if (key.includes('conejo') || key.includes('pel-3')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F2937" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="36" cy="20" rx="8" ry="20" fill="#FFFFFF" transform="rotate(-12 36 20)" />
        <ellipse cx="36" cy="20" rx="4" ry="14" fill="#FBCFE8" transform="rotate(-12 36 20)" />
        <ellipse cx="64" cy="20" rx="8" ry="20" fill="#FFFFFF" transform="rotate(12 64 20)" />
        <ellipse cx="64" cy="20" rx="4" ry="14" fill="#FBCFE8" transform="rotate(12 64 20)" />
        <ellipse cx="50" cy="70" rx="24" ry="22" fill="#FFFFFF" />
        <circle cx="32" cy="86" r="7" fill="#FFFFFF" />
        <circle cx="68" cy="86" r="7" fill="#FFFFFF" />
        <circle cx="50" cy="48" r="22" fill="#FFFFFF" />
        <circle cx="42" cy="46" r="3" fill="#1F2937" />
        <circle cx="58" cy="46" r="3" fill="#1F2937" />
        <ellipse cx="50" cy="52" rx="2.5" ry="1.8" fill="#F472B6" />
        <path d="M47 55 Q50 57 53 55" fill="none" />
      </g>
    </svg>`;
  } else if (key.includes('led') || key.includes('dec-1')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 70 Q30 30 50 60 T88 40" fill="none" stroke="#64748B" stroke-width="2.5" />
        <ellipse cx="24" cy="46" rx="5" ry="7" fill="#FDE047" stroke="#1F2937" stroke-width="2" />
        <ellipse cx="40" cy="48" rx="5" ry="7" fill="#FDE047" stroke="#1F2937" stroke-width="2" />
        <ellipse cx="58" cy="58" rx="5" ry="7" fill="#FDE047" stroke="#1F2937" stroke-width="2" />
        <ellipse cx="76" cy="44" rx="5" ry="7" fill="#FDE047" stroke="#1F2937" stroke-width="2" />
      </g>
    </svg>`;
  } else if (key.includes('corona') || key.includes('dec-2')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 68 L22 36 L38 52 L50 26 L62 52 L78 36 L82 68 Z" fill="#FBBF24" />
        <rect x="18" y="66" width="64" height="12" rx="3" fill="#D97706" />
        <circle cx="22" cy="34" r="4.5" fill="#EF4444" />
        <circle cx="50" cy="24" r="5.5" fill="#3B82F6" />
        <circle cx="78" cy="34" r="4.5" fill="#EF4444" />
        <circle cx="50" cy="72" r="3" fill="#EC4899" />
      </g>
    </svg>`;
  } else if (key.includes('mariposa') || key.includes('dec-3')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 50 C40 20 12 25 18 48 C22 62 46 54 50 50 Z" fill="#F472B6" />
        <path d="M50 54 C38 58 24 76 34 84 C44 88 48 64 50 54 Z" fill="#F472B6" />
        <path d="M50 50 C60 20 88 25 82 48 C78 62 54 54 50 50 Z" fill="#F472B6" />
        <path d="M50 54 C62 58 76 76 66 84 C56 88 52 64 50 54 Z" fill="#F472B6" />
        <ellipse cx="50" cy="56" rx="4" ry="16" fill="#1F2937" />
      </g>
    </svg>`;
  } else if (key.includes('cinta') || key.includes('lazo') || key.includes('cin-')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M44 54 L32 88 L46 80 L52 86 L48 54 Z" fill="${color}" />
        <path d="M56 54 L68 88 L54 80 L48 86 L52 54 Z" fill="${color}" />
        <path d="M50 50 C44 32 14 30 18 52 C22 66 44 54 50 50 Z" fill="${color}" />
        <path d="M50 50 C56 32 86 30 82 52 C78 66 56 54 50 50 Z" fill="${color}" />
        <circle cx="50" cy="50" r="8" fill="${color}" />
      </g>
    </svg>`;
  } else if (key.includes('caja') || key.includes('sombrerera') || key.includes('caj-')) {
    const isHeartBox = key.includes('coraz');
    if (isHeartBox) {
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M50 82 C44 76 18 58 18 42 L18 52 C18 68 44 86 50 92 C56 86 82 68 82 52 L82 42 C82 58 56 76 50 82 Z" fill="black" opacity="0.25" />
          <path d="M50 78 C44 72 18 54 18 38 C18 22 36 20 50 34 C64 20 82 22 82 38 C82 54 56 72 50 78 Z" fill="${color}" />
          <path d="M50 34 L50 78" stroke="#FBBF24" stroke-width="5" />
          <circle cx="50" cy="38" r="3.5" fill="#F59E0B" />
        </g>
      </svg>`;
    } else {
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="50" cy="80" rx="36" ry="12" fill="${color}" />
          <path d="M14 42 L14 80 C14 88 86 88 86 80 L86 42 Z" fill="${color}" />
          <ellipse cx="50" cy="42" rx="37" ry="12" fill="${color}" />
          <path d="M13 36 L13 44 C13 52 87 52 87 44 L87 36 Z" fill="${color}" />
          <ellipse cx="50" cy="36" rx="37" ry="12" fill="${color}" />
          <path d="M14 60 C14 68 86 68 86 60" fill="none" stroke="#FBBF24" stroke-width="5" />
        </g>
      </svg>`;
    }
  } else if (key.includes('topper') || key.includes('accesor') || key.includes('acc-')) {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F161A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="50" y1="52" x2="50" y2="95" stroke="#D4AF37" stroke-width="3" />
        <path d="M20 38 Q50 16 80 38 Q50 60 20 38 Z" fill="#FBBF24" stroke="#1F161A" stroke-width="2.5" />
        <text x="50" y="42" font-size="10" font-family="'Dancing Script', cursive, serif" font-weight="bold" text-anchor="middle" fill="#78350F" stroke="none">
          ${key.includes('te amo') ? 'Te Amo' : 'Felicidades'}
        </text>
      </g>
    </svg>`;
  } else {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g stroke="#1F161A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="22" y="32" width="56" height="52" rx="8" fill="${color}" />
        <rect x="18" y="24" width="64" height="14" rx="4" fill="${color}" />
        <line x1="50" y1="24" x2="50" y2="84" stroke="#FBBF24" stroke-width="6" />
      </g>
    </svg>`;
  }

  // Convert SVG string to Data URL
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.replace(/\s+/g, ' ').trim())}`;
}
