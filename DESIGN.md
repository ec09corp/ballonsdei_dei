# Design System
<!-- impeccable:design-schema 1 -->

## Design Direction & Dials
- **DESIGN_VARIANCE:** 7 (Balanced Boutique Elegance)
- **MOTION_INTENSITY:** 6 (Organic Micro-interactions & Tactile Springs)
- **VISUAL_DENSITY:** 4 (Spacious, Editorial & Content-Focused)

## Color Palette
- Primary Brand: Royal Plum `#763D8B` (interactive focus, primary CTA, badges)
- Primary Hover: `#602F72` / `#52255E`
- Gold Accent: Champagne Gold `#D4AF37` / `#C19B65`
- Background Ground: Warm Studio Canvas `#FAF8F5`
- Surface Containers: White `#FFFFFF` with border `#EBE2DB` / `#EDE5DF`
- Text Primary: Deep Cocoa `#2E2421` / `#2B1D28`
- Text Secondary: Muted Warm Stone `#7A6B63` / `#86707F`
- Success: Emerald `#059669`
- Urgency / Stock: Crimson `#BE123C`

## Typography
- Display / Headings: `Cormorant Garamond, Georgia, serif`
- Body / UI / Labels: `Plus Jakarta Sans, system-ui, sans-serif`
- Hierarchy:
  - Hero title: `text-3xl sm:text-5xl font-serif font-light`
  - Section headers: `text-2xl sm:text-3xl font-serif font-medium`
  - Card titles: `font-serif text-base sm:text-lg font-medium`
  - UI labels: `text-xs uppercase tracking-wider font-semibold`

## Motion & Tactile Physics (Emil Kowalski Standard)
- Curve `--ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)`
- Curve `--ease-drawer`: `cubic-bezier(0.32, 0.72, 0, 1)`
- Instant sink on press: `75ms transform: scale(0.97)`
- Elastic release: `160ms`
- Hover elevation: gated to `@media (hover: hover) and (pointer: fine)`
- Modal transitions: scale from `0.96` to `1.0` with opacity fade (never `scale(0)`)
- Reduced motion: `@media (prefers-reduced-motion: reduce)` resets duration to `0.01ms`

## Anti-Pattern Rules (Enforced by Impeccable)
1. No generic AI-purple/fuchsia neon gradients. Use bespoke plum and warm champagne.
2. No cartoonish bouncy animations (`animate-bounce`). Use exponential easing.
3. No emojis in structural UI buttons.
4. No un-gated hover states that get stuck on mobile touchscreens.
