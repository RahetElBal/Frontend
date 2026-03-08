import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

interface ServerPaginationProps {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  newestFirst?: boolean;
}

export function ServerPagination({
  page,
  perPage,
  totalItems,
  totalPages,
  onPageChange,
  newestFirst = false,
}: ServerPaginationProps) {
  const { t } = useTranslation();
  const safePage = Math.max(page, 1);
  const safeTotalPages = Math.max(totalPages, safePage, 1);
  const showingFrom = totalItems === 0 ? 0 : (safePage - 1) * perPage + 1;
  const showingTo =
    totalItems === 0 ? 0 : Math.min(safePage * perPage, totalItems);
  const canPrevPage = newestFirst
    ? safePage < safeTotalPages
    : safePage > 1;
  const canNextPage = newestFirst
    ? safePage > 1
    : safePage < safeTotalPages;
  const previousPage = newestFirst ? safePage + 1 : safePage - 1;
  const nextPage = newestFirst ? safePage - 1 : safePage + 1;

  return (
    <div className="relative z-10 flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {t("common.showingCount", {
          from: showingFrom,
          to: showingTo,
          total: totalItems,
        })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="pointer-events-auto"
          onClick={() => onPageChange(previousPage)}
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
          className="pointer-events-auto"
          onClick={() => onPageChange(nextPage)}
          disabled={!canNextPage}
        >
          {t("common.next")}
        </Button>
      </div>
    </div>
  );
}
