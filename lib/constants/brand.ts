/** Logo horizontal em `public/` (login, header, etc.) */
export const BRAND_LOGO_SRC = "/logo-pulse-control.png" as const;

/** Paleta PulseControl (logo) — manifest, viewport e referência UI */
export const BRAND = {
  navy: "#0F2854",
  blue: "#1C4D8D",
  accent: "#4988C4",
  ice: "#BDE8F5",
} as const;

export const PWA_THEME_COLOR = BRAND.navy;
export const PWA_BACKGROUND_COLOR = BRAND.ice;
