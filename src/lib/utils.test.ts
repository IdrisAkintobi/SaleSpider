import { describe, it, expect, vi } from 'vitest'
import { cn, isCashier, isManager, getMonthlySales } from './utils'
import { User } from './types'

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
    })

    it('handles conditional classes', () => {
      expect(cn('px-2', false && 'py-1', 'py-2')).toBe('px-2 py-2')
    })

    it('merges conflicting Tailwind classes', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })
  })

  describe('isCashier', () => {
    it('returns true for CASHIER role', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CASHIER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }
      expect(isCashier(user)).toBe(true)
    })

    it('returns false for MANAGER role', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'MANAGER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }
      expect(isCashier(user)).toBe(false)
    })

    it('returns false for null user', () => {
      expect(isCashier(null)).toBe(false)
    })
  })

  describe('isManager', () => {
    it('returns true for MANAGER role', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'MANAGER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }
      expect(isManager(user)).toBe(true)
    })

    it('returns true for SUPER_ADMIN role', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }
      expect(isManager(user)).toBe(true)
    })

    it('returns false for CASHIER role', () => {
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CASHIER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }
      expect(isManager(user)).toBe(false)
    })

    it('returns false for null user', () => {
      expect(isManager(null)).toBe(false)
    })
  })

  describe('getMonthlySales', () => {
    const mockPrisma = {
      sale: {
        aggregate: vi.fn(),
      },
    }

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('generates default 6 months when no range provided', async () => {
      mockPrisma.sale.aggregate.mockResolvedValue({
        _sum: { totalAmount: 1000 },
      })

      const result = await getMonthlySales(mockPrisma)

      expect(result).toHaveLength(6)
      expect(mockPrisma.sale.aggregate).toHaveBeenCalledTimes(6)
      expect(result[0]).toHaveProperty('month')
      expect(result[0]).toHaveProperty('sales', 1000)
    })

    it('generates months for custom range', async () => {
      mockPrisma.sale.aggregate.mockResolvedValue({
        _sum: { totalAmount: 500 },
      })

      const from = new Date(2024, 0, 1) // January 2024
      const to = new Date(2024, 2, 1)   // March 2024

      const result = await getMonthlySales(mockPrisma, from, to)

      expect(result).toHaveLength(3) // Jan, Feb, Mar
      expect(result[0].month).toBe('2024-01')
      expect(result[1].month).toBe('2024-02')
      expect(result[2].month).toBe('2024-03')
    })

    it('handles null sales data', async () => {
      mockPrisma.sale.aggregate.mockResolvedValue({
        _sum: { totalAmount: null },
      })

      const result = await getMonthlySales(mockPrisma)

      expect(result[0].sales).toBe(0)
    })
  })
})