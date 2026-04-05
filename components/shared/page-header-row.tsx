import { cn } from "@/lib/utils";
import type { PageHeaderRowProps } from "@/lib/types/components/shared";

export function PageHeaderRow({
  title,
  description,
  action,
  className,
}: PageHeaderRowProps) {
  return (
    <div
      className={cn(
        "flex flex-row items-start justify-between gap-3 border-b border-border pb-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
