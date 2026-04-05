import type { Metadata } from "next";
import { CategoriasPage } from "@/features/categories/components/categorias-page";

export const metadata: Metadata = {
  title: "Categorias",
};

export default function CategoriasRoutePage() {
  return <CategoriasPage />;
}
