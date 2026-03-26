import { useState, useMemo, useCallback, useEffect } from "react";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useGet } from "@/hooks/useGet";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  perPage: number;
  total: number;
}

export interface TableFilters {
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

interface TableMeta {
  currentPage?: number;
  lastPage?: number;
  perPage?: number;
  total?: number;
}

interface UseClientTableOptions<T> {
  data: T[];
  initialPage?: number;
  initialPerPage?: number;
  initialSort?: SortConfig;
  initialFilters?: TableFilters;
  searchKeys?: (keyof T)[];
}

interface UseServerTableOptions<T> {
  path: string;
  query?: TableFilters;
  enabled?: boolean;
  initialPage?: number;
  initialPerPage?: number;
  initialSort?: SortConfig;
  initialFilters?: TableFilters;
  options?: Omit<
    UseQueryOptions<{ items: T[]; meta?: TableMeta }, Error>,
    "queryKey" | "queryFn" | "select"
  >;
}

export type UseTableOptions<T> =
  | UseClientTableOptions<T>
  | UseServerTableOptions<T>;

export interface UseTableReturn<T> {
  // Data
  items: T[];
  allItems: T[];
  
  // Pagination
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  resetPage: () => void;
  nextPage: () => void;
  prevPage: () => void;
  canNextPage: boolean;
  canPrevPage: boolean;
  meta?: TableMeta;
  
  // Sorting
  sort: SortConfig | null;
  setSort: (key: string) => void;
  clearSort: () => void;
  getSortDirection: (key: string) => SortDirection | null;
  
  // Filtering
  filters: TableFilters;
  setFilter: (key: string, value: string | number | boolean | undefined) => void;
  setFilters: (filters: TableFilters) => void;
  clearFilters: () => void;
  search: string;
  searchInput: string;
  setSearch: (search: string) => void;
  setSearchInput: (search: string) => void;
  
  // Selection
  selectedIds: string[];
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  selectedCount: number;

  // Request state
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

/**
 * Hook for managing table state (pagination, sorting, filtering, selection)
 * 
 * @example
 * const { data } = useGet<Client[]>('clients');
 * 
 * const table = useTable({
 *   data: data || [],
 *   initialPerPage: 10,
 *   searchKeys: ['firstName', 'lastName', 'email'],
 * });
 * 
 * // In JSX:
 * <input value={table.search} onChange={(e) => table.setSearch(e.target.value)} />
 * <table>
 *   {table.items.map(item => ...)}
 * </table>
 * <Pagination 
 *   page={table.page} 
 *   totalPages={table.totalPages} 
 *   onPageChange={table.setPage} 
 * />
 */
export function useTable<T extends { id: string }>(
  options: UseTableOptions<T>
): UseTableReturn<T> {
  const isServerTable = "path" in options;
  const {
    initialPage = 1,
    initialPerPage = 10,
    initialSort,
    initialFilters = {},
  } = options;
  const searchKeys = "searchKeys" in options ? options.searchKeys || [] : [];

  // State
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [sort, setSort] = useState<SortConfig | null>(initialSort || null);
  const [filters, setFiltersState] = useState<TableFilters>(initialFilters);
  const [searchInput, setSearchInputState] = useState(
    initialFilters.search || ""
  );
  const [search, setSearchValue] = useState((initialFilters.search || "").trim());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalizedSearch = searchInput.trim();
      setSearchValue((previousSearch) =>
        previousSearch === normalizedSearch ? previousSearch : normalizedSearch
      );
      setPage((previousPage) => (previousPage === 1 ? previousPage : 1));
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  // Search
  const setSearch = useCallback((value: string) => {
    setSearchInputState(value);
  }, []);

  const setSearchInput = useCallback((value: string) => {
    setSearchInputState(value);
  }, []);

  // Filter
  const setFilter = useCallback((key: string, value: string | number | boolean | undefined) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const setFilters = useCallback((newFilters: TableFilters) => {
    setFiltersState(newFilters);
    if (typeof newFilters.search === "string") {
      setSearchInputState(newFilters.search);
    }
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setSearchInputState("");
    setPage(1);
  }, []);

  // Sorting
  const handleSetSort = useCallback((key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return null;
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const clearSort = useCallback(() => {
    setSort(null);
  }, []);

  const getSortDirection = useCallback(
    (key: string): SortDirection | null => {
      if (sort?.key === key) return sort.direction;
      return null;
    },
    [sort]
  );

  const serverQuery = useMemo(() => {
    if (!isServerTable) return undefined;

    const { search: _searchFilter, ...otherFilters } = filters;
    return {
      ...(options.query ?? {}),
      ...otherFilters,
      ...(search ? { search } : {}),
      ...(sort ? { sortBy: sort.key, sortOrder: sort.direction } : {}),
      skip: (page - 1) * perPage,
      limit: perPage,
    };
  }, [filters, isServerTable, options, page, perPage, search, sort]);

  const {
    data: serverData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGet<{ items: T[]; meta?: TableMeta }>({
    path: isServerTable ? options.path : "__disabled_table__",
    query: serverQuery,
    options: {
      ...(isServerTable ? options.options : undefined),
      enabled: isServerTable ? (options.enabled ?? true) : false,
      select: (response) => {
        const normalizedResponse = response as
          | { data?: T[]; meta?: TableMeta }
          | T[];

        if (Array.isArray(normalizedResponse)) {
          return {
            items: normalizedResponse,
            meta: undefined,
          };
        }

        return {
          items: Array.isArray(normalizedResponse?.data)
            ? normalizedResponse.data
            : [],
          meta: normalizedResponse?.meta,
        };
      },
    },
  });

  // Apply filters and search
  const filteredData = useMemo(() => {
    if (isServerTable) {
      return serverData?.items ?? [];
    }

    const result = [...options.data];

    return result.filter((item) => {
      if (search && searchKeys.length > 0) {
        const searchLower = search.toLowerCase();
        const matchesSearch = searchKeys.some((key) => {
          const value = item[key];
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchLower);
          }
          if (typeof value === "number") {
            return value.toString().includes(searchLower);
          }
          return false;
        });

        if (!matchesSearch) {
          return false;
        }
      }

      return Object.entries(filters).every(([key, value]) => {
        if (key === "search" || value === undefined) return true;
        const itemValue = (item as Record<string, unknown>)[key];
        return itemValue === value;
      });
    });
  }, [filters, isServerTable, options, search, searchKeys, serverData?.items]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (isServerTable || !sort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sort.key];
      const bValue = (b as Record<string, unknown>)[sort.key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, isServerTable, sort]);

  const meta = isServerTable ? serverData?.meta : undefined;

  useEffect(() => {
    if (!meta?.lastPage) return;
    const lastPage = Math.max(1, meta.lastPage);
    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [meta?.lastPage, page]);

  // Pagination
  const totalItems = isServerTable ? meta?.total ?? filteredData.length : sortedData.length;
  const totalPages = isServerTable
    ? Math.max(meta?.lastPage ?? 1, 1)
    : Math.max(Math.ceil(totalItems / perPage), 1);
  const startIndex = (page - 1) * perPage;
  const items = isServerTable
    ? filteredData
    : sortedData.slice(startIndex, startIndex + perPage);

  const canNextPage = page < totalPages;
  const canPrevPage = page > 1;

  const nextPage = useCallback(() => {
    if (canNextPage) setPage((p) => p + 1);
  }, [canNextPage]);

  const prevPage = useCallback(() => {
    if (canPrevPage) setPage((p) => p - 1);
  }, [canPrevPage]);

  const handleSetPerPage = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => {
    setPage((previousPage) => (previousPage === 1 ? previousPage : 1));
  }, []);

  // Selection
  const selectItem = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(items.map((item) => item.id));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  return {
    // Data
    items,
    allItems: isServerTable ? filteredData : sortedData,
    
    // Pagination
    page: meta?.currentPage ?? page,
    perPage: meta?.perPage ?? perPage,
    totalPages,
    totalItems,
    setPage,
    setPerPage: handleSetPerPage,
    resetPage,
    nextPage,
    prevPage,
    canNextPage,
    canPrevPage,
    meta,
    
    // Sorting
    sort,
    setSort: handleSetSort,
    clearSort,
    getSortDirection,
    
    // Filtering
    filters,
    setFilter,
    setFilters,
    clearFilters,
    search,
    searchInput,
    setSearch,
    setSearchInput,
    
    // Selection
    selectedIds,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
    selectedCount: selectedIds.length,

    // Request state
    isLoading,
    isFetching,
    error,
    refetch: async () => {
      if (!isServerTable) {
        return [];
      }
      return refetch();
    },
  };
}
