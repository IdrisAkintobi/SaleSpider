import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuditTrailService, type AuditLogData } from './audit-trail'

// Mock Prisma - use factory function to avoid hoisting issues
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
    },
  },
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  createChildLogger: () => ({
    error: vi.fn(),
  }),
}))

describe('AuditTrailService', () => {
  let mockPrismaCreate: any

  beforeEach(async () => {
    vi.clearAllMocks()
    // Get the mocked prisma
    const { prisma } = await import('@/lib/prisma')
    mockPrismaCreate = prisma.auditLog.create
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('log', () => {
    it('creates audit log entry successfully', async () => {
      mockPrismaCreate.mockResolvedValueOnce({})

      const auditData: AuditLogData = {
        entityType: 'USER',
        entityId: 'user123',
        action: 'CREATE',
        changes: { name: 'New Name' },
        oldValues: {},
        newValues: { name: 'New Name', email: 'test@example.com' },
        userId: 'actor123',
        userEmail: 'actor@example.com',
        metadata: { source: 'admin_panel' },
      }

      await AuditTrailService.log(auditData)

      expect(mockPrismaCreate).toHaveBeenCalledWith({
        data: {
          entityType: 'USER',
          entityId: 'user123',
          action: 'CREATE',
          changes: { name: 'New Name' },
          oldValues: {},
          newValues: { name: 'New Name', email: 'test@example.com' },
          userId: 'actor123',
          userEmail: 'actor@example.com',
          metadata: { source: 'admin_panel' },
        },
      })
    })

    it('handles undefined optional fields correctly', async () => {
      mockPrismaCreate.mockResolvedValueOnce({})

      const auditData: AuditLogData = {
        entityType: 'PRODUCT',
        entityId: 'product123',
        action: 'DELETE',
        userId: 'actor123',
        userEmail: 'actor@example.com',
      }

      await AuditTrailService.log(auditData)

      expect(mockPrismaCreate).toHaveBeenCalledWith({
        data: {
          entityType: 'PRODUCT',
          entityId: 'product123',
          action: 'DELETE',
          changes: undefined,
          oldValues: undefined,
          newValues: undefined,
          userId: 'actor123',
          userEmail: 'actor@example.com',
          metadata: undefined,
        },
      })
    })

    it('handles database errors gracefully', async () => {
      const dbError = new Error('Database connection failed')
      mockPrismaCreate.mockRejectedValueOnce(dbError)

      const auditData: AuditLogData = {
        entityType: 'USER',
        entityId: 'user123',
        action: 'UPDATE',
        userId: 'actor123',
        userEmail: 'actor@example.com',
      }

      // Should not throw error
      await expect(AuditTrailService.log(auditData)).resolves.toBeUndefined()
    })

    it('handles all entity types', async () => {
      mockPrismaCreate.mockResolvedValue({})

      const entityTypes = ['USER', 'PRODUCT', 'DESHELVING'] as const

      for (const entityType of entityTypes) {
        await AuditTrailService.log({
          entityType,
          entityId: 'test123',
          action: 'CREATE',
          userId: 'actor123',
          userEmail: 'actor@example.com',
        })

        expect(mockPrismaCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              entityType,
            }),
          })
        )
      }
    })

    it('handles all action types', async () => {
      mockPrismaCreate.mockResolvedValue({})

      const actions = ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'DESHELVE'] as const

      for (const action of actions) {
        await AuditTrailService.log({
          entityType: 'USER',
          entityId: 'test123',
          action,
          userId: 'actor123',
          userEmail: 'actor@example.com',
        })

        expect(mockPrismaCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              action,
            }),
          })
        )
      }
    })
  })

  describe('logUserChange', () => {
    it('logs user creation', async () => {
      mockPrismaCreate.mockResolvedValueOnce({})

      const newValues = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'CASHIER',
      }

      await AuditTrailService.logUserChange(
        'CREATE',
        'user123',
        undefined,
        newValues,
        'admin123',
        'admin@example.com',
        { source: 'registration' }
      )

      expect(mockPrismaCreate).toHaveBeenCalledWith({
        data: {
          entityType: 'USER',
          entityId: 'user123',
          action: 'CREATE',
          changes: undefined,
          oldValues: undefined,
          newValues,
          userId: 'admin123',
          userEmail: 'admin@example.com',
          metadata: { source: 'registration' },
        },
      })
    })

    it('logs user update with changes', async () => {
      mockPrismaCreate.mockResolvedValueOnce({})

      const oldValues = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'CASHIER',
      }

      const newValues = {
        name: 'John Smith',
        email: 'john@example.com',
        role: 'MANAGER',
      }

      await AuditTrailService.logUserChange(
        'UPDATE',
        'user123',
        oldValues,
        newValues,
        'admin123',
        'admin@example.com'
      )

      expect(mockPrismaCreate).toHaveBeenCalledWith({
        data: {
          entityType: 'USER',
          entityId: 'user123',
          action: 'UPDATE',
          changes: {
            name: {
              from: 'John Doe',
              to: 'John Smith',
            },
            role: {
              from: 'CASHIER',
              to: 'MANAGER',
            },
          },
          oldValues,
          newValues,
          userId: 'admin123',
          userEmail: 'admin@example.com',
          metadata: undefined,
        },
      })
    })

    it('uses default values when actor not provided', async () => {
      mockPrismaCreate.mockResolvedValueOnce({})

      await AuditTrailService.logUserChange(
        'DELETE',
        'user123'
      )

      expect(mockPrismaCreate).toHaveBeenCalledWith({
        data: {
          entityType: 'USER',
          entityId: 'user123',
          action: 'DELETE',
          changes: undefined,
          oldValues: undefined,
          newValues: undefined,
          userId: 'user123', // Defaults to target user
          userEmail: 'system', // Defaults to system
          metadata: undefined,
        },
      })
    })
  })

  describe('logUserUpdate', () => {
    it('logs user update with changed fields only', async () => {
      mockPrismaCreate.mockResolvedValueOnce({})

      const changedFields = {
        name: 'New Name',
        role: 'MANAGER',
      }

      await AuditTrailService.logUserUpdate(
        'user123',
        changedFields,
        'admin123',
        'admin@example.com',
        { reason: 'promotion' }
      )

      expect(mockPrismaCreate).toHaveBeenCalledWith({
        data: {
          entityType: 'USER',
          entityId: 'user123',
          action: 'UPDATE',
          newValues: changedFields,
          userId: 'admin123',
          userEmail: 'admin@example.com',
          metadata: { reason: 'promotion' },
          changes: undefined,
          oldValues: undefined,
        },
      })
    })

    it('handles empty changed fields', async () => {
      mockPrismaCreate.mockResolvedValueOnce({})

      await AuditTrailService.logUserUpdate(
        'user123',
        {},
        'admin123',
        'admin@example.com'
      )

      expect(mockPrismaCreate).toHaveBeenCalledWith({
        data: {
          entityType: 'USER',
          entityId: 'user123',
          action: 'UPDATE',
          newValues: {},
          userId: 'admin123',
          userEmail: 'admin@example.com',
          metadata: undefined,
          changes: undefined,
          oldValues: undefined,
        },
      })
    })
  })
})