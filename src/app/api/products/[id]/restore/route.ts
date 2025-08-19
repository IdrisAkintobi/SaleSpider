import { PrismaClient, Role } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SoftDeleteService } from "@/lib/soft-delete";
import { logger } from "@/lib/logger";

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
    // Check if product exists and is deleted
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

    if (!product.deletedAt) {
      return NextResponse.json(
        { message: "Product is not deleted" },
        { status: 400 }
      );
    }

    // Restore the product
    await SoftDeleteService.restoreProduct(id, userId);

    logger.info({ 
      productId: id, 
      productName: product.name,
      userId,
      userRole: user.role
    }, 'Product restored by super admin');

    return NextResponse.json({ 
      message: "Product restored successfully",
      productId: id 
    });
  } catch (error) {
    logger.error({ 
      productId: id, 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'Failed to restore product');
    
    return NextResponse.json(
      { message: "Failed to restore product" },
      { status: 500 }
    );
  }
}
