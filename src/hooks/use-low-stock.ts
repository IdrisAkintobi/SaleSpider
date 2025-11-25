import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/lib/fetch-utils'
import type { Product } from '@/lib/types'

export function useLowStock() {
  return useQuery<Product[]>({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      const response = await fetchJson<{ products: Product[] }>(
        '/api/products/low-stock'
      )
      return response.products
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })
}
