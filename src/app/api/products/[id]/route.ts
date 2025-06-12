import { PrismaClient, Role } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

// Get product by ID
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
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// Update product by ID
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

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.quantity !== undefined && {
          quantity: {
            increment: updateData.quantity,
          },
        }),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}
