import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { createChildLogger } from "@/lib/logger";
import { SoftDeleteService } from "@/lib/soft-delete";
import { AuditTrailService } from "@/lib/audit-trail";
const prisma = new PrismaClient();

const logger = createChildLogger('api:products:id');

// Function to get product by ID
export async function GET(
  request: Request,
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
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    logger.error({ productId: id, error: error instanceof Error ? error.message : 'Unknown error' }, 'Error fetching product');
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// Function to update product by ID
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updateData = await request.json();

  // Read the X-User-Id header set by the middleware
  const userId = (request as NextRequest).headers.get("X-User-Id");

  if (!userId) {
    // fallback safety check.
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || user.role === Role.CASHIER) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if product exists before update
    const productExists = await prisma.product.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!productExists) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Validate quantity if provided
    if (
      updateData.quantity !== undefined &&
      typeof updateData.quantity !== "number"
    ) {
      return NextResponse.json(
        { message: "Invalid quantity provided" },
        { status: 400 }
      );
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

    // Log audit trail with only changed fields (more efficient)
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

    return NextResponse.json(updatedProduct);
  } catch (error) {
    logger.error({ productId: id, userId, error: error instanceof Error ? error.message : 'Unknown error' }, 'Error updating product');
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// Function to soft delete product by ID (Super Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Read the X-User-Id header set by the middleware
  const userId = (request as NextRequest).headers.get("X-User-Id");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== Role.SUPER_ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if product exists and is not already deleted
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, deletedAt: true }
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.deletedAt) {
      return NextResponse.json(
        { message: "Product is already deleted" },
        { status: 400 }
      );
    }

    // Soft delete the product
    await SoftDeleteService.deleteProduct(id, userId);

    logger.info({ 
      productId: id, 
      productName: product.name,
      userId,
      userRole: user.role
    }, 'Product soft deleted by super admin');

    return NextResponse.json({ 
      message: "Product deleted successfully",
      productId: id 
    });
  } catch (error) {
    logger.error({ 
      productId: id, 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'Failed to delete product');
    
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
