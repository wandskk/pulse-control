import type { Metadata } from "next";
import { Suspense } from "react";
import { InlineLoadingText } from "@/components/shared/inline-loading-text";
import { PulseComandosPage } from "@/features/dashboard/components/pulse-comandos-page";

export const metadata: Metadata = {
  title: "Comandos",
};

export default function ComandosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-1 items-center justify-center p-6">
          <InlineLoadingText />
        </div>
      }
    >
      <PulseComandosPage />
    </Suspense>
  );
}
