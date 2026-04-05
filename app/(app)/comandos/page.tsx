import type { Metadata } from "next";
import { Suspense } from "react";
import { PulseComandosPage } from "@/features/dashboard/components/pulse-comandos-page";

export const metadata: Metadata = {
  title: "Comandos",
};

export default function ComandosPage() {
  return (
    <Suspense
      fallback={<div className="min-h-[40vh] flex-1" aria-hidden />}
    >
      <PulseComandosPage />
    </Suspense>
  );
}
