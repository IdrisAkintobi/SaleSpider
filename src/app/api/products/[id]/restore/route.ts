import { SoftDeleteService } from "@/lib/soft-delete";
import { logger } from "@/lib/logger";
import { jsonOk, jsonError, handleException } from "@/lib/api-response";
import { getProductBasic } from "@/lib/products";
import { requireSuperAdmin } from "@/lib/api-middleware";

import { prisma } from "@/lib/prisma";

// Function to restore a soft deleted product (Super Admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate super admin access
  const { error, userId, user } = await requireSuperAdmin(request);
  if (error) return error;

  try {
    // Check if product exists and is deleted
    const product = await getProductBasic(prisma, id);

    if (!product) {
      return jsonError("Product not found", 404, { code: "NOT_FOUND" });
    }

    if (!product.deletedAt) {
      return jsonError("Product is not deleted", 400, { code: "BAD_REQUEST" });
    }

    // Restore the product
    await SoftDeleteService.restoreProduct(id, userId);

    logger.info(
      {
        productId: id,
        productName: product.name,
        userId,
        userRole: user.role,
      },
      "Product restored by super admin"
    );

    return jsonOk({
      message: "Product restored successfully",
      productId: id,
    });
  } catch (error) {
    return handleException(error, "Failed to restore product", 500);
  }
}
