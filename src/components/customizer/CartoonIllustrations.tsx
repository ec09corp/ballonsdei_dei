import React from 'react';

interface CartoonIconProps {
  type: string;
  color?: string;
  className?: string;
  size?: number | string;
}

/**
 * High-quality Cartoon / Sticker SVG illustrations with bold friendly contours,
 * cel-shading, playful highlights, and dynamic color adaptation.
 */
export const CartoonIllustration: React.FC<CartoonIconProps> = ({
  type,
  color = '#DC2626',
  className = '',
  size = '100%',
}) => {
  // Normalize key
  const key = type.toLowerCase();

  // Helper shade generator for cartoon depth
  const primaryColor = color || '#DC2626';

  // --- 1. CARTOON FLORES ---
  if (key.includes('rosa') || key.includes('flor-1') || key.includes('flor-2') || key.includes('flor-4')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.18))' }}
      >
        <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Leaves */}
          <path d="M22 62 C15 48 26 38 40 46 C34 60 26 64 22 62 Z" fill="#48BB78" />
          <path d="M26 53 C32 50 35 48 38 47" stroke="#276749" strokeWidth="1.5" />
          <path d="M78 62 C85 48 74 38 60 46 C66 60 74 64 78 62 Z" fill="#48BB78" />
          <path d="M74 53 C68 50 65 48 62 47" stroke="#276749" strokeWidth="1.5" />
          {/* Stem */}
          <path d="M50 68 Q48 85 46 95" stroke="#2F855A" strokeWidth="4" />
          {/* Outer Petals */}
          <circle cx="50" cy="42" r="32" fill={primaryColor} />
          <path
            d="M26 36 C22 22 42 16 50 25 C58 16 78 22 74 36 C78 52 58 66 50 68 C42 66 22 52 26 36 Z"
            fill={primaryColor}
          />
          {/* Petal layering with soft shade overlay */}
          <path
            d="M32 32 C36 22 64 22 68 32 C72 44 62 56 50 60 C38 56 28 44 32 32 Z"
            fill="black"
            opacity="0.12"
          />
          <path
            d="M36 34 C40 25 60 25 64 34 C66 42 58 52 50 54 C42 52 34 42 36 34 Z"
            fill={primaryColor}
          />
          {/* Rose Core Swirl */}
          <path
            d="M44 34 C44 30 56 30 56 34 C56 40 46 42 46 46 C46 50 54 50 54 46"
            fill="none"
            stroke="#1F161A"
            strokeWidth="2.5"
          />
          {/* Cute Cartoon Gloss Highlights */}
          <path
            d="M34 26 C38 20 46 18 48 18"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            opacity="0.85"
          />
          <circle cx="34" cy="38" r="2.5" fill="white" opacity="0.8" stroke="none" />
          <circle cx="66" cy="38" r="2" fill="white" opacity="0.8" stroke="none" />
        </g>
      </svg>
    );
  }

  if (key.includes('girasol') || key.includes('flor-3')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.18))' }}
      >
        <g stroke="#261A08" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Leaves */}
          <path d="M22 70 C14 58 26 50 38 56 C34 68 26 72 22 70 Z" fill="#48BB78" />
          <path d="M78 70 C86 58 74 50 62 56 C66 68 74 72 78 70 Z" fill="#48BB78" />
          <path d="M50 65 L50 94" stroke="#2F855A" strokeWidth="4" />
          {/* Yellow Petals Starburst */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <ellipse
              key={deg}
              cx="50"
              cy="25"
              rx="9"
              ry="18"
              fill="#FBBF24"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
          {/* Center Chocolate Seed Disc */}
          <circle cx="50" cy="50" r="19" fill="#78350F" />
          <circle cx="50" cy="50" r="14" fill="#92400E" />
          {/* Cute Smile / Seed Texture */}
          <circle cx="45" cy="46" r="2" fill="#FDE68A" stroke="none" />
          <circle cx="55" cy="46" r="2" fill="#FDE68A" stroke="none" />
          <path d="M46 54 Q50 58 54 54" fill="none" stroke="#FDE68A" strokeWidth="1.5" />
          {/* Gloss */}
          <path d="M38 22 Q44 14 52 14" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        </g>
      </svg>
    );
  }

  if (key.includes('hortensia') || key.includes('flor-5')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.18))' }}
      >
        <g stroke="#1A202C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Stem & Leaves */}
          <path d="M50 72 L50 95" stroke="#2F855A" strokeWidth="4" />
          <path d="M25 75 Q15 62 35 60 Q38 72 25 75 Z" fill="#48BB78" />
          <path d="M75 75 Q85 62 65 60 Q62 72 75 75 Z" fill="#48BB78" />
          {/* Fluffy Cluster base */}
          <circle cx="50" cy="45" r="32" fill={primaryColor} opacity="0.9" />
          {/* Mini Cute Petals */}
          {[
            { cx: 38, cy: 32 },
            { cx: 62, cy: 32 },
            { cx: 50, cy: 26 },
            { cx: 32, cy: 46 },
            { cx: 50, cy: 44 },
            { cx: 68, cy: 46 },
            { cx: 40, cy: 58 },
            { cx: 60, cy: 58 },
          ].map((pt, i) => (
            <g key={i}>
              <circle cx={pt.cx} cy={pt.cy} r="9" fill={primaryColor} />
              <circle cx={pt.cx} cy={pt.cy} r="2.5" fill="#FEF08A" stroke="#1A202C" strokeWidth="1" />
            </g>
          ))}
          {/* Gloss */}
          <circle cx="44" cy="22" r="2" fill="white" stroke="none" />
          <circle cx="58" cy="24" r="1.5" fill="white" stroke="none" />
        </g>
      </svg>
    );
  }

  if (key.includes('eucalipto') || key.includes('flor-6')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.15))' }}
      >
        <g stroke="#133022" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 94 Q48 55 52 10" fill="none" stroke="#2F855A" strokeWidth="3" />
          {[
            { y: 22, rot: -30, r: 10 },
            { y: 36, rot: 25, r: 12 },
            { y: 52, rot: -28, r: 13 },
            { y: 68, rot: 32, r: 14 },
          ].map((l, idx) => (
            <ellipse
              key={idx}
              cx="50"
              cy={l.y}
              rx={l.r * 1.3}
              ry={l.r}
              fill="#34D399"
              transform={`rotate(${l.rot} 50 ${l.y})`}
            />
          ))}
        </g>
      </svg>
    );
  }

  // --- 2. CARTOON GLOBOS ---
  if (key.includes('coraz') || key.includes('globo-1')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.22))' }}
      >
        <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Balloon knot & hanging string */}
          <path d="M50 78 Q46 88 52 96" fill="none" stroke="#64748B" strokeWidth="2" />
          <polygon points="50,73 45,79 55,79" fill={primaryColor} />
          {/* Glossy Cartoon Foil Heart */}
          <path
            d="M50 75 C45 70 20 54 18 36 C16 18 35 15 50 30 C65 15 84 18 82 36 C80 54 55 70 50 75 Z"
            fill={primaryColor}
          />
          {/* Darker shadow edge */}
          <path
            d="M50 75 C45 70 20 54 18 36 C17 28 22 22 28 20 C24 32 36 56 50 72 C64 56 76 32 72 20 C78 22 83 28 82 36 C80 54 55 70 50 75 Z"
            fill="black"
            opacity="0.14"
            stroke="none"
          />
          {/* Cartoon Shiny Specular Glare */}
          <path
            d="M26 28 C28 22 36 19 42 20"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="46" cy="24" r="2.5" fill="white" stroke="none" />
          <path
            d="M72 32 C74 36 74 44 70 50"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.7"
          />
        </g>
      </svg>
    );
  }

  if (key.includes('estrella') || key.includes('globo-3')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.22))' }}
      >
        <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Hanging string */}
          <path d="M50 78 Q54 86 48 96" fill="none" stroke="#64748B" strokeWidth="2" />
          <polygon points="50,74 45,80 55,80" fill={primaryColor} />
          {/* Cartoon Star Foil */}
          <path
            d="M50 14 L60 36 L84 38 L66 54 L72 78 L50 64 L28 78 L34 54 L16 38 L40 36 Z"
            fill={primaryColor}
          />
          {/* Star Core Shading */}
          <path
            d="M50 14 L60 36 L50 64 L40 36 Z"
            fill="white"
            opacity="0.25"
            stroke="none"
          />
          <path
            d="M50 64 L72 78 L66 54 Z"
            fill="black"
            opacity="0.15"
            stroke="none"
          />
          {/* Cartoon Sparkle & Glare */}
          <circle cx="36" cy="38" r="3" fill="white" stroke="none" />
          <circle cx="42" cy="44" r="1.5" fill="white" stroke="none" />
          <path d="M56 22 L58 30" stroke="white" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  if (key.includes('burbuja') || key.includes('confeti') || key.includes('globo-2')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.2))' }}
      >
        <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* String & Knot */}
          <path d="M50 78 Q47 88 52 96" fill="none" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="50" cy="76" r="3.5" fill={primaryColor} />
          {/* Crystal Bubble Body */}
          <circle cx="50" cy="45" r="31" fill="#E0F2FE" fillOpacity="0.45" />
          {/* Colorful Confetti Dots Inside */}
          <circle cx="38" cy="38" r="3.5" fill="#EF4444" stroke="none" />
          <circle cx="62" cy="36" r="3" fill="#F59E0B" stroke="none" />
          <circle cx="48" cy="48" r="4" fill="#8B5CF6" stroke="none" />
          <circle cx="36" cy="52" r="3" fill="#10B981" stroke="none" />
          <circle cx="58" cy="54" r="3.5" fill="#EC4899" stroke="none" />
          <rect x="42" y="32" width="4" height="4" fill="#3B82F6" stroke="none" transform="rotate(25 44 34)" />
          <rect x="52" y="42" width="5" height="3" fill="#EAB308" stroke="none" transform="rotate(-35 54 43)" />
          {/* Specular curved cartoon gloss */}
          <path
            d="M32 30 C36 22 46 18 54 18"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="60" cy="22" r="2.5" fill="white" stroke="none" />
          <path
            d="M66 58 C68 52 68 44 65 38"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.8"
          />
        </g>
      </svg>
    );
  }

  if (key.includes('globo') || key.includes('bouq')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.22))' }}
      >
        <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 76 Q46 86 52 96" fill="none" stroke="#64748B" strokeWidth="2" />
          <polygon points="50,71 45,77 55,77" fill={primaryColor} />
          {/* Round Oval Balloon */}
          <ellipse cx="50" cy="42" rx="30" ry="34" fill={primaryColor} />
          {/* Shading */}
          <path
            d="M68 28 C74 38 74 54 62 66 C72 60 78 48 76 36 C75 32 72 30 68 28 Z"
            fill="black"
            opacity="0.15"
            stroke="none"
          />
          {/* Gloss */}
          <path
            d="M32 26 C36 20 44 16 52 16"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="58" cy="20" r="2.5" fill="white" stroke="none" />
        </g>
      </svg>
    );
  }

  // --- 3. CARTOON CHOCOLATES ---
  if (key.includes('ferrero') || key.includes('choc-1')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.2))' }}
      >
        <g stroke="#261A0C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Brown Pleated Paper Cup */}
          <path d="M26 62 L32 85 L68 85 L74 62 Z" fill="#451A03" />
          <path d="M35 62 L38 85" stroke="#78350F" strokeWidth="1.5" />
          <path d="M50 62 L50 85" stroke="#78350F" strokeWidth="1.5" />
          <path d="M65 62 L62 85" stroke="#78350F" strokeWidth="1.5" />
          {/* Golden Foil Wrapped Sphere */}
          <circle cx="50" cy="46" r="26" fill="#F59E0B" />
          <path
            d="M50 20 C64 20 76 32 76 46 C76 60 64 72 50 72 C36 72 24 60 24 46 C24 32 36 20 50 20 Z"
            fill="#D97706"
            opacity="0.3"
          />
          {/* Cute Sticker Badge Oval */}
          <ellipse cx="50" cy="45" rx="14" ry="9" fill="#FEF3C7" />
          <text
            x="50"
            y="48"
            fontSize="7"
            fontFamily="sans-serif"
            fontWeight="bold"
            textAnchor="middle"
            fill="#78350F"
            stroke="none"
          >
            ROCHER
          </text>
          {/* Foil sparkle highlights */}
          <circle cx="36" cy="34" r="3" fill="white" stroke="none" />
          <circle cx="42" cy="30" r="1.5" fill="white" stroke="none" />
        </g>
      </svg>
    );
  }

  if (key.includes('lindt') || key.includes('bomb') || key.includes('choc-2')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.2))' }}
      >
        <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bonbon Twisted Wrapper Tails */}
          <polygon points="22,50 8,36 12,50 8,64" fill="#DC2626" />
          <polygon points="78,50 92,36 88,50 92,64" fill="#DC2626" />
          {/* Round Bonbon Body */}
          <circle cx="50" cy="50" r="26" fill="#DC2626" />
          <circle cx="50" cy="50" r="22" fill="#B91C1C" opacity="0.35" />
          {/* Gold Lindor Swirl Ribbon around center */}
          <path d="M28 50 Q50 38 72 50 Q50 62 28 50 Z" fill="#FCD34D" />
          {/* Gloss */}
          <path d="M38 34 Q46 28 54 30" fill="none" stroke="white" strokeWidth="3" />
          <circle cx="62" cy="36" r="2" fill="white" stroke="none" />
        </g>
      </svg>
    );
  }

  if (key.includes('chocolate') || key.includes('tabla') || key.includes('choc-3')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.2))' }}
      >
        <g stroke="#261A0C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Chocolate Bar Wrapper with Peeling Silver foil */}
          <rect x="22" y="18" width="56" height="68" rx="6" fill="#451A03" />
          {/* Inner Chocolate grid blocks */}
          <rect x="28" y="24" width="20" height="18" rx="2" fill="#78350F" />
          <rect x="52" y="24" width="20" height="18" rx="2" fill="#78350F" />
          {/* Silver foil peeled down */}
          <polygon points="20,44 80,44 76,50 24,50" fill="#E2E8F0" />
          {/* Red/Gold Outer paper wrapper */}
          <rect x="20" y="48" width="60" height="40" rx="4" fill="#DC2626" />
          {/* Cute Heart Seal on Wrapper */}
          <path d="M50 72 C48 68 40 64 42 58 C44 54 50 56 50 60 C50 56 56 54 58 58 C60 64 52 68 50 72 Z" fill="#FCD34D" stroke="none" />
          <text x="50" y="82" fontSize="6" fontWeight="bold" textAnchor="middle" fill="white" stroke="none">CHOCO</text>
        </g>
      </svg>
    );
  }

  // --- 4. CARTOON PELUCHES ---
  if (key.includes('peluche') || key.includes('osito') || key.includes('pel-1') || key.includes('pel-2')) {
    const isLove = key.includes('amor') || key.includes('pel-2') || key.includes('love');
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.22))' }}
      >
        <g stroke="#2B1D12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bear Ears */}
          <circle cx="28" cy="24" r="11" fill="#B45309" />
          <circle cx="28" cy="24" r="6" fill="#FDE68A" />
          <circle cx="72" cy="24" r="11" fill="#B45309" />
          <circle cx="72" cy="24" r="6" fill="#FDE68A" />
          {/* Bear Body */}
          <ellipse cx="50" cy="68" rx="26" ry="24" fill="#B45309" />
          {/* Bear Feet with cute pads */}
          <ellipse cx="26" cy="85" rx="10" ry="8" fill="#B45309" />
          <circle cx="26" cy="85" r="4.5" fill="#FDE68A" />
          <ellipse cx="74" cy="85" rx="10" ry="8" fill="#B45309" />
          <circle cx="74" cy="85" r="4.5" fill="#FDE68A" />
          {/* Bear Arms */}
          <ellipse cx="22" cy="62" rx="8" ry="12" fill="#B45309" transform="rotate(20 22 62)" />
          <ellipse cx="78" cy="62" rx="8" ry="12" fill="#B45309" transform="rotate(-20 78 62)" />
          {/* Held Big Red Cartoon Heart if Love Bear */}
          {isLove && (
            <path
              d="M50 78 C44 72 26 56 28 46 C30 36 44 36 50 44 C56 36 70 36 72 46 C74 56 56 72 50 78 Z"
              fill="#EF4444"
            />
          )}
          {/* Bear Head */}
          <circle cx="50" cy="40" r="24" fill="#B45309" />
          {/* Snout Muzzle */}
          <ellipse cx="50" cy="46" rx="11" ry="8" fill="#FDE68A" />
          {/* Cute Cartoon Nose & Smile */}
          <polygon points="50,42 45,45 55,45" fill="#2B1D12" />
          <path d="M50 45 L50 49" />
          <path d="M46 49 Q50 52 54 49" fill="none" />
          {/* Sparkling Cartoon Eyes with reflection */}
          <circle cx="39" cy="36" r="3.5" fill="#1C1917" />
          <circle cx="38" cy="35" r="1.2" fill="white" stroke="none" />
          <circle cx="61" cy="36" r="3.5" fill="#1C1917" />
          <circle cx="60" cy="35" r="1.2" fill="white" stroke="none" />
          {/* Sweet Pink Blush Cheeks */}
          <ellipse cx="32" cy="44" rx="4" ry="2.5" fill="#F472B6" opacity="0.75" stroke="none" />
          <ellipse cx="68" cy="44" rx="4" ry="2.5" fill="#F472B6" opacity="0.75" stroke="none" />
        </g>
      </svg>
    );
  }

  if (key.includes('conejo') || key.includes('pel-3')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.22))' }}
      >
        <g stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Long Bunny Ears */}
          <ellipse cx="36" cy="20" rx="8" ry="20" fill="#FFFFFF" transform="rotate(-12 36 20)" />
          <ellipse cx="36" cy="20" rx="4" ry="14" fill="#FBCFE8" transform="rotate(-12 36 20)" />
          <ellipse cx="64" cy="20" rx="8" ry="20" fill="#FFFFFF" transform="rotate(12 64 20)" />
          <ellipse cx="64" cy="20" rx="4" ry="14" fill="#FBCFE8" transform="rotate(12 64 20)" />
          {/* Bunny Body */}
          <ellipse cx="50" cy="70" rx="24" ry="22" fill="#FFFFFF" />
          {/* Paws */}
          <circle cx="32" cy="86" r="7" fill="#FFFFFF" />
          <circle cx="68" cy="86" r="7" fill="#FFFFFF" />
          {/* Bunny Head */}
          <circle cx="50" cy="48" r="22" fill="#FFFFFF" />
          {/* Eyes */}
          <circle cx="42" cy="46" r="3" fill="#1F2937" />
          <circle cx="41" cy="45" r="1" fill="white" stroke="none" />
          <circle cx="58" cy="46" r="3" fill="#1F2937" />
          <circle cx="57" cy="45" r="1" fill="white" stroke="none" />
          {/* Pink Nose & Smile */}
          <ellipse cx="50" cy="52" rx="2.5" ry="1.8" fill="#F472B6" />
          <path d="M47 55 Q50 57 53 55" fill="none" />
          {/* Blush */}
          <ellipse cx="36" cy="52" rx="4" ry="2" fill="#FBCFE8" stroke="none" />
          <ellipse cx="64" cy="52" rx="4" ry="2" fill="#FBCFE8" stroke="none" />
        </g>
      </svg>
    );
  }

  // --- 5. CARTOON DECORACIÓN ---
  if (key.includes('led') || key.includes('luz') || key.includes('dec-1')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 4px 10px rgba(253,224,71,0.5))' }}
      >
        <g stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Twirly wire string */}
          <path d="M12 70 Q30 30 50 60 T88 40" fill="none" stroke="#64748B" strokeWidth="2.5" />
          {/* Glowing cartoon fairy bulbs */}
          {[
            { cx: 24, cy: 46 },
            { cx: 40, cy: 48 },
            { cx: 58, cy: 58 },
            { cx: 76, cy: 44 },
          ].map((pt, i) => (
            <g key={i}>
              <circle cx={pt.cx} cy={pt.cy} r="10" fill="#FEF08A" opacity="0.45" stroke="none" />
              <ellipse cx={pt.cx} cy={pt.cy} rx="5" ry="7" fill="#FDE047" stroke="#1F2937" strokeWidth="2" />
              <circle cx={pt.cx - 1.5} cy={pt.cy - 2} r="1.5" fill="white" stroke="none" />
            </g>
          ))}
          {/* Sparkles */}
          <path d="M20 20 L20 28 M16 24 L24 24" stroke="#FBBF24" strokeWidth="2" />
          <path d="M78 20 L78 28 M74 24 L82 24" stroke="#FBBF24" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  if (key.includes('corona') || key.includes('dec-2')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.22))' }}
      >
        <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Gold Cartoon Royal Crown */}
          <path
            d="M18 68 L22 36 L38 52 L50 26 L62 52 L78 36 L82 68 Z"
            fill="#FBBF24"
          />
          {/* Crown Base Band */}
          <rect x="18" y="66" width="64" height="12" rx="3" fill="#D97706" />
          {/* Embedded Cartoon Jewels */}
          <circle cx="22" cy="34" r="4.5" fill="#EF4444" />
          <circle cx="50" cy="24" r="5.5" fill="#3B82F6" />
          <circle cx="78" cy="34" r="4.5" fill="#EF4444" />
          <circle cx="34" cy="72" r="3" fill="#10B981" />
          <circle cx="50" cy="72" r="3" fill="#EC4899" />
          <circle cx="66" cy="72" r="3" fill="#10B981" />
          {/* Shiny Glare */}
          <path d="M44 38 L48 48" stroke="white" strokeWidth="2.5" />
        </g>
      </svg>
    );
  }

  if (key.includes('mariposa') || key.includes('dec-3')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.2))' }}
      >
        <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Wings Left */}
          <path d="M50 50 C40 20 12 25 18 48 C22 62 46 54 50 50 Z" fill="#F472B6" />
          <path d="M50 54 C38 58 24 76 34 84 C44 88 48 64 50 54 Z" fill="#F472B6" />
          {/* Wings Right */}
          <path d="M50 50 C60 20 88 25 82 48 C78 62 54 54 50 50 Z" fill="#F472B6" />
          <path d="M50 54 C62 58 76 76 66 84 C56 88 52 64 50 54 Z" fill="#F472B6" />
          {/* Wing Spots */}
          <circle cx="30" cy="40" r="4" fill="#FDE047" stroke="none" />
          <circle cx="70" cy="40" r="4" fill="#FDE047" stroke="none" />
          {/* Butterfly Body & Antennae */}
          <ellipse cx="50" cy="56" rx="4" ry="16" fill="#1F2937" />
          <path d="M48 42 Q40 28 34 26" fill="none" />
          <path d="M52 42 Q60 28 66 26" fill="none" />
        </g>
      </svg>
    );
  }

  // --- 6. CARTOON CINTAS ---
  if (key.includes('cinta') || key.includes('lazo') || key.includes('cin-')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.22))' }}
      >
        <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Ribbon Tails */}
          <path d="M44 54 L32 88 L46 80 L52 86 L48 54 Z" fill={primaryColor} />
          <path d="M56 54 L68 88 L54 80 L48 86 L52 54 Z" fill={primaryColor} />
          {/* Ribbon Loops Left & Right */}
          <path
            d="M50 50 C44 32 14 30 18 52 C22 66 44 54 50 50 Z"
            fill={primaryColor}
          />
          <path
            d="M50 50 C56 32 86 30 82 52 C78 66 56 54 50 50 Z"
            fill={primaryColor}
          />
          {/* Center Knot */}
          <circle cx="50" cy="50" r="8" fill={primaryColor} />
          {/* Shading & Gloss */}
          <path d="M26 42 Q36 36 44 42" stroke="white" strokeWidth="2.5" fill="none" />
          <path d="M74 42 Q64 36 56 42" stroke="white" strokeWidth="2.5" fill="none" />
        </g>
      </svg>
    );
  }

  // --- 7. CARTOON CAJAS ---
  if (key.includes('caja') || key.includes('sombrerera') || key.includes('caj-')) {
    const isHeartBox = key.includes('coraz');
    if (isHeartBox) {
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={className}
          style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.25))' }}
        >
          <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Box Body Depth */}
            <path
              d="M50 82 C44 76 18 58 18 42 L18 52 C18 68 44 86 50 92 C56 86 82 68 82 52 L82 42 C82 58 56 76 50 82 Z"
              fill="black"
              opacity="0.25"
            />
            {/* Heart Lid */}
            <path
              d="M50 78 C44 72 18 54 18 38 C18 22 36 20 50 34 C64 20 82 22 82 38 C82 54 56 72 50 78 Z"
              fill={primaryColor}
            />
            {/* Gold Ribbon Cross */}
            <path d="M50 34 L50 78" stroke="#FBBF24" strokeWidth="5" />
            {/* Cute Cartoon Bow */}
            <ellipse cx="44" cy="38" rx="6" ry="4" fill="#FDE047" transform="rotate(-25 44 38)" />
            <ellipse cx="56" cy="38" rx="6" ry="4" fill="#FDE047" transform="rotate(25 56 38)" />
            <circle cx="50" cy="38" r="3.5" fill="#F59E0B" />
          </g>
        </svg>
      );
    }

    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.25))' }}
      >
        <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Cylinder Luxury Hat Box Base */}
          <ellipse cx="50" cy="80" rx="36" ry="12" fill={primaryColor} />
          <path d="M14 42 L14 80 C14 88 86 88 86 80 L86 42 Z" fill={primaryColor} />
          {/* Box Body Shadow Side */}
          <path d="M62 42 L62 80 C74 79 86 78 86 76 L86 42 Z" fill="black" opacity="0.18" stroke="none" />
          {/* Cylinder Lid */}
          <ellipse cx="50" cy="42" rx="37" ry="12" fill={primaryColor} />
          <path d="M13 36 L13 44 C13 52 87 52 87 44 L87 36 Z" fill={primaryColor} />
          <ellipse cx="50" cy="36" rx="37" ry="12" fill={primaryColor} />
          {/* Gold Trim / Ribbon Band */}
          <path d="M14 60 C14 68 86 68 86 60" fill="none" stroke="#FBBF24" strokeWidth="5" />
          {/* Gloss */}
          <path d="M26 34 C34 30 46 28 54 28" fill="none" stroke="white" strokeWidth="2.5" />
        </g>
      </svg>
    );
  }

  // --- 8. CARTOON ACCESORIOS (TOPPERS) ---
  if (key.includes('topper') || key.includes('accesor') || key.includes('acc-')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.22))' }}
      >
        <g stroke="#1F161A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Topper Stick */}
          <line x1="50" y1="52" x2="50" y2="95" stroke="#D4AF37" strokeWidth="3" />
          {/* Calligraphy Bubble Frame */}
          <path
            d="M20 38 Q50 16 80 38 Q50 60 20 38 Z"
            fill="#FBBF24"
            stroke="#1F161A"
            strokeWidth="2.5"
          />
          {/* Text inside */}
          <text
            x="50"
            y="42"
            fontSize="10"
            fontFamily="'Dancing Script', cursive, serif"
            fontWeight="bold"
            textAnchor="middle"
            fill="#78350F"
            stroke="none"
          >
            {key.includes('te amo') ? 'Te Amo' : 'Felicidades'}
          </text>
          {/* Sparkles */}
          <circle cx="28" cy="28" r="2" fill="white" stroke="none" />
          <circle cx="72" cy="28" r="2" fill="white" stroke="none" />
        </g>
      </svg>
    );
  }

  // Generic fallback cartoon gift element
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.18))' }}
    >
      <g stroke="#1F161A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="22" y="32" width="56" height="52" rx="8" fill={primaryColor} />
        <rect x="18" y="24" width="64" height="14" rx="4" fill={primaryColor} />
        <line x1="50" y1="24" x2="50" y2="84" stroke="#FBBF24" strokeWidth="6" />
        <ellipse cx="42" cy="18" rx="8" ry="6" fill="#FDE047" transform="rotate(-20 42 18)" />
        <ellipse cx="58" cy="18" rx="8" ry="6" fill="#FDE047" transform="rotate(20 58 18)" />
        <circle cx="50" cy="18" r="4" fill="#F59E0B" />
      </g>
    </svg>
  );
};
