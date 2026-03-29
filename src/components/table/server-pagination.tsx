import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

interface ServerPaginationProps {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ServerPagination({
  page,
  perPage,
  totalItems,
  totalPages,
  onPageChange,
}: ServerPaginationProps) {
  const { t } = useTranslation();
  const safePage = Math.max(page, 1);
  const safeTotalPages = Math.max(totalPages, safePage, 1);
  const showingFrom = totalItems === 0 ? 0 : (safePage - 1) * perPage + 1;
  const showingTo =
    totalItems === 0 ? 0 : Math.min(safePage * perPage, totalItems);
  const canPrevPage = safePage > 1;
  const canNextPage = safePage < safeTotalPages;

  return (
    <div className="relative z-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {t("common.showingCount", {
          from: showingFrom,
          to: showingTo,
          total: totalItems,
        })}
      </p>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="pointer-events-auto flex-1 sm:flex-none"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!canPrevPage}
        >
          {t("common.previous")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("common.pageOf", { page: safePage, total: safeTotalPages })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="pointer-events-auto flex-1 sm:flex-none"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!canNextPage}
        >
          {t("common.next")}
        </Button>
      </div>
    </div>
  );
}
