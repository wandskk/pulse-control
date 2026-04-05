import type { NextConfig } from "next";

/**
 * Origens extra permitidas para `/_next/*` e HMR em **dev** (não afeta `next build`).
 * O Next não aceita um único `*`; para “qualquer IP” (IPv4) use `*.*.*.*`.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
 */
const fromEnv = process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedDevOrigins: string[] =
  fromEnv && fromEnv.length > 0 ? fromEnv : ["*.*.*.*"];

const nextConfig: NextConfig = {
  allowedDevOrigins,
};

export default nextConfig;
