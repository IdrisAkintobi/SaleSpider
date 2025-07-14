import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
 
export function usePaginatedQuery<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError, TData, QueryKey>
) {
  return useQuery<TData, TError, TData, QueryKey>(options);
} 