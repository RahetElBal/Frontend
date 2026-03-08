import { useCallback, useEffect, useState } from "react";

interface UseServerTableStateOptions {
  debounceMs?: number;
  initialPage?: number;
  initialSearch?: string;
}

export function useServerTableState(
  options: UseServerTableStateOptions = {},
) {
  const {
    debounceMs = 300,
    initialPage = 1,
    initialSearch = "",
  } = options;

  const [page, setPage] = useState(initialPage);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch.trim());

  useEffect(() => {
    const normalizedSearch = searchInput.trim();
    const timeoutId = window.setTimeout(() => {
      setSearch((previousSearch) =>
        previousSearch === normalizedSearch
          ? previousSearch
          : normalizedSearch,
      );
      setPage((previousPage) => (previousPage === 1 ? previousPage : 1));
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, searchInput]);

  const resetPage = useCallback(() => {
    setPage((previousPage) => (previousPage === 1 ? previousPage : 1));
  }, []);

  return {
    page,
    setPage,
    search,
    searchInput,
    setSearchInput,
    resetPage,
  };
}
