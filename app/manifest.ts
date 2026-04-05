import type { MetadataRoute } from "next";
import { PWA_BACKGROUND_COLOR, PWA_THEME_COLOR } from "@/lib/constants/brand";

const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME?.trim() || "PulseControl";

/** Origem pública (manifest `id` estável; na Vercel usa VERCEL_URL no build). */
function appOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "";
}

export default function manifest(): MetadataRoute.Manifest {
  const origin = appOrigin();
  return {
    id: origin ? `${origin}/` : "/",
    name: APP_NAME,
    short_name: APP_NAME,
    description: "PWA mobile first — controle remoto por comando.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    prefer_related_applications: false,
    categories: ["utilities", "productivity"],
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
