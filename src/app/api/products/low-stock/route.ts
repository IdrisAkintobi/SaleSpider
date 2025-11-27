import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Read the X-User-Id header set by the middleware
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user to check their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only managers and super admins can view low stock alerts
    if (user.role === "CASHIER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
