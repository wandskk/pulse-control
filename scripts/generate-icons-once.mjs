/**
 * Regenera `public/icon-192.png`, `public/icon-512.png` e `app/icon.png`
 * a partir de `scripts/pwa-icon-source.png` (ícone quadrado da marca).
 *
 * Uso: npm run icons:generate
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "scripts", "pwa-icon-source.png");

const resize = (size, out) =>
  sharp(src)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(out);

await resize(192, path.join(root, "public", "icon-192.png"));
await resize(512, path.join(root, "public", "icon-512.png"));
await resize(512, path.join(root, "app", "icon.png"));

console.log("Gerado: public/icon-192.png, public/icon-512.png, app/icon.png");
