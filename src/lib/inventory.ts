import { Prisma } from "@prisma/client";

/**
 * Represents an item to reserve from inventory
 */
export interface ReservationItem {
  productId: string;
  quantity: number;
}

/**
 * Represents a product with insufficient stock
 */
export interface InsufficientStockProduct {
  productId: string;
  productName: string;
  requested: number;
  available: number;
}

/**
 * Result of a reservation attempt
 */
export interface ReservationResult {
  success: boolean;
  insufficientStock?: InsufficientStockProduct[];
}

/**
 * Type for Prisma transaction client
 */
export type PrismaTransaction = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Reserves inventory for a sale transaction with row-level locking.
 *
 * This function:
 * 1. Locks product rows using SELECT ... FOR UPDATE to prevent concurrent modifications
 * 2. Validates that sufficient quantities are available
 * 3. Decrements inventory atomically within the transaction
 * 4. Returns detailed error information if any products have insufficient stock
 *
 * @param tx - Prisma transaction client
 * @param items - Array of items to reserve with productId and quantity
 * @returns ReservationResult indicating success or listing products with insufficient stock
 *
 * @example
 * ```typescript
 * const result = await prisma.$transaction(async (tx) => {
 *   return await reserveInventory(tx, [
 *     { productId: 'prod_123', quantity: 5 },
 *     { productId: 'prod_456', quantity: 2 }
 *   ]);
 * });
 *
 * if (!result.success) {
 *   console.error('Insufficient stock:', result.insufficientStock);
 * }
 * ```
 */
export async function reserveInventory(
  tx: PrismaTransaction,
  items: ReservationItem[]
): Promise<ReservationResult> {
  const insufficientStock: InsufficientStockProduct[] = [];

  // Extract all product IDs
  const productIds = items.map(item => item.productId);

  // Lock all product rows in a single query using FOR UPDATE
  // This prevents other transactions from modifying these products until we commit
  // Using Prisma.join to safely handle the array of IDs
  const products = await tx.$queryRaw<
    Array<{ id: string; name: string; quantity: number }>
  >`
    SELECT id, name, quantity
    FROM "Product"
    WHERE id = ANY(${productIds}::text[])
    FOR UPDATE
  `;

  // Create a map for quick lookup
  const productMap = new Map(products.map(p => [p.id, p]));

  // Validate all products exist and have sufficient quantity
  for (const item of items) {
    const product = productMap.get(item.productId);

    // Sanity check: Check if product exists
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    // Validate available quantity
    if (product.quantity < item.quantity) {
      insufficientStock.push({
        productId: product.id,
        productName: product.name,
        requested: item.quantity,
        available: product.quantity,
      });
    }
  }

  // If any products had insufficient stock, return failure without updating
  if (insufficientStock.length > 0) {
    return {
      success: false,
      insufficientStock,
    };
  }

  // All validations passed - decrement inventory for all products
  await Promise.all(
    items.map(item =>
      tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      })
    )
  );

  return {
    success: true,
  };
}
