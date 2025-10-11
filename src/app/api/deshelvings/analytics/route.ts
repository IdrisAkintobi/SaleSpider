import { NextRequest } from 'next/server'
import { DeshelvingService } from '@/lib/deshelving-service'
import { jsonOk, jsonError, handleException } from '@/lib/api-response'
import { getUserFromHeader } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { createChildLogger } from '@/lib/logger'

const logger = createChildLogger('api:deshelvings:analytics')

// Get deshelving analytics for reporting and AI insights
export async function GET(request: NextRequest) {
  try {
    // Get user from header and validate permissions
    const { userId, user } = await getUserFromHeader(request, prisma)

    if (!user || (user.role !== 'MANAGER' && user.role !== 'SUPER_ADMIN')) {
      logger.warn({ userId }, 'Unauthorized access to deshelving analytics')
      return jsonError(
        'Forbidden. Only managers can view deshelving analytics.',
        403,
        {
          code: 'INSUFFICIENT_PERMISSIONS',
        }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const daysBack = Math.min(
      Number.parseInt(url.searchParams.get('daysBack') || '30'),
      365
    ) // Max 1 year

    // Get deshelving analytics
    const analytics = await DeshelvingService.getDeshelvingAnalytics(daysBack)

    // Get available reasons for UI
    const availableReasons = DeshelvingService.getDeshelvingReasons()

    logger.info(
      {
        userId,
        userEmail: user.email,
        daysBack,
        totalQuantityDeshelved: analytics.totalQuantityDeshelved,
        totalValueLost: analytics.totalValueLost,
      },
      'Deshelving analytics retrieved'
    )

    return jsonOk({
      analytics,
      availableReasons,
      metadata: {
        daysBack,
        generatedAt: new Date().toISOString(),
        dataRange: {
          startDate: new Date(
            Date.now() - daysBack * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: new Date().toISOString(),
        },
      },
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to get deshelving analytics'
    )

    return handleException(error, 'Failed to get deshelving analytics', 500)
  }
}
