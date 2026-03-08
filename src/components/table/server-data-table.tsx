import * as React from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

import type { Column } from "./data-table";
import { ServerPagination } from "./server-pagination";

interface ServerDataTableProps<T extends { id: string }> {
  items: T[];
  columns: Column<T>[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  newestFirst?: boolean;
  onRowClick?: (item: T) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
}

export function ServerDataTable<T extends { id: string }>({
  items,
  columns,
  page,
  perPage,
  totalItems,
  totalPages,
  onPageChange,
  newestFirst = false,
  onRowClick,
  search,
  onSearchChange,
  searchPlaceholder,
  emptyMessage,
  loading = false,
}: ServerDataTableProps<T>) {
  const { t } = useTranslation();
  const showSearch = typeof search === "string" && !!onSearchChange;

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder || t("common.search")}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="ps-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Spinner size="sm" />
                    <span className="text-sm">{t("common.loading")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage || t("common.noResults")}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render
                        ? column.render(item)
                        : ((item as Record<string, unknown>)[
                            column.key
                          ] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ServerPagination
        page={page}
        perPage={perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={onPageChange}
        newestFirst={newestFirst}
      />
    </div>
  );
}
