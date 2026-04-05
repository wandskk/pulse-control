import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EmptyStateCardProps } from "@/lib/types/components/shared";

export function EmptyStateCard({
  icon: Icon,
  message,
  action,
  className,
  contentClassName,
  iconClassName,
}: EmptyStateCardProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent
        className={cn(
          "flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground",
          contentClassName,
        )}
      >
        <Icon
          className={cn("size-10 opacity-50", iconClassName)}
          aria-hidden
        />
        <p>{message}</p>
        {action}
      </CardContent>
    </Card>
  );
}
