import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminStatsGridProps {
  children: ReactNode;
  className?: string;
}

export function AdminStatsGrid({ children, className }: AdminStatsGridProps) {
  return <div className={cn("grid gap-4", className)}>{children}</div>;
}
