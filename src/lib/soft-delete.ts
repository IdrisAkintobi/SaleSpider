// Soft delete utilities for products
import { prisma } from "@/lib/prisma";
import { createChildLogger } from "@/lib/logger";
import { AuditTrailService } from "@/lib/audit-trail";

const logger = createChildLogger("soft-delete");

export class SoftDeleteService {
  /**
   * Soft delete a product by setting deletedAt timestamp
   */
  static async deleteProduct(productId: string, userId: string): Promise<void> {
    try {
      // Use a single timestamp for DB update and audit log
      const deletedAt = new Date();

      await prisma.product.update({
        where: { id: productId },
        data: {
          deletedAt,
          updatedAt: deletedAt,
        },
      });

      // Log audit trail
      await AuditTrailService.logProductUpdate(
        productId,
        { deletedAt },
        userId,
        "system",
        {
          action: "soft_delete",
          reason: "Product soft deleted",
        }
      );

      logger.info(
        {
          productId,
          userId,
          action: "soft_delete",
        },
        "Product soft deleted"
      );
    } catch (error) {
      logger.error(
        {
          productId,
          userId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "Failed to soft delete product"
      );
      throw error;
    }
  }

  /**
   * Restore a soft deleted product
   */
  static async restoreProduct(
    productId: string,
    userId: string
  ): Promise<void> {
    try {
      await prisma.product.update({
        where: { id: productId },
        data: {
          deletedAt: null,
          updatedAt: new Date(),
        },
      });

      // Log audit trail
      await AuditTrailService.logProductUpdate(
        productId,
        { deletedAt: null },
        userId,
        "system",
        { action: "restore", reason: "Product restored from soft delete" }
      );

      logger.info(
        {
          productId,
          userId,
          action: "restore",
        },
        "Product restored"
      );
    } catch (error) {
      logger.error(
        {
          productId,
          userId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "Failed to restore product"
      );
      throw error;
    }
  }

  /**
   * Get soft deleted products (for super admin)
   */
  static async getDeletedProducts() {
    return prisma.product.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  }

  /**
   * Check if product is soft deleted
   */
  static async isProductDeleted(productId: string): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { deletedAt: true },
    });

    return product?.deletedAt !== null;
  }
}
