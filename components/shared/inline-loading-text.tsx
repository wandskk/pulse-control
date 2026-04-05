import { cn } from "@/lib/utils";
import type { InlineLoadingTextProps } from "@/lib/types/components/shared";

export function InlineLoadingText({ className }: InlineLoadingTextProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      Carregando…
    </p>
  );
}
