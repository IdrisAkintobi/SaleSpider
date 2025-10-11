import { Product } from '@/lib/types'
import { Prisma, ProductCategory, Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { createChildLogger } from '@/lib/logger'
import { AuditTrailService } from '@/lib/audit-trail'
import { jsonOk, jsonError, handleException } from '@/lib/api-response'

const logger = createChildLogger('api:products')

// Function to get products
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10)
  const pageSize = Number.parseInt(url.searchParams.get('pageSize') ?? '10', 10)
  const searchQuery = url.searchParams.get('search') ?? ''
  const sortField = url.searchParams.get('sortField') ?? 'createdAt'
  const sortOrder = url.searchParams.get('sortOrder') ?? 'desc'

  if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
    return jsonError('Invalid pagination parameters', 400, {
      code: 'BAD_REQUEST',
    })
  }

  const skip = (page - 1) * pageSize

  // Get user info to check role and settings
  const userId = req.headers.get('X-User-Id')
  let includeDeleted = false

  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (user?.role === Role.SUPER_ADMIN) {
        // Get app settings to check if deleted products should be shown
        const settings = await prisma.appSettings.findFirst()
        includeDeleted = settings?.showDeletedProducts ?? false
      }
    } catch (error) {
      logger.warn(
        {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to check user role or settings'
      )
    }
  }

  try {
    const orderBy = {
      [sortField]: sortOrder === 'asc' ? 'asc' : 'desc',
    }

    const products = await prisma.product.findMany({
      skip,
      take: pageSize,
      where: productSearchWhere(
        searchQuery,
        includeDeleted
      ) as Prisma.ProductWhereInput,
      orderBy: orderBy,
    })

    const totalProducts = await prisma.product.count({
      where: productSearchWhere(
        searchQuery,
        includeDeleted
      ) as Prisma.ProductWhereInput,
    })

    return jsonOk({
      products,
      totalCount: totalProducts,
      page,
      pageSize,
      totalPages: Math.ceil(totalProducts / pageSize),
    })
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to fetch products'
    )
    return handleException(error, 'Failed to fetch products', 500)
  }
}

// Function to create a product
export async function POST(req: NextRequest) {
  // Read the custom user ID header set by the middleware
  const userId = req.headers.get('X-User-Id')

  if (!userId) {
    // fallback safety check.
    return jsonError('Unauthorized', 401, { code: 'UNAUTHORIZED' })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || user.role === Role.CASHIER) {
    return jsonError('Forbidden', 403, { code: 'FORBIDDEN' })
  }

  try {
    const {
      name,
      description,
      price,
      category,
      lowStockMargin,
      quantity,
      imageUrl,
      gtin,
    } = (await req.json()) as Product

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !lowStockMargin ||
      !quantity
    ) {
      return jsonError('Missing required fields', 400, { code: 'BAD_REQUEST' })
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        lowStockMargin,
        quantity,
        imageUrl,
        gtin,
      },
    })

    // Log audit trail for product creation
    await AuditTrailService.logProductChange(
      'CREATE',
      newProduct.id,
      undefined,
      {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        category: newProduct.category,
        lowStockMargin: newProduct.lowStockMargin,
        quantity: newProduct.quantity,
        imageUrl: newProduct.imageUrl,
        gtin: newProduct.gtin,
      },
      userId,
      user.email,
      {
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        userAgent: req.headers.get('user-agent'),
      }
    )

    logger.info(
      {
        productId: newProduct.id,
        name: newProduct.name,
        userId,
      },
      'Product created successfully'
    )

    return jsonOk(newProduct, { status: 201 })
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to create product'
    )
    return handleException(error, 'Failed to create product', 500)
  }
}

// Function to get enum values that contain the search term
const matchingCategories = (searchQuery?: string) => {
  return searchQuery
    ? Object.values(ProductCategory).filter(cat =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []
}

// Function to search for products
function productSearchWhere(
  searchQuery?: string,
  includeDeleted: boolean = false
) {
  const matchCategories = matchingCategories(searchQuery)
  const deletedAtCondition = includeDeleted ? {} : { deletedAt: null }

  return searchQuery
    ? {
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          ...(matchCategories.length > 0
            ? [
                {
                  category: {
                    in: matchCategories,
                  },
                },
              ]
            : []),
        ],
        ...deletedAtCondition,
      }
    : deletedAtCondition
}
