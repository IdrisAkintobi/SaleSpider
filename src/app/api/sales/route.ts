import { PrismaClient, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // Read the X-User-Id header set by the middleware
  const userId = req.headers.get("X-User-Id");

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Fetch the user to check their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    let sales: any[];

    if (user.role === Role.CASHIER) {
      // Cashiers can only see their own sales
      sales = await prisma.sale.findMany({
        where: {
          cashierId: userId,
          deletedAt: null,
        },
        include: {
          cashier: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Managers and Super Admins can see all sales
      sales = await prisma.sale.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          cashier: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // Transform the data to match frontend expectations
    const transformedSales = sales.map((sale: any) => ({
      id: sale.id,
      cashierId: sale.cashierId,
      cashierName: sale.cashier.name,
      totalAmount: sale.totalAmount,
      paymentMode: sale.paymentMode,
      timestamp: new Date(sale.createdAt).getTime(), // Convert to timestamp
      items: sale.items.map((item: any) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    return NextResponse.json(transformedSales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { message: "Failed to fetch sales" },
      { status: 500 }
    );
  }
} 