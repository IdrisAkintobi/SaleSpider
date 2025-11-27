import { handleException, jsonError, jsonOk } from '@/lib/api-response'
import { reserveInventory } from '@/lib/inventory'
import { createChildLogger } from '@/lib/logger'
import { createSaleSchema } from '@/lib/validation-schemas'
import { calculateSaleTotals } from '@/lib/vat'
import { PaymentMode, Role } from '@prisma/client'
import { endOfDay, startOfDay } from 'date-fns'
import { NextRequest } from 'next/server'

import { prisma } from '@/lib/prisma'
const logger = createChildLogger('sales-api')

// Helper function to map payment mode string to enum
function mapPaymentMode(paymentModeString: string): PaymentMode {
  const mapping: Record<string, PaymentMode> = {
    Cash: PaymentMode.CASH,
    Card: PaymentMode.CARD,
    'Bank Transfer': PaymentMode.BANK_TRANSFER,
    Crypto: PaymentMode.CRYPTO,
    Other: PaymentMode.OTHER,
  }

  return mapping[paymentModeString] || PaymentMode.CASH
}

// Helper to build order by clause
function buildOrderBy(sort: string, order: 'asc' | 'desc') {
  if (sort === 'cashierName') {
    return { cashier: { name: order } }
  }
  if (sort === 'totalAmount') {
    return { totalAmount: order }
  }
  if (sort === 'paymentMode') {
    return { paymentMode: order }
  }
  return { createdAt: order }
}

// Helper to build base where clause with filters
function buildBaseWhereClause(
  userRole: Role,
  userId: string,
  cashierId: string | null,
  paymentMethod: string | null,
  from: string | null,
  to: string | null
) {
  const where: any = { deletedAt: null }

  // Cashiers can only see their own sales
  if (userRole === Role.CASHIER) {
    where.cashierId = userId
  }

  // Manager filter by cashier
  if (cashierId && cashierId !== 'all') {
    where.cashierId = cashierId
  }

  // Payment method filter
  if (paymentMethod && paymentMethod !== 'all') {
    where.paymentMode = paymentMethod as PaymentMode
  }

  // Date range filter with proper time boundaries
  if (from && to) {
    where.createdAt = {
      gte: startOfDay(new Date(from)),
      lte: endOfDay(new Date(to)),
    }
  } else if (from) {
    where.createdAt = { gte: startOfDay(new Date(from)) }
  } else if (to) {
    where.createdAt = { lte: endOfDay(new Date(to)) }
  }

  return where
}

// Helper to get payment mode matches from search term
function getPaymentModeMatches(searchLower: string): PaymentMode[] {
  const labelToEnum: Array<{ label: string; value: PaymentMode }> = [
    { label: 'cash', value: PaymentMode.CASH },
    { label: 'card', value: PaymentMode.CARD },
    { label: 'bank transfer', value: PaymentMode.BANK_TRANSFER },
    { label: 'crypto', value: PaymentMode.CRYPTO },
    { label: 'other', value: PaymentMode.OTHER },
  ]

  return labelToEnum
    .filter(entry => entry.label.includes(searchLower))
    .map(entry => entry.value)
}

// Helper to add search filter to where clause
function addSearchFilter(where: any, search: string) {
  const searchLower = search.toLowerCase()
  const paymentModeMatches = getPaymentModeMatches(searchLower)

  where.OR = [
    { id: search }, // Exact match for sale ID
    { cashier: { name: { contains: search, mode: 'insensitive' } } },
    { cashier: { username: { contains: search, mode: 'insensitive' } } },
    {
      items: {
        some: { product: { name: { contains: search, mode: 'insensitive' } } },
      },
    },
  ]

  if (paymentModeMatches.length > 0) {
    where.OR.push({ paymentMode: { in: paymentModeMatches } })
  }

  return where
}

// Function to get sales
export async function GET(req: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get('X-User-Id')

  if (!userId) {
    return jsonError('Unauthorized', 401, { code: 'UNAUTHORIZED' })
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return jsonError('Unauthorized', 401, { code: 'UNAUTHORIZED' })
  }

  // Parse query params
  const { searchParams } = new URL(req.url)
  const page = Number.parseInt(searchParams.get('page') || '1', 10)
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '20', 10)
  const sort = searchParams.get('sort') || 'createdAt'
  const order =
    (searchParams.get('order') || 'desc').toLowerCase() === 'asc'
      ? 'asc'
      : 'desc'
  const cashierId = searchParams.get('cashierId')
  const paymentMethod = searchParams.get('paymentMethod')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const search = (searchParams.get('search') || '').trim()

  // Build order by clause
  const orderBy = buildOrderBy(sort, order)

  try {
    // Build where clause with filters
    let where = buildBaseWhereClause(
      user.role,
      userId,
      cashierId,
      paymentMethod,
      from,
      to
    )

    // Apply search filter if provided
    if (search) {
      where = addSearchFilter(where, search)
    }

    // Get total count for pagination
    const total = await prisma.sale.count({ where })

    // Get total sales value for all filtered sales
    const totalSalesValueAgg = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where,
    })
    const totalSalesValue = Number(totalSalesValueAgg._sum.totalAmount || 0)

    // Aggregate total sales by payment method
    const paymentMethodTotalsRaw = await prisma.sale.groupBy({
      by: ['paymentMode'],
      _sum: { totalAmount: true },
      where,
    })
    // Convert to object: { Cash: 1000, Card: 500, ... }
    const paymentMethodTotals = paymentMethodTotalsRaw.reduce(
      (acc, row) => {
        acc[row.paymentMode] = Number(row._sum.totalAmount || 0)
        return acc
      },
      {} as Record<PaymentMode, number>
    )

    // Fetch paginated, sorted sales
    const sales = await prisma.sale.findMany({
      where,
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    // Transform the data to match frontend expectations
    const transformedSales = sales.map((sale: any) => ({
      id: sale.id,
      cashierId: sale.cashierId,
      cashierName: sale.cashier.name,
      subtotal: sale.subtotal,
      vatAmount: sale.vatAmount,
      vatPercentage: sale.vatPercentage,
      totalAmount: sale.totalAmount,
      paymentMode: sale.paymentMode,
      timestamp: new Date(sale.createdAt).getTime(), // Convert to timestamp
      items: sale.items.map((item: any) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }))

    return jsonOk({
      data: transformedSales,
      total,
      paymentMethodTotals,
      totalSalesValue,
    })
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to fetch sales'
    )
    return handleException(error, 'Failed to fetch sales', 500)
  }
}

// Helper to handle insufficient stock errors
function handleInsufficientStockError(error: any) {
  const insufficientStock = error.insufficientStock
  return jsonError('Insufficient inventory for one or more products', 409, {
    code: 'INSUFFICIENT_STOCK',
    details: {
      products: insufficientStock,
    },
  })
}

// Helper to handle Prisma constraint violations
function handleConstraintViolation(error: any) {
  const meta = error.meta
  if (meta?.constraint_name === 'Product_quantity_non_negative') {
    logger.error(
      {
        constraint: meta.constraint_name,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Database constraint violation: negative inventory prevented'
    )

    return jsonError('Insufficient inventory for one or more products', 409, {
      code: 'INSUFFICIENT_STOCK',
      details: {
        message: 'The requested quantity would result in negative inventory',
      },
    })
  }
  return null
}

// Helper to verify user authorization for sales
async function verifyUserAuthorization(userId: string | null) {
  if (!userId) {
    return { error: jsonError('Unauthorized', 401, { code: 'UNAUTHORIZED' }) }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return { error: jsonError('Unauthorized', 401, { code: 'UNAUTHORIZED' }) }
  }

  if (![Role.CASHIER, Role.MANAGER, Role.SUPER_ADMIN].includes(user.role)) {
    return {
      error: jsonError(
        'Only cashiers, managers, and super admins can record sales',
        403,
        { code: 'FORBIDDEN' }
      ),
    }
  }

  return { user }
}

// Helper to process sale transaction
async function processSaleTransaction(
  items: any[],
  cashierId: string,
  saleTotals: any,
  mappedPaymentMode: PaymentMode
) {
  return await prisma.$transaction(async tx => {
    // Reserve inventory with row-level locking
    const reservationResult = await reserveInventory(
      tx,
      items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    )

    // If reservation failed due to insufficient stock, return error details
    if (!reservationResult.success) {
      logger.warn(
        {
          insufficientStock: reservationResult.insufficientStock,
          cashierId,
        },
        'Sale failed due to insufficient stock'
      )

      // Throw error to rollback transaction
      const error = new Error('INSUFFICIENT_STOCK')
      ;(error as any).insufficientStock = reservationResult.insufficientStock
      throw error
    }

    // Create the sale
    const sale = await tx.sale.create({
      data: {
        cashierId,
        subtotal: saleTotals.subtotal,
        vatAmount: saleTotals.vatAmount,
        vatPercentage: saleTotals.vatPercentage,
        totalAmount: saleTotals.totalAmount,
        paymentMode: mappedPaymentMode,
      },
    })

    // Create sale items
    await Promise.all(
      items.map(item =>
        tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        })
      )
    )

    return sale
  })
}

// Function to record a sale
export async function POST(req: NextRequest) {
  const userId = req.headers.get('X-User-Id')

  const authResult = await verifyUserAuthorization(userId)
  if (authResult.error) {
    return authResult.error
  }

  try {
    const body = await req.json()

    // Add cashierId to body for validation
    const saleData = { ...body, cashierId: userId }

    // Validate input with Zod
    const validation = createSaleSchema.safeParse(saleData)
    if (!validation.success) {
      return jsonError(validation.error.errors[0].message, 400, {
        code: 'VALIDATION_ERROR',
        details: validation.error.errors,
      })
    }

    const { items, paymentMode, cashierId } = validation.data

    // Calculate subtotal from items
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Calculate VAT totals
    const saleTotals = calculateSaleTotals(subtotal)

    // Map payment mode to enum
    const mappedPaymentMode = mapPaymentMode(paymentMode)

    // Create the sale and update stock in a transaction
    const result = await processSaleTransaction(
      items,
      cashierId,
      saleTotals,
      mappedPaymentMode
    )

    logger.info(
      {
        saleId: result.id,
        cashierId,
        totalAmount: saleTotals.totalAmount,
        itemCount: items.length,
        paymentMode: mappedPaymentMode,
      },
      'Sale recorded successfully'
    )

    return jsonOk({
      id: result.id,
      message: 'Sale recorded successfully',
    })
  } catch (error) {
    // Handle insufficient stock error
    if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
      return handleInsufficientStockError(error)
    }

    // Handle Prisma constraint violation errors (P2034)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2034'
    ) {
      const constraintError = handleConstraintViolation(error)
      if (constraintError) return constraintError
    }

    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to record sale'
    )
    return handleException(error, 'Failed to record sale', 500)
  }
}
