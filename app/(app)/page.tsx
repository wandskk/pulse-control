import type { Metadata } from "next";
import { PulseHome } from "@/features/dashboard/components/pulse-home";

export const metadata: Metadata = {
  title: "Início",
};

export default function Home() {
  return <PulseHome />;
}
