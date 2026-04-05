import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import type { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type RowActionsMenuTriggerProps = Omit<
  ComponentProps<typeof DropdownMenuTrigger>,
  "className"
> & { className?: string };

export type ConfirmDestructiveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
};

export type EmptyStateCardProps = {
  icon: LucideIcon;
  message: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Por defeito `size-10 opacity-50`. */
  iconClassName?: string;
};

export type PageHeaderRowProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export type InlineLoadingTextProps = {
  className?: string;
};

export type ListLoadingCenterProps = {
  className?: string;
  iconClassName?: string;
};
