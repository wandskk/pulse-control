import type { Metadata } from "next";
import { PulseComandosPage } from "@/features/dashboard/components/pulse-comandos-page";

export const metadata: Metadata = {
  title: "Comandos",
};

export default function ComandosPage() {
  return <PulseComandosPage />;
}
