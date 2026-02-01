import type { ComponentProps } from "react";
import { Badge } from "@/components/badge";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

interface StatusBadgeProps {
  variant?: BadgeVariant;
  label: string;
}

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  return <Badge variant={variant}>{label}</Badge>;
}
