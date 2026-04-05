"use client";

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RowActionsMenuTriggerProps } from "@/lib/types/components/shared";

/** Botão ⋮ em linhas de lista (editar / excluir). */
export function RowActionsMenuTrigger({
  className,
  ...props
}: RowActionsMenuTriggerProps) {
  return (
    <DropdownMenuTrigger
      type="button"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "size-9 shrink-0 touch-manipulation text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
