import { useState, useMemo, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

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

export interface UseTableOptions<T> {
  data: T[];
  initialPage?: number;
  initialPerPage?: number;
  initialSort?: SortConfig;
  initialFilters?: TableFilters;
  searchKeys?: (keyof T)[];
}

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
  nextPage: () => void;
  prevPage: () => void;
  canNextPage: boolean;
  canPrevPage: boolean;
  
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
  setSearch: (search: string) => void;
  
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
  const {
    data,
    initialPage = 1,
    initialPerPage = 10,
    initialSort,
    initialFilters = {},
    searchKeys = [],
  } = options;

  // State
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [sort, setSort] = useState<SortConfig | null>(initialSort || null);
  const [filters, setFiltersState] = useState<TableFilters>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search
  const search = filters.search || '';
  const setSearch = useCallback((value: string) => {
    setFiltersState((prev) => ({ ...prev, search: value }));
    setPage(1);
  }, []);

  // Filter
  const setFilter = useCallback((key: string, value: string | number | boolean | undefined) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const setFilters = useCallback((newFilters: TableFilters) => {
    setFiltersState(newFilters);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
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

  // Apply filters and search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (search && searchKeys.length > 0) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          if (typeof value === 'number') {
            return value.toString().includes(searchLower);
          }
          return false;
        })
      );
    }

    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'search' || value === undefined) return;
      result = result.filter((item) => {
        const itemValue = (item as Record<string, unknown>)[key];
        return itemValue === value;
      });
    });

    return result;
  }, [data, search, filters, searchKeys]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sort.key];
      const bValue = (b as Record<string, unknown>)[sort.key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sort]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / perPage);
  const startIndex = (page - 1) * perPage;
  const items = sortedData.slice(startIndex, startIndex + perPage);

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
    allItems: sortedData,
    
    // Pagination
    page,
    perPage,
    totalPages,
    totalItems,
    setPage,
    setPerPage: handleSetPerPage,
    nextPage,
    prevPage,
    canNextPage,
    canPrevPage,
    
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
    setSearch,
    
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
  };
}
