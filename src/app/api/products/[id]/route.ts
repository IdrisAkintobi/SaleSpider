import { NextRequest } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { createChildLogger } from "@/lib/logger";
import { SoftDeleteService } from "@/lib/soft-delete";
import { AuditTrailService } from "@/lib/audit-trail";
import { jsonOk, jsonError, handleException } from "@/lib/api-response";
import { getUserFromHeader } from "@/lib/api-auth";

const prisma = new PrismaClient();
const logger = createChildLogger('api:products:id');

// Function to get product by ID
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!product) {
      return jsonError("Product not found", 404, { code: "NOT_FOUND" });
    }

    return jsonOk(product);
  } catch (error) {
    return handleException(error, "Failed to fetch product", 500);
  }
}

// Function to update product by ID
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updateData = await request.json();

  // Read user from header and validate role
  const { userId, user } = await getUserFromHeader(request, prisma);
  if (!userId || !user || user.role === Role.CASHIER) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  try {
    // Check if product exists before update
    const productExists = await prisma.product.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!productExists) {
      return jsonError("Product not found", 404, { code: "NOT_FOUND" });
    }

    // Validate quantity if provided
    if (
      updateData.quantity !== undefined &&
      typeof updateData.quantity !== "number"
    ) {
      return jsonError("Invalid quantity provided", 400, { code: "BAD_REQUEST" });
    }

    // Prepare the data for update and audit trail
    const updatePayload: any = { ...updateData };
    const changedFields: Record<string, any> = {};
    
    // Handle quantity increment logic
    if (updateData.quantity !== undefined) {
      updatePayload.quantity = {
        increment: updateData.quantity,
      };
      // For audit trail, we need to track the increment amount
      changedFields.quantity = `+${updateData.quantity}`;
    }
    
    // Track other changed fields for audit trail
    Object.keys(updateData).forEach(key => {
      if (key !== 'quantity') {
        changedFields[key] = updateData[key];
      }
    });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updatePayload,
    });

    // Log audit trail
    await AuditTrailService.logProductUpdate(
      id,
      changedFields,
      userId,
      user.email,
      {
        ip: (request as NextRequest).headers.get('x-forwarded-for') || (request as NextRequest).headers.get('x-real-ip'),
        userAgent: (request as NextRequest).headers.get('user-agent'),
      }
    );

    return jsonOk(updatedProduct);
  } catch (error) {
    return handleException(error, "Failed to update product", 500);
  }
}

// Function to soft delete product by ID (Super Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Read user from header and validate role
  const { userId, user } = await getUserFromHeader(request, prisma);
  if (!userId || !user || user.role !== Role.SUPER_ADMIN) {
    return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  try {
    // Check if product exists and is not already deleted
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, deletedAt: true }
    });

    if (!product) {
      return jsonError("Product not found", 404, { code: "NOT_FOUND" });
    }

    if (product.deletedAt) {
      return jsonError("Product is already deleted", 400, { code: "BAD_REQUEST" });
    }

    // Soft delete the product
    await SoftDeleteService.deleteProduct(id, userId);

    logger.info({ 
      productId: id, 
      productName: product.name,
      userId,
      userRole: user.role
    }, 'Product soft deleted by super admin');

    return jsonOk({ 
      message: "Product deleted successfully",
      productId: id 
    });
  } catch (error) {
    return handleException(error, "Failed to delete product", 500);
  }
}
