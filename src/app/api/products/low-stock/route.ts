import { isErrorResponse, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userOrError = await requireAuth(request, [
      Role.MANAGER,
      Role.SUPER_ADMIN,
    ]);
    if (isErrorResponse(userOrError)) {
      return userOrError;
    }

    // Get products where quantity <= lowStockMargin
    // Using raw query since Prisma doesn't support comparing two fields directly
    const products = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        quantity: number;
        lowStockMargin: number;
        category: string;
        price: number;
      }>
    >`
      SELECT "id", "name", "quantity", "lowStockMargin", "category", "price"
      FROM "Product"
      WHERE "deletedAt" IS NULL
        AND "quantity" <= "lowStockMargin"
      ORDER BY "quantity" ASC
      LIMIT 50
    `;

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    return NextResponse.json(
      { error: "Failed to fetch low stock products" },
      { status: 500 }
    );
  }
}
