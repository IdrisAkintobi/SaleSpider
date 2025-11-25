import type { Product } from '@/lib/types'
import { PAGE_SIZE } from '@/lib/constants'
import { fetchJson } from '@/lib/fetch-utils'

export interface GetProductsResponse {
  products: Product[]
  totalCount: number
  totalPages: number
  hasMore: boolean
}

export async function getProducts(
  page: number = 1,
  pageSize: number = PAGE_SIZE,
  search?: string,
  signal?: AbortSignal
): Promise<GetProductsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (search?.trim()) params.set('search', search.trim())

  const data = await fetchJson<any>(`/api/products?${params.toString()}`, {
    signal,
  })
  return {
    products: data.products,
    totalCount: data.totalCount,
    totalPages: data.totalPages,
    hasMore: page < data.totalPages,
  }
}
