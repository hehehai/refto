import type { QueryClient, QueryKey } from "@tanstack/react-query";

interface WithId {
  id: string;
}

/**
 * Add a new item to query data array
 */
export function addQueryData<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  newItem: T,
  options?: {
    prepend?: boolean;
  }
): void {
  queryClient.setQueryData<T[]>(queryKey, (old) => {
    if (!old) return [newItem];
    return options?.prepend ? [newItem, ...old] : [...old, newItem];
  });
}

/**
 * Update an existing item in query data array by id
 */
export function updateQueryData<T extends WithId>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updatedItem: T
): void {
  queryClient.setQueryData<T[]>(queryKey, (old) =>
    old?.map((item) => (item.id === updatedItem.id ? updatedItem : item))
  );
}

/**
 * Update an existing item in query data array with sorting
 */
export function updateQueryDataWithSort<T extends WithId>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updatedItem: T,
  sortFn: (a: T, b: T) => number
): void {
  queryClient.setQueryData<T[]>(queryKey, (old) => {
    const updated = old?.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    return updated?.sort(sortFn);
  });
}

/**
 * Delete an item from query data array by id
 */
export function deleteQueryData<T extends WithId>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string
): void {
  queryClient.setQueryData<T[]>(queryKey, (old) =>
    old?.filter((item) => item.id !== id)
  );
}

/**
 * Merge update into existing query data object
 */
export function mergeQueryData<T extends object>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updates: Partial<T>
): void {
  queryClient.setQueryData<T>(queryKey, (old) =>
    old ? { ...old, ...updates } : old
  );
}
