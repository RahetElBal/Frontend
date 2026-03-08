import * as React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import type { UseTableReturn, SortDirection } from "@/hooks/useTable";

// ============================================
// TYPES
// ============================================

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  table: UseTableReturn<T>;
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
}

// ============================================
// SORT ICON
// ============================================

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (!direction) {
    return <ArrowUpDown className="ms-2 h-4 w-4 text-muted-foreground/50" />;
  }
  if (direction === "asc") {
    return <ArrowUp className="ms-2 h-4 w-4" />;
  }
  return <ArrowDown className="ms-2 h-4 w-4" />;
}

// ============================================
// DATA TABLE
// ============================================

/**
 * Data table component with sorting, filtering, selection, and automatic empty state
 *
 * @example
 * <DataTable table={table} columns={columns} />
 */
export function DataTable<T extends { id: string }>({
  table,
  columns,
  onRowClick,
  selectable = false,
  searchPlaceholder,
  emptyMessage,
  loading = false,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder || t("common.search")}
            value={table.search}
            onChange={(e) => table.setSearch(e.target.value)}
            className="ps-9"
          />
          {table.search && (
            <button
              onClick={() => table.setSearch("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={table.isAllSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        table.selectAll();
                      } else {
                        table.deselectAll();
                      }
                    }}
                    aria-label={t("common.selectAll")}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.sortable ? (
                    <button
                      className="flex items-center transition-colors hover:text-accent-pink-700"
                      onClick={() => table.setSort(column.key)}
                    >
                      {column.header}
                      <SortIcon
                        direction={table.getSortDirection(column.key)}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Spinner size="sm" />
                    <span className="text-sm">{t("common.loading")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {emptyMessage || t("common.noResults")}
                </TableCell>
              </TableRow>
            ) : (
              table.items.map((item) => (
                <TableRow
                  key={item.id}
                  data-state={
                    table.isSelected(item.id) ? "selected" : undefined
                  }
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={table.isSelected(item.id)}
                        onCheckedChange={() => table.toggleItem(item.id)}
                        aria-label={t("common.selectRow")}
                      />
                    </TableCell>
                  )}
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

      {/* Pagination */}
      <TablePagination table={table} />
    </div>
  );
}

// ============================================
// TABLE PAGINATION
// ============================================

interface TablePaginationProps<T extends { id: string }> {
  table: UseTableReturn<T>;
}

export function TablePagination<T extends { id: string }>({
  table,
}: TablePaginationProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {table.selectedCount > 0
          ? t("common.selectedCount", { count: table.selectedCount })
          : t("common.showingCount", {
              from: (table.page - 1) * table.perPage + 1,
              to: Math.min(table.page * table.perPage, table.totalItems),
              total: table.totalItems,
            })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="pointer-events-auto"
          onClick={table.prevPage}
          disabled={!table.canPrevPage}
        >
          {t("common.previous")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("common.pageOf", { page: table.page, total: table.totalPages })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="pointer-events-auto"
          onClick={table.nextPage}
          disabled={!table.canNextPage}
        >
          {t("common.next")}
        </Button>
      </div>
    </div>
  );
}
