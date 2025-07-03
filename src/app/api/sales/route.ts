import { PrismaClient, Role, PaymentMode } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { calculateSaleTotals } from "@/lib/vat";

const prisma = new PrismaClient();

// Helper function to map payment mode string to enum
function mapPaymentMode(paymentModeString: string): PaymentMode {
  const mapping: Record<string, PaymentMode> = {
    "Cash": PaymentMode.CASH,
    "Card": PaymentMode.CARD,
    "Bank Transfer": PaymentMode.BANK_TRANSFER,
    "Crypto": PaymentMode.CRYPTO,
    "Other": PaymentMode.OTHER,
  };
  
  return mapping[paymentModeString] || PaymentMode.CASH;
}

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

export async function POST(req: NextRequest) {
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

  // Only cashiers can record sales
  if (user.role !== Role.CASHIER) {
    return NextResponse.json({ message: "Only cashiers can record sales" }, { status: 403 });
  }

  try {
    const { cashierId, items, totalAmount, paymentMode } = await req.json();

    // Validate input
    if (!cashierId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount || !paymentMode) {
      return NextResponse.json({ message: "Invalid sale data" }, { status: 400 });
    }

    // Verify cashier ID matches the authenticated user
    if (cashierId !== userId) {
      return NextResponse.json({ message: "Cashier ID mismatch" }, { status: 403 });
    }

    // Validate items and check stock
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json({ message: `Product ${item.productId} not found` }, { status: 404 });
      }

      if (product.quantity < item.quantity) {
        return NextResponse.json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` 
        }, { status: 400 });
      }
    }

    // Calculate subtotal from items
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate VAT totals
    const saleTotals = calculateSaleTotals(subtotal);

    // Map payment mode to enum
    const mappedPaymentMode = mapPaymentMode(paymentMode);

    // Create the sale and update stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the sale
      const sale = await tx.sale.create({
        data: {
          cashierId,
          subtotal: saleTotals.subtotal,
          vatAmount: saleTotals.vatAmount,
          vatPercentage: saleTotals.vatPercentage,
          totalAmount: saleTotals.totalAmount,
          paymentMode: mappedPaymentMode,
        },
      });

      // Create sale items and update product stock
      for (const item of items) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return sale;
    });

    return NextResponse.json({ 
      id: result.id,
      message: "Sale recorded successfully" 
    });

  } catch (error) {
    console.error("Error recording sale:", error);
    return NextResponse.json(
      { message: "Failed to record sale" },
      { status: 500 }
    );
  }
} 