import { PrismaClient, Role } from "@prisma/client";
import type { NextRequest } from "next/server";
import { SoftDeleteService } from "@/lib/soft-delete";
import { logger } from "@/lib/logger";
import { jsonOk, jsonError, handleException } from "@/lib/api-response";

const prisma = new PrismaClient();

// Function to restore a soft deleted product (Super Admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Read the X-User-Id header set by the middleware
  const userId = (request as NextRequest).headers.get("X-User-Id");

  if (!userId) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== Role.SUPER_ADMIN) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  try {
    // Check if product exists and is deleted
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, deletedAt: true }
    });

    if (!product) {
      return jsonError("Product not found", 404, { code: "NOT_FOUND" });
    }

    if (!product.deletedAt) {
      return jsonError("Product is not deleted", 400, { code: "BAD_REQUEST" });
    }

    // Restore the product
    await SoftDeleteService.restoreProduct(id, userId);

    logger.info({ 
      productId: id, 
      productName: product.name,
      userId,
      userRole: user.role
    }, 'Product restored by super admin');

    return jsonOk({ 
      message: "Product restored successfully",
      productId: id 
    });
  } catch (error) {
    return handleException(error, "Failed to restore product", 500);
  }
}
