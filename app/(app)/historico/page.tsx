import { Suspense } from "react";
import { HistoricoPage } from "@/features/history/components/historico-page";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="min-h-[40vh] flex-1" aria-hidden />}
    >
      <HistoricoPage />
    </Suspense>
  );
}
