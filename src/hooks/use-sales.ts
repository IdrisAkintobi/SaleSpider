import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Sale, SaleItem, PaymentMode } from '@/lib/types'
import { usePaginatedQuery } from './use-paginated-query'
import { queryKeys, dataTypeCache } from '@/lib/query-keys'
import {
  useQueryInvalidator,
  optimisticUpdates,
} from '@/lib/query-invalidation'

export interface UseSalesParams {
  page?: number
  pageSize?: number
  sort?: string
  order?: string
  searchTerm?: string
  cashierId?: string
  paymentMethod?: string
  from?: string // ISO date string
  to?: string // ISO date string
}

export interface SaleQueryResult {
  data: Sale[]
  total: number
  paymentMethodTotals?: Record<string, number>
  totalSalesValue?: number
}

function buildSalesQueryParams(params: UseSalesParams): URLSearchParams {
  const query = new URLSearchParams()
  if (params.page) query.set('page', params.page.toString())
  if (params.pageSize) query.set('pageSize', params.pageSize.toString())
  if (params.sort) query.set('sort', params.sort)
  if (params.order) query.set('order', params.order)
  if (params.searchTerm) query.set('search', params.searchTerm)
  if (params.cashierId && params.cashierId !== 'all')
    query.set('cashierId', params.cashierId)
  if (params.paymentMethod && params.paymentMethod !== 'all')
    query.set('paymentMethod', params.paymentMethod)
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)
  return query
}

async function parseResponseText(res: Response) {
  const text = await res.text()
  if (!text || text.trim() === '') {
    throw new Error(
      'Server returned an empty response. Please check if the API is running correctly.'
    )
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(
      'Server returned invalid data. Please try again or contact support if the issue persists.'
    )
  }
}

async function handleErrorResponse(res: Response, defaultMessage: string) {
  const text = await res.text()
  let errorMessage = defaultMessage
  try {
    const error = JSON.parse(text)
    errorMessage = error.message || errorMessage
  } catch {
    errorMessage = text || errorMessage
  }
  throw new Error(errorMessage)
}

async function fetchSalesData(params: UseSalesParams = {}) {
  const query = buildSalesQueryParams(params)
  const res = await fetch(`/api/sales?${query.toString()}`)

  if (!res.ok) {
    await handleErrorResponse(res, 'Failed to fetch sales')
  }

  return parseResponseText(res) as Promise<SaleQueryResult>
}

export function useSales(params: UseSalesParams = {}) {
  return usePaginatedQuery<SaleQueryResult>({
    queryKey: queryKeys.sales.list(params),
    queryFn: () => fetchSalesData(params),
    ...dataTypeCache.sales, // Use centralized cache config
  })
}

async function createSale(saleData: {
  cashierId: string
  items: SaleItem[]
  totalAmount: number
  paymentMode: PaymentMode
}) {
  const res = await fetch('/api/sales', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(saleData),
  })

  if (!res.ok) {
    await handleErrorResponse(res, 'Failed to record sale')
  }

  return parseResponseText(res)
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  const invalidator = useQueryInvalidator()

  return useMutation({
    mutationFn: createSale,
    onMutate: async newSale => {
      // Optimistic update: add the sale immediately to the UI
      optimisticUpdates.addSale(queryClient, {
        ...newSale,
        id: `temp-${Date.now()}`, // Temporary ID
        createdAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      // Use centralized invalidation pattern
      invalidator.invalidateAfterSaleChange()
    },
    onError: () => {
      // If mutation fails, invalidate to revert optimistic updates
      invalidator.invalidateAfterSaleChange()
    },
  })
}
