import { NextRequest } from 'next/server'
import { Role } from '@prisma/client'
import { createChildLogger } from '@/lib/logger'
import { jsonOk, jsonError, handleException } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'

const logger = createChildLogger('api:audit-logs')

export async function GET(req: NextRequest) {
  const startTime = Date.now()

  // Get user info from middleware
  const userId = req.headers.get('X-User-Id')

  if (!userId) {
    return jsonError('Unauthorized', 401, { code: 'UNAUTHORIZED' })
  }

  try {
    // Verify user has manager or super admin role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    })

    if (!user || user.role === Role.CASHIER) {
      logger.warn({ userId }, 'Unauthorized access to audit logs')
      return jsonError('Forbidden', 403, { code: 'FORBIDDEN' })
    }

    // Get query parameters
    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10)
    const limit = Math.min(
      Number.parseInt(url.searchParams.get('limit') ?? '50', 10),
      100
    )
    const entityType = url.searchParams.get('entityType')
    const action = url.searchParams.get('action')
    const userEmail = url.searchParams.get('userEmail')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (entityType) {
      where.entityType = entityType
    }

    if (action) {
      where.action = action
    }

    if (userEmail) {
      where.userEmail = {
        contains: userEmail,
        mode: 'insensitive',
      }
    }

    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) {
        where.timestamp.gte = new Date(startDate)
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate)
      }
    }

    logger.info(
      {
        userId,
        userEmail: user.email,
        page,
        limit,
        filters: { entityType, action, userEmail, startDate, endDate },
      },
      'Fetching audit logs'
    )

    // Get audit logs with pagination
    const [auditLogs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: {
          timestamp: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    const response = {
      auditLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }

    const duration = Date.now() - startTime
    logger.info(
      {
        userId,
        userEmail: user.email,
        duration: `${duration}ms`,
        resultCount: auditLogs.length,
        totalCount,
      },
      'Audit logs fetched successfully'
    )

    return jsonOk(response)
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      { userId, duration: `${duration}ms` },
      'Failed to fetch audit logs'
    )
    return handleException(error, 'Failed to fetch audit logs', 500)
  }
}
