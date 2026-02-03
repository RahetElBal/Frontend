import { useTranslation } from "react-i18next";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

interface GlobalLoadingOverlayProps {
  label?: string;
  className?: string;
}

export function GlobalLoadingOverlay({
  label,
  className,
}: GlobalLoadingOverlayProps) {
  const { t } = useTranslation();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isActive = isFetching + isMutating > 0;

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-50 flex items-start justify-end p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 rounded-full bg-background/95 px-3 py-2 shadow-lg ring-1 ring-border">
        <Spinner size="sm" />
        <span className="text-xs text-muted-foreground">
          {label || t("common.loading")}
        </span>
      </div>
    </div>
  );
}
