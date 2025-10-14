import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useSales, useCreateSale, type UseSalesParams } from './use-sales'
import { Sale, PaymentMode } from '@/lib/types'

// Mock fetch globally
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// Mock query invalidation
vi.mock('@/lib/query-invalidation', () => ({
  useQueryInvalidator: () => ({
    invalidateAfterSaleChange: vi.fn(),
  }),
  optimisticUpdates: {
    addSale: vi.fn(),
  },
}))

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children
  )
}

const mockSales: Sale[] = [
  {
    id: '1',
    totalAmount: 100.5,
    paymentMode: 'CASH' as PaymentMode,
    cashierId: 'cashier1',
    cashierName: 'John Doe',
    subtotal: 90.5,
    vatAmount: 10,
    vatPercentage: 11,
    timestamp: Date.now(),
    items: [
      {
        productId: 'product1',
        productName: 'Test Product',
        price: 50.25,
        quantity: 2,
      },
    ],
  },
]

const mockSalesResponse = {
  data: mockSales,
  total: 1,
  paymentMethodTotals: { CASH: 100.5 },
  totalSalesValue: 100.5,
}

describe('useSales', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches sales data successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSalesResponse,
    })

    const { result } = renderHook(() => useSales(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockSalesResponse)
    expect(mockFetch).toHaveBeenCalledWith('/api/sales?')
  })

  it('builds correct query parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSalesResponse,
    })

    const params: UseSalesParams = {
      page: 2,
      pageSize: 10,
      sort: 'createdAt',
      order: 'desc',
      searchTerm: 'test',
      cashierId: 'cashier1',
      paymentMethod: 'CASH',
      from: '2024-01-01',
      to: '2024-01-31',
    }

    renderHook(() => useSales(params), { wrapper })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/sales?page=2&pageSize=10&sort=createdAt&order=desc&search=test&cashierId=cashier1&paymentMethod=CASH&from=2024-01-01&to=2024-01-31'
      )
    })
  })

  it('excludes "all" values from query parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSalesResponse,
    })

    const params: UseSalesParams = {
      cashierId: 'all',
      paymentMethod: 'all',
    }

    renderHook(() => useSales(params), { wrapper })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/sales?')
    })
  })

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch sales'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    })

    const { result } = renderHook(() => useSales(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect((result.current.error as Error)?.message).toBe(errorMessage)
  })

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useSales(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeInstanceOf(Error)
  })
})

describe('useCreateSale', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates sale successfully', async () => {
    const newSale = {
      id: '2',
      totalAmount: 75.25,
      paymentMode: 'CARD' as PaymentMode,
      cashierId: 'cashier1',
      items: [
        {
          id: '2',
          productId: 'product2',
          productName: 'Another Product',
          price: 75.25,
          quantity: 1,
          saleId: '2',
        },
      ],
      createdAt: new Date().toISOString(),
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newSale,
    })

    const { result } = renderHook(() => useCreateSale(), { wrapper })

    const saleData = {
      cashierId: 'cashier1',
      items: [
        {
          id: '2',
          productId: 'product2',
          productName: 'Another Product',
          price: 75.25,
          quantity: 1,
          saleId: '2',
        },
      ],
      totalAmount: 75.25,
      paymentMode: 'CARD' as PaymentMode,
    }

    result.current.mutate(saleData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
    })
  })

  it('handles create sale error', async () => {
    const errorMessage = 'Failed to record sale'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    })

    const { result } = renderHook(() => useCreateSale(), { wrapper })

    const saleData = {
      cashierId: 'cashier1',
      items: [],
      totalAmount: 0,
      paymentMode: 'CASH' as PaymentMode,
    }

    result.current.mutate(saleData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect((result.current.error as Error)?.message).toBe(errorMessage)
  })

  it('handles network error during create', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCreateSale(), { wrapper })

    const saleData = {
      cashierId: 'cashier1',
      items: [],
      totalAmount: 0,
      paymentMode: 'CASH' as PaymentMode,
    }

    result.current.mutate(saleData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('validates required sale data fields', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'sale1', message: 'Sale created successfully' }),
    })

    const { result } = renderHook(() => useCreateSale(), { wrapper })

    const saleData = {
      cashierId: 'cashier1',
      items: [
        {
          productId: 'product1',
          productName: 'Test Product',
          price: 50.25,
          quantity: 2,
        },
      ],
      totalAmount: 100.5,
      paymentMode: 'CASH' as PaymentMode,
    }

    result.current.mutate(saleData)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      })
    })
  })
})
