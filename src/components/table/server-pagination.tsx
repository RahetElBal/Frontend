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
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);
  const showingFrom = totalItems === 0 ? 0 : (safePage - 1) * perPage + 1;
  const showingTo =
    totalItems === 0 ? 0 : Math.min(safePage * perPage, totalItems);
  const canPrevPage = safePage > 1;
  const canNextPage = safePage < safeTotalPages;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {t("common.showingCount", {
          from: showingFrom,
          to: showingTo,
          total: totalItems,
        })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!canPrevPage}
        >
          {t("common.previous")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("common.pageOf", { page: safePage, total: safeTotalPages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!canNextPage}
        >
          {t("common.next")}
        </Button>
      </div>
    </div>
  );
}
