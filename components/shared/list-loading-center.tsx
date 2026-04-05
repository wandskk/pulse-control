import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListLoadingCenterProps } from "@/lib/types/components/shared";

export function ListLoadingCenter({
  className,
  iconClassName,
}: ListLoadingCenterProps) {
  return (
    <div className={cn("flex justify-center py-10", className)}>
      <Loader2
        className={cn("size-8 animate-spin text-muted-foreground", iconClassName)}
        aria-hidden
      />
    </div>
  );
}
