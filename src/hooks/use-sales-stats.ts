import { useQuery } from '@tanstack/react-query'
import type { DateRange } from 'react-day-picker'

export interface SalesStats {
  totalSales: number
  totalOrders: number
  averageSale: number
  todaySales: number
  weekSales: number
  monthSales: number
}

async function fetchSalesStats(dateRange?: DateRange): Promise<SalesStats> {
  const params = new URLSearchParams()
  if (dateRange?.from) params.set('from', dateRange.from.toISOString())
  if (dateRange?.to) params.set('to', dateRange.to.toISOString())
  const res = await fetch(`/api/sales/stats?${params.toString()}`)
  if (!res.ok) {
    const text = await res.text()
    let errorMessage = 'Failed to fetch sales stats'
    try {
      const error = JSON.parse(text)
      errorMessage = error.message || errorMessage
    } catch {
      errorMessage = text || errorMessage
    }
    throw new Error(errorMessage)
  }

  const text = await res.text()
  if (!text || text.trim() === '') {
    throw new Error(
      'Server returned an empty response. Please check if the API is running correctly.'
    )
  }

  try {
    return JSON.parse(text) as SalesStats
  } catch {
    throw new Error(
      'Server returned invalid data. Please try again or contact support if the issue persists.'
    )
  }
}

export function useSalesStats(dateRange?: DateRange) {
  return useQuery<SalesStats, Error>({
    queryKey: ['sales-stats', dateRange],
    queryFn: () => fetchSalesStats(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
