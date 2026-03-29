import * as React from "react";

import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

import type { Column } from "./data-table";

interface MobileCardsProps<T extends { id: string }> {
  columns: Column<T>[];
  emptyMessage: string;
  items: T[];
  loading?: boolean;
  loadingLabel: string;
  onRowClick?: (item: T) => void;
}

const hasContent = (content: React.ReactNode) => {
  if (content === null || content === undefined || content === false) {
    return false;
  }

  if (typeof content === "string") {
    return content.trim().length > 0;
  }

  return true;
};

export function MobileCards<T extends { id: string }>({
  columns,
  emptyMessage,
  items,
  loading = false,
  loadingLabel,
  onRowClick,
}: MobileCardsProps<T>) {
  const infoColumns = columns.filter((column) => column.header.trim().length > 0);
  const actionColumns = columns.filter((column) => column.header.trim().length === 0);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card px-4 py-10 text-center">
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Spinner size="sm" />
          <span className="text-sm">{loadingLabel}</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "rounded-xl border bg-card p-4 shadow-sm",
            onRowClick && "cursor-pointer",
          )}
          onClick={() => onRowClick?.(item)}
        >
          <div className="space-y-3">
            {infoColumns.map((column) => {
              const content = column.render
                ? column.render(item)
                : ((item as Record<string, unknown>)[column.key] as React.ReactNode);

              if (!hasContent(content)) {
                return null;
              }

              return (
                <div key={column.key} className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {column.header}
                  </p>
                  <div className={cn("text-sm text-foreground", column.className)}>
                    {content}
                  </div>
                </div>
              );
            })}

            {actionColumns.length > 0 && (
              <div className="flex items-center justify-end gap-2 border-t pt-3">
                {actionColumns.map((column) => {
                  const content = column.render
                    ? column.render(item)
                    : ((item as Record<string, unknown>)[
                        column.key
                      ] as React.ReactNode);

                  if (!hasContent(content)) {
                    return null;
                  }

                  return (
                    <div key={column.key} className={cn("shrink-0", column.className)}>
                      {content}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
