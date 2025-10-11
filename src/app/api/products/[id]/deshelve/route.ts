import { NextRequest } from 'next/server'
import { DeshelvingReason } from '@prisma/client'
import { DeshelvingService } from '@/lib/deshelving-service'
import { jsonOk, jsonError, handleException } from '@/lib/api-response'
import { getUserFromHeader } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { createChildLogger } from '@/lib/logger'

const logger = createChildLogger('api:products:deshelve')

// Deshelve product (reduce inventory with reason)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params

  try {
    // Get user from header and validate permissions
    const { userId, user } = await getUserFromHeader(request, prisma)

    if (
      !userId ||
      !user ||
      (user.role !== 'MANAGER' && user.role !== 'SUPER_ADMIN')
    ) {
      logger.warn({ userId, productId }, 'Unauthorized deshelving attempt')
      return jsonError('Forbidden. Only managers can deshelve products.', 403, {
        code: 'INSUFFICIENT_PERMISSIONS',
      })
    }

    // Parse request body
    const body = await request.json()
    const { quantity, reason, description } = body

    // Validate input
    if (!quantity || quantity <= 0) {
      return jsonError('Quantity must be a positive number', 400, {
        code: 'INVALID_QUANTITY',
      })
    }

    if (!reason || !Object.values(DeshelvingReason).includes(reason)) {
      return jsonError('Valid deshelving reason is required', 400, {
        code: 'INVALID_REASON',
      })
    }

    // Get client metadata
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Perform deshelving
    const result = await DeshelvingService.deshelveProduct(
      {
        productId,
        quantity: Number.parseInt(quantity),
        reason,
        description,
      },
      userId,
      { ip, userAgent }
    )

    if (!result.success) {
      return jsonError(result.error || 'Failed to deshelve product', 400, {
        code: 'DESHELVING_FAILED',
      })
    }

    logger.info(
      {
        userId,
        userEmail: user.email,
        productId,
        deshelvingId: result.deshelving?.id,
        quantity,
        reason,
        description,
      },
      'Product deshelved successfully'
    )

    return jsonOk({
      message: 'Product deshelved successfully',
      deshelving: {
        id: result.deshelving.id,
        productId: result.deshelving.productId,
        productName: result.deshelving.product.name,
        quantity: result.deshelving.quantity,
        reason: result.deshelving.reason,
        description: result.deshelving.description,
        manager: {
          id: result.deshelving.managerId,
          name: result.deshelving.manager.name,
          email: result.deshelving.manager.email,
        },
        createdAt: result.deshelving.createdAt,
      },
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        productId,
      },
      'Failed to deshelve product'
    )

    return handleException(error, 'Failed to deshelve product', 500)
  }
}
